/**
 * 최신 shortlist를 찾아 Slack Block Kit 메시지(버튼 포함)로 발송한다.
 * GHA weekly-shortlist-slack.yml에서 호출.
 *
 * 매니저는 슬랙에서 ✅/❌ 토글, ➕ 항목 추가 모달, ✔️ 확정 버튼으로 조작.
 * 확정 시 api/slack-interaction.js 가 slack-shortlist-update.yml 워크플로를 트리거한다.
 */
import fs from 'node:fs/promises';
import path from 'node:path';

const RUNS_DIR = path.join(process.cwd(), 'runs');
const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;
const SLACK_MANAGER_CHANNEL = process.env.SLACK_MANAGER_CHANNEL;

async function slackPost(body) {
  const res = await fetch('https://slack.com/api/chat.postMessage', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      Authorization: `Bearer ${SLACK_BOT_TOKEN}`,
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!data.ok) throw new Error(`Slack API error: ${data.error}`);
  return data;
}

async function findLatestShortlist() {
  const entries = await fs.readdir(RUNS_DIR);
  const dateDirs = entries
    .filter(e => /^\d{4}-\d{2}-\d{2}$/.test(e))
    .sort()
    .reverse();

  for (const dateDir of dateDirs) {
    const filePath = path.join(RUNS_DIR, dateDir, 'magazine', 'shortlist-20-30.md');
    try {
      await fs.access(filePath);
      return { date: dateDir, filePath };
    } catch {
      // not found
    }
  }
  return null;
}

function parseShortlistItems(content) {
  const cutIdx = content.indexOf('\n## 수집했지만 제외한 것');
  const body = cutIdx >= 0 ? content.slice(0, cutIdx) : content;

  const items = [];
  const headerRe = /^### (\d+)\. \[([^\]]+)\] (.+)$/gm;
  let m;
  while ((m = headerRe.exec(body)) !== null) {
    const num = parseInt(m[1], 10);
    const meta = m[2];
    const title = m[3].trim();
    const category = meta.split('/')[0].trim().toUpperCase();

    const startIdx = m.index;
    const nextIdx = body.indexOf('\n### ', startIdx + 4);
    const section = nextIdx >= 0 ? body.slice(startIdx, nextIdx) : body.slice(startIdx);

    const priorityM = section.match(/\*\*우선순위\*\*:\s*([^\n]+)/);
    const priority = priorityM ? priorityM[1].trim() : '';
    const urlM = section.match(/\*\*최종 기준 원문\*\*:\s*<([^>]+)>/);
    const url = urlM ? urlM[1].trim() : '';

    items.push({ num, category, title, priority, url });
  }
  return items;
}

// 후보 발굴 — '수집했지만 제외한 것' 섹션의 4컬럼 표(다시 볼 조건 컬럼 포함)에서
// 조건이 명시된 항목만 추출. 매니저가 슬랙에서 ✅ 복원으로 다시 살릴 수 있다.
// 3컬럼 표(다시 볼 조건 없음)와 조건이 '—'·빈 값인 row 는 확실 제외로 보고 스킵.
function parseAmbiguousCandidates(content) {
  const cutIdx = content.indexOf('\n## 수집했지만 제외한 것');
  if (cutIdx < 0) return [];
  const lines = content.slice(cutIdx).split('\n');

  const candidates = [];
  let cnum = 0;
  let currentCat = null;
  let colCount = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const catM = line.match(/^### (SERVICE|DESIGN|DEV)\b/);
    if (catM) {
      currentCat = catM[1];
      colCount = 0;
      if (i + 2 < lines.length && lines[i + 2].startsWith('|---')) {
        colCount = (lines[i + 2].match(/\|/g)?.length ?? 0) - 1;
      }
      continue;
    }
    if (!currentCat || colCount < 4) continue;
    if (!line.startsWith('|') || line.startsWith('|---') || line.startsWith('| 출처')) continue;

    const cells = line.split('|').slice(1, -1).map(s => s.trim());
    if (cells.length < 4) continue;
    const [source, title, reason, cond] = cells;
    if (!cond || cond === '—' || cond === '-' || cond === '') continue;
    if (reason === '매니저 검토 제외') continue; // 매니저가 직접 제외한 건 자동 후보로 다시 넣지 않음

    cnum++;
    candidates.push({ cnum, category: currentCat, title, source, condition: cond });
  }
  return candidates;
}

// URL 정규화: shortlist 와 source-verification 의 인코딩 차이를 흡수
function normalizeUrl(url) {
  if (!url) return '';
  let s = url.trim();
  try { s = decodeURI(s); } catch {}
  s = s.replace(/\/+$/, ''); // trailing slash 제거
  return s.toLowerCase();
}

// source-verification-{service,design,dev}.json 을 모두 읽어
// URL → 원문 title 매핑과 title → URL 역방향 매핑을 함께 만든다.
//
// URL → title: shortlist 자체가 원문 제목을 유지하는 게 원칙(digest-collect SKILL.md
//   Phase 5). 이 매핑은 그 룰을 어긴 옛 shortlist 가 들어왔을 때를 위한 안전장치.
// title → URL: '수집했지만 제외한 것' 섹션 후보를 슬랙에 표시할 때 원문 링크를
//   붙이기 위함.
async function loadVerificationMaps(dateDir) {
  const urlToTitle = new Map();
  const titleToUrl = new Map();
  for (const cat of ['service', 'design', 'dev']) {
    const filePath = path.join(RUNS_DIR, dateDir, 'magazine', `source-verification-${cat}.json`);
    try {
      const raw = await fs.readFile(filePath, 'utf8');
      const arr = JSON.parse(raw);
      if (!Array.isArray(arr)) continue;
      for (const entry of arr) {
        if (!entry?.title) continue;
        const preferredUrl = entry.finalSourceUrl || entry.link;
        if (entry.link) urlToTitle.set(normalizeUrl(entry.link), entry.title);
        if (entry.finalSourceUrl) urlToTitle.set(normalizeUrl(entry.finalSourceUrl), entry.title);
        if (preferredUrl) titleToUrl.set(entry.title.trim(), preferredUrl);
      }
    } catch {
      // 파일 없거나 파싱 실패 — 매핑 없이 진행
    }
  }
  return { urlToTitle, titleToUrl };
}

function priorityEmoji(priority) {
  if (priority.startsWith('P0')) return '🔴';
  if (priority.startsWith('P1')) return '🟡';
  return '🟢';
}

function buildCandidateBlocks(candidates, titleToUrl) {
  if (candidates.length === 0) return [];
  const blocks = [
    { type: 'divider' },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text:
          '*— 후보 (다시 볼 만한 제외 항목) —*\n' +
          '기본 ❌ 제외 상태. 살릴 항목만 토글하세요. (확실한 제외건은 표시 안 됨)',
      },
    },
  ];

  let currentCategory = '';
  for (const c of candidates) {
    if (c.category !== currentCategory) {
      currentCategory = c.category;
      blocks.push({
        type: 'section',
        text: { type: 'mrkdwn', text: `*${currentCategory} 후보*` },
      });
    }
    const url = titleToUrl.get(c.title.trim());
    const urlPart = url ? `\n<${url}|원문 보기>` : '';
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*C${c.cnum}.* [${c.category}] ${c.title}${urlPart}\n_조건: ${c.condition}_`,
      },
      accessory: {
        type: 'button',
        text: { type: 'plain_text', text: '❌ 제외' },
        style: 'danger',
        action_id: 'toggle_item',
        value: `c${c.cnum}:exclude`,
      },
    });
  }
  return blocks;
}

function buildBlocks(date, items) {
  const counts = { SERVICE: 0, DESIGN: 0, DEV: 0 };
  items.forEach(i => { if (counts[i.category] !== undefined) counts[i.category]++; });

  const blocks = [
    {
      type: 'header',
      text: { type: 'plain_text', text: `📋 매거진 후보 shortlist — ${date}` },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text:
          `SERVICE *${counts.SERVICE}건* · DESIGN *${counts.DESIGN}건* · DEV *${counts.DEV}건* = 총 *${items.length}건*\n` +
          '각 항목 옆 버튼으로 포함/제외를 토글하고, 하단에서 *항목 추가*도 가능합니다.',
      },
    },
    { type: 'divider' },
  ];

  let currentCategory = '';
  for (const item of items) {
    if (item.category !== currentCategory) {
      currentCategory = item.category;
      blocks.push({
        type: 'section',
        text: { type: 'mrkdwn', text: `*— ${item.category} —*` },
      });
    }
    const emoji = priorityEmoji(item.priority);
    const urlPart = item.url ? `\n<${item.url}|원문 보기>` : '';
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*${item.num}.* ${emoji} ${item.title}${urlPart}`,
      },
      accessory: {
        type: 'button',
        text: { type: 'plain_text', text: '✅ 포함' },
        style: 'primary',
        action_id: 'toggle_item',
        value: `${item.num}:include`,
      },
    });
  }

  blocks.push({ type: 'divider' });
  blocks.push({
    type: 'context',
    elements: [{ type: 'mrkdwn', text: `shortlist 날짜: ${date}` }],
  });
  blocks.push({
    type: 'actions',
    elements: [
      {
        type: 'button',
        text: { type: 'plain_text', text: '✔️ 확정 및 반영' },
        style: 'primary',
        action_id: 'confirm_shortlist',
        confirm: {
          title: { type: 'plain_text', text: '확정하시겠습니까?' },
          text: { type: 'mrkdwn', text: '제외/이동/추가 표시가 모두 shortlist 파일에 반영됩니다.' },
          confirm: { type: 'plain_text', text: '확정' },
          deny: { type: 'plain_text', text: '취소' },
        },
      },
      {
        type: 'button',
        text: { type: 'plain_text', text: '📂 카테고리 이동' },
        action_id: 'move_category',
      },
      {
        type: 'button',
        text: { type: 'plain_text', text: '➕ 항목 추가' },
        action_id: 'add_item',
      },
    ],
  });

  return blocks;
}

async function main() {
  if (!SLACK_BOT_TOKEN) throw new Error('SLACK_BOT_TOKEN is not set');
  if (!SLACK_MANAGER_CHANNEL) throw new Error('SLACK_MANAGER_CHANNEL is not set');

  const latest = await findLatestShortlist();
  if (!latest) {
    console.error('shortlist 파일을 찾을 수 없습니다.');
    process.exit(1);
  }

  console.log(`shortlist 발견: ${latest.filePath}`);
  const content = await fs.readFile(latest.filePath, 'utf8');
  const items = parseShortlistItems(content);

  if (items.length === 0) {
    console.error('파싱된 항목이 없습니다.');
    process.exit(1);
  }

  // source-verification 매핑 로드
  const { urlToTitle, titleToUrl } = await loadVerificationMaps(latest.date);

  // 메인 항목의 제목을 원문 제목으로 보정 (안전장치)
  let mappedCount = 0;
  for (const item of items) {
    const original = item.url && urlToTitle.get(normalizeUrl(item.url));
    if (original) {
      item.title = original;
      mappedCount++;
    }
  }

  // 애매한 후보 추출 (수집했지만 제외한 것 중 다시 볼 조건이 있는 행)
  const candidates = parseAmbiguousCandidates(content);
  console.log(
    `메인 ${items.length}건 (원문 매핑 ${mappedCount}/${items.length}) + 애매 후보 ${candidates.length}건`,
  );

  const mainBlocks = buildBlocks(latest.date, items);
  const candidateBlocks = buildCandidateBlocks(candidates, titleToUrl);

  // 액션 블록을 후보 블록 뒤로 옮긴다
  const actionsBlockIdx = mainBlocks.findIndex(b => b.type === 'actions');
  const blocks = actionsBlockIdx >= 0
    ? [
        ...mainBlocks.slice(0, actionsBlockIdx),
        ...candidateBlocks,
        ...mainBlocks.slice(actionsBlockIdx),
      ]
    : [...mainBlocks, ...candidateBlocks];

  const result = await slackPost({
    channel: SLACK_MANAGER_CHANNEL,
    blocks,
    text: `📋 매거진 후보 shortlist — ${latest.date} (메인 ${items.length}건 + 후보 ${candidates.length}건)`,
  });

  console.log(`Slack 메시지 전송 완료: ${result.ts}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
