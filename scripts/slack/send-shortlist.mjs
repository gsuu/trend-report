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

// URL 정규화: shortlist 와 source-verification 의 인코딩 차이를 흡수
function normalizeUrl(url) {
  if (!url) return '';
  let s = url.trim();
  try { s = decodeURI(s); } catch {}
  s = s.replace(/\/+$/, ''); // trailing slash 제거
  return s.toLowerCase();
}

// source-verification-{service,design,dev}.json 을 모두 읽어
// URL → 원문 title 매핑을 만든다.
//
// shortlist 자체가 원문 제목을 유지하는 게 원칙(digest-collect SKILL.md Phase 5,
// docs/magazine-writing-standard.md "타이틀 작성 원칙"). 이 매핑은 그 룰을
// 어긴 옛 shortlist 가 들어왔을 때를 위한 안전장치.
async function loadOriginalTitleMap(dateDir) {
  const map = new Map();
  for (const cat of ['service', 'design', 'dev']) {
    const filePath = path.join(RUNS_DIR, dateDir, 'magazine', `source-verification-${cat}.json`);
    try {
      const raw = await fs.readFile(filePath, 'utf8');
      const arr = JSON.parse(raw);
      if (!Array.isArray(arr)) continue;
      for (const entry of arr) {
        if (!entry?.title) continue;
        if (entry.link) map.set(normalizeUrl(entry.link), entry.title);
        if (entry.finalSourceUrl) map.set(normalizeUrl(entry.finalSourceUrl), entry.title);
      }
    } catch {
      // 파일 없거나 파싱 실패 — 매핑 없이 진행
    }
  }
  return map;
}

function priorityEmoji(priority) {
  if (priority.startsWith('P0')) return '🔴';
  if (priority.startsWith('P1')) return '🟡';
  return '🟢';
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

  // 원문 제목 매핑 적용 — 매니저는 매거진 편집 전 원문 제목으로 판단
  const titleMap = await loadOriginalTitleMap(latest.date);
  let mappedCount = 0;
  for (const item of items) {
    const original = item.url && titleMap.get(normalizeUrl(item.url));
    if (original) {
      item.title = original;
      mappedCount++;
    }
  }
  console.log(`총 ${items.length}건 파싱 완료 (원문 제목 매핑: ${mappedCount}/${items.length}건)`);

  const blocks = buildBlocks(latest.date, items);
  const result = await slackPost({
    channel: SLACK_MANAGER_CHANNEL,
    blocks,
    text: `📋 매거진 후보 shortlist — ${latest.date} (${items.length}건)`,
  });

  console.log(`Slack 메시지 전송 완료: ${result.ts}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
