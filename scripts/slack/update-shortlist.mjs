/**
 * 슬랙 매니저 검토 결과를 shortlist-20-30.md에 반영한다.
 * GHA slack-shortlist-update.yml 에서 호출 (api/slack-interaction.js 가 트리거).
 *
 * 환경변수:
 *   DATE            - 대상 날짜 (YYYY-MM-DD)
 *   EXCLUDED_ITEMS  - 제외할 항목 번호, 쉼표 구분 (예: "2,5")
 *   ADDED_ITEMS     - 추가 항목 JSON 배열 (예: '[{"url":"...","title":"...","category":"SERVICE"}]')
 */
import fs from 'node:fs/promises';
import path from 'node:path';

const DATE = process.env.DATE;
const EXCLUDED_ITEMS = process.env.EXCLUDED_ITEMS || '';
const ADDED_ITEMS_RAW = process.env.ADDED_ITEMS || '[]';

if (!DATE) {
  console.error('DATE 환경변수가 필요합니다.');
  process.exit(1);
}

const SHORTLIST_PATH = path.join(
  process.cwd(),
  'runs',
  DATE,
  'magazine',
  'shortlist-20-30.md',
);

async function main() {
  let content;
  try {
    content = await fs.readFile(SHORTLIST_PATH, 'utf8');
  } catch (err) {
    if (err.code === 'ENOENT') {
      const runsDir = path.join(process.cwd(), 'runs');
      let available = [];
      try {
        const entries = await fs.readdir(runsDir);
        for (const dir of entries.sort().reverse()) {
          if (!/^\d{4}-\d{2}-\d{2}$/.test(dir)) continue;
          try {
            await fs.access(path.join(runsDir, dir, 'magazine', 'shortlist-20-30.md'));
            available.push(dir);
            if (available.length >= 5) break;
          } catch {}
        }
      } catch {}
      console.error(`shortlist 파일을 찾을 수 없습니다: ${SHORTLIST_PATH}`);
      console.error(`최근 shortlist 가 있는 날짜: ${available.join(', ') || '(없음)'}`);
      console.error(`수동 실행 시 위 날짜 중 하나를 'date' 입력값으로 사용하세요.`);
      process.exit(1);
    }
    throw err;
  }

  const excludedNums = EXCLUDED_ITEMS
    ? EXCLUDED_ITEMS.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n))
    : [];

  let addedItems = [];
  try {
    addedItems = JSON.parse(ADDED_ITEMS_RAW);
  } catch {
    console.warn('ADDED_ITEMS 파싱 실패, 추가 항목 없음');
  }

  if (excludedNums.length === 0 && addedItems.length === 0) {
    console.log('변경 사항 없음.');
    return;
  }

  if (excludedNums.length > 0) {
    content = moveToExcluded(content, excludedNums);
    console.log(`제외 처리: ${excludedNums.join(', ')}번 항목`);
  }

  if (addedItems.length > 0) {
    content = appendManagerAdded(content, addedItems);
    console.log(`추가 요청: ${addedItems.length}건`);
  }

  await fs.writeFile(SHORTLIST_PATH, content, 'utf8');
  console.log(`shortlist 업데이트 완료: ${SHORTLIST_PATH}`);
}

function extractItemSection(content, num) {
  const headerRe = new RegExp(`^### ${num}\\. \\[([^\\]]+)\\] (.+)$`, 'm');
  const match = headerRe.exec(content);
  if (!match) return null;

  const start = match.index;
  const afterStart = content.slice(start + 1);
  const nextItemM = afterStart.match(/\n### \d+\. |\n## /);
  const end = nextItemM ? start + 1 + nextItemM.index + 1 : content.length;

  return {
    full: content.slice(start, end),
    meta: match[1].trim(),
    title: match[2].trim(),
    start,
    end,
  };
}

function moveToExcluded(content, excludedNums) {
  const cutMarker = '\n## 수집했지만 제외한 것';
  const hasCutSection = content.includes(cutMarker);
  const rowsByCategory = { SERVICE: [], DESIGN: [], DEV: [] };

  let result = content;
  const sorted = [...excludedNums].sort((a, b) => b - a);

  for (const num of sorted) {
    const section = extractItemSection(result, num);
    if (!section) {
      console.warn(`${num}번 항목을 찾을 수 없습니다.`);
      continue;
    }

    const category = section.meta.split('/')[0].trim().toUpperCase();
    const urlM = section.full.match(/\*\*최종 기준 원문\*\*:\s*<([^>]+)>/);
    const url = urlM ? urlM[1] : '';
    const domain = url ? new URL(url).hostname.replace('www.', '') : '-';
    const bucket = rowsByCategory[category] || rowsByCategory.SERVICE;
    bucket.push(`| ${domain} | ${section.title} | 매니저 검토 제외 | — |`);

    result = result.slice(0, section.start).trimEnd() + '\n\n' + result.slice(section.end);
  }

  for (const [cat, rows] of Object.entries(rowsByCategory)) {
    if (rows.length === 0) continue;
    const tableHeader =
      `### ${cat} (${rows.length}건)\n| 출처 | 제목 | 사유 | 다시 볼 조건 |\n|---|---|---|---|\n`;
    const newSection = '\n\n' + tableHeader + rows.join('\n');

    if (hasCutSection) {
      const catMarker = `### ${cat}`;
      const catIdx = result.indexOf(catMarker, result.indexOf(cutMarker));
      if (catIdx >= 0) {
        const tableBodyStart = result.indexOf('\n|---|', catIdx);
        if (tableBodyStart >= 0) {
          const nextSection = result.indexOf('\n### ', tableBodyStart + 1);
          const insertAt = nextSection >= 0 ? nextSection : result.indexOf('\n---', tableBodyStart);
          const pos = insertAt >= 0 ? insertAt : result.length;
          result = result.slice(0, pos) + '\n' + rows.join('\n') + result.slice(pos);
        }
      } else {
        const cutPos = result.indexOf(cutMarker) + cutMarker.length;
        result = result.slice(0, cutPos) + '\n' + newSection + result.slice(cutPos);
      }
    } else {
      result = result.trimEnd() + '\n\n---\n\n## 수집했지만 제외한 것\n' + newSection;
    }
  }

  return result;
}

function appendManagerAdded(content, addedItems) {
  const lines = ['', '---', '', '## 매니저 추가 요청', ''];
  lines.push('> 슬랙에서 추가 요청된 항목입니다. 원문 검증 후 shortlist에 편입하거나 제외 이동하세요.');
  lines.push('');

  for (const item of addedItems) {
    lines.push(`- **[${item.category || '미지정'}]** ${item.title || '(제목 미입력)'}`);
    if (item.url) lines.push(`  - 원문: <${item.url}>`);
  }

  return content.trimEnd() + '\n' + lines.join('\n') + '\n';
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
