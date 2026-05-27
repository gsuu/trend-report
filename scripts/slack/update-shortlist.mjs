/**
 * 슬랙 매니저 검토 결과를 shortlist-20-30.md에 반영한다.
 * GHA slack-shortlist-update.yml 에서 호출 (api/slack-interaction.js 가 트리거).
 *
 * 환경변수:
 *   DATE            - 대상 날짜 (YYYY-MM-DD)
 *   EXCLUDED_ITEMS  - 제외할 항목 번호, 쉼표 구분 (예: "2,5")
 *   ADDED_ITEMS     - 추가 항목 JSON 배열 (예: '[{"url":"...","title":"...","category":"SERVICE"}]')
 *   MOVED_ITEMS     - 카테고리 이동 JSON 배열 (예: '[{"num":5,"to":"DEV"}]')
 */
import fs from 'node:fs/promises';
import path from 'node:path';

const DATE = process.env.DATE;
const EXCLUDED_ITEMS = process.env.EXCLUDED_ITEMS || '';
const ADDED_ITEMS_RAW = process.env.ADDED_ITEMS || '[]';
const MOVED_ITEMS_RAW = process.env.MOVED_ITEMS || '[]';

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

  let movedItems = [];
  try {
    movedItems = JSON.parse(MOVED_ITEMS_RAW);
  } catch {
    console.warn('MOVED_ITEMS 파싱 실패, 이동 항목 없음');
  }

  if (excludedNums.length === 0 && addedItems.length === 0 && movedItems.length === 0) {
    console.log('변경 사항 없음.');
    return;
  }

  if (excludedNums.length > 0) {
    content = moveToExcluded(content, excludedNums);
    console.log(`제외 처리: ${excludedNums.join(', ')}번 항목`);
  }

  if (movedItems.length > 0) {
    content = applyCategoryMoves(content, movedItems);
    console.log(`카테고리 이동: ${movedItems.length}건`);
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

  for (const [cat, newRows] of Object.entries(rowsByCategory)) {
    if (newRows.length === 0) continue;

    if (hasCutSection) {
      const cutIdx = result.indexOf(cutMarker);
      const catMarker = `### ${cat}`;
      const catIdx = result.indexOf(catMarker, cutIdx);

      if (catIdx >= 0) {
        // 기존 표가 있다 — 컬럼 수에 맞춰 새 row 를 변환하고, 헤더의 건수도 갱신
        const headerLine = result.slice(catIdx, result.indexOf('\n', catIdx));
        const cntM = headerLine.match(/^### (\S+)\s*\((\d+)건([^)]*)\)/);
        const existingCount = cntM ? parseInt(cntM[2], 10) : 0;
        const headerSuffix = cntM ? (cntM[3] ?? '') : '';

        // 컬럼 수 감지 — 구분선 |---|---|---| 또는 |---|---|---|---| 등을 카운트
        const sepLineStart = result.indexOf('\n|---', catIdx);
        const sepLineEnd = sepLineStart >= 0 ? result.indexOf('\n', sepLineStart + 1) : -1;
        const sepLine = sepLineStart >= 0 && sepLineEnd >= 0
          ? result.slice(sepLineStart + 1, sepLineEnd)
          : '';
        const colCount = sepLine ? (sepLine.match(/\|/g)?.length ?? 0) - 1 : 4;

        // 새 row 를 기존 컬럼 수에 맞게 변환 (출처/제목/사유[/다시 볼 조건])
        const conformedRows = newRows.map(row => {
          const cells = row.split('|').map(s => s.trim()).filter((_, i, a) => i > 0 && i < a.length - 1);
          // cells = [출처, 제목, 사유, 다시 볼 조건]
          const trimmed = cells.slice(0, colCount);
          while (trimmed.length < colCount) trimmed.push('—');
          return `| ${trimmed.join(' | ')} |`;
        });

        // 표의 마지막 row 다음, 다음 섹션 직전에 삽입
        const tableEndCandidates = [
          result.indexOf('\n\n', sepLineEnd >= 0 ? sepLineEnd : catIdx),
          result.indexOf('\n### ', sepLineEnd >= 0 ? sepLineEnd : catIdx),
          result.indexOf('\n---', sepLineEnd >= 0 ? sepLineEnd : catIdx),
        ].filter(p => p > 0);
        const insertAt = tableEndCandidates.length ? Math.min(...tableEndCandidates) : result.length;

        result =
          result.slice(0, insertAt) +
          '\n' + conformedRows.join('\n') +
          result.slice(insertAt);

        // 헤더의 (N건) → (N+newRows.length건)
        if (cntM) {
          const newHeader = `### ${cntM[1]} (${existingCount + newRows.length}건${headerSuffix})`;
          result = result.slice(0, catIdx) + newHeader + result.slice(catIdx + headerLine.length);
        }
      } else {
        // cut 섹션은 있지만 해당 카테고리 표가 없다 — 표 새로 생성
        const tableHeader =
          `### ${cat} (${newRows.length}건)\n| 출처 | 제목 | 사유 | 다시 볼 조건 |\n|---|---|---|---|\n`;
        const newSection = '\n\n' + tableHeader + newRows.join('\n');
        const cutPos = cutIdx + cutMarker.length;
        result = result.slice(0, cutPos) + '\n' + newSection + result.slice(cutPos);
      }
    } else {
      // cut 섹션 자체가 없다 — 통째로 생성
      const tableHeader =
        `### ${cat} (${newRows.length}건)\n| 출처 | 제목 | 사유 | 다시 볼 조건 |\n|---|---|---|---|\n`;
      result =
        result.trimEnd() + '\n\n---\n\n## 수집했지만 제외한 것\n\n' + tableHeader + newRows.join('\n') + '\n';
    }
  }

  return result;
}

// 카테고리 이동: 헤더의 [Category / ...] 첫 토큰만 새 카테고리로 교체.
// 항목 자체의 마크다운 위치는 유지(번호도 그대로) — 슬랙 메시지의 순서와도
// 정합성 유지. 단지 메타 라벨이 바뀌고 글쓰기 단계에서 새 카테고리 룰을 따른다.
function applyCategoryMoves(content, movedItems) {
  let result = content;
  for (const { num, to } of movedItems) {
    const target = String(to).trim().toUpperCase();
    if (!['SERVICE', 'DESIGN', 'DEV'].includes(target)) {
      console.warn(`이동 대상 카테고리 무효: ${to}, ${num}번 스킵`);
      continue;
    }
    // 헤더: ### N. [CategoryName / sub / tags] Title
    //  prefix = "### N. ["
    //  oldCat = "Service" (혹은 "Design", "DEV")
    //  rest   = " / sub / tags] " (선행 공백·슬래시·닫는 괄호 포함)
    //  title  = "..."
    const headerRe = new RegExp(`^(### ${num}\\. \\[)([A-Za-z]+)(\\s*\\/[^\\]]+\\] )(.+)$`, 'm');
    const m = headerRe.exec(result);
    if (!m) {
      console.warn(`${num}번 항목 헤더를 찾을 수 없습니다.`);
      continue;
    }
    const [whole, prefix, , rest, title] = m;
    const newHeader = `${prefix}${capitalize(target)}${rest}${title}`;
    result = result.slice(0, m.index) + newHeader + result.slice(m.index + whole.length);
  }
  return result;
}

function capitalize(s) {
  // SERVICE → Service, DESIGN → Design, DEV → DEV (DEV는 대문자 유지)
  if (s === 'DEV') return 'DEV';
  return s.charAt(0) + s.slice(1).toLowerCase();
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
