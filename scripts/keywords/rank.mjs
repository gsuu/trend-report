// 키워드도구 원자료 → 전국 Top N / 시·도별 Top N 순위 산출과 Markdown 렌더링. 네트워크 없는 순수 함수만 둔다.
import { parseCount } from "./naver_searchad.mjs";

export function normalizeKeyword(keyword = "") {
  return String(keyword).replace(/\s+/g, "").toLowerCase();
}

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// 설정의 문자열은 부분 문자열 매칭, "/.../" 형태는 정규식으로 해석한다.
export function compilePatterns(list = []) {
  return list.map((entry) => {
    const text = String(entry);
    const regex = text.match(/^\/(.+)\/([a-z]*)$/);
    return regex ? new RegExp(regex[1], regex[2]) : new RegExp(escapeRegExp(normalizeKeyword(text)));
  });
}

export function matchesAny(text, patterns = []) {
  return patterns.some((pattern) => pattern.test(text));
}

export function compileConfig(config) {
  return {
    include: compilePatterns(config.relevance?.include || []),
    exclude: compilePatterns(config.relevance?.exclude || []),
    regions: (config.regions || []).map((region) => ({
      ...region,
      aliasKeys: [...new Set(region.aliases.map(normalizeKeyword).filter(Boolean))],
    })),
  };
}

export function isStudioRelated(keyword, compiled) {
  const text = normalizeKeyword(keyword);
  return matchesAny(text, compiled.include) && !matchesAny(text, compiled.exclude);
}

// 키워드에 포함된 지역 별칭으로 시·도 id 목록을 돌려준다. 여러 지역에 걸치면 모두 포함.
export function detectRegions(keyword, compiled) {
  const text = normalizeKeyword(keyword);
  return compiled.regions
    .filter((region) => region.aliasKeys.some((alias) => text.includes(alias)))
    .map((region) => region.id);
}

// 여러 호출 결과를 키워드 기준으로 합친다. 같은 키워드는 검색수가 같으므로 큰 값만 남긴다.
export function mergeRows(rawRows = []) {
  const merged = new Map();
  for (const row of rawRows) {
    const key = normalizeKeyword(row.relKeyword);
    if (!key) continue;
    const pc = parseCount(row.monthlyPcQcCnt);
    const mobile = parseCount(row.monthlyMobileQcCnt);
    const current = merged.get(key);
    if (!current) {
      merged.set(key, {
        keyword: String(row.relKeyword).trim(),
        pc,
        mobile,
        total: pc + mobile,
        pcDisplay: String(row.monthlyPcQcCnt ?? ""),
        mobileDisplay: String(row.monthlyMobileQcCnt ?? ""),
        compIdx: row.compIdx || "",
        pcClicks: Number(row.monthlyAvePcClkCnt) || 0,
        mobileClicks: Number(row.monthlyAveMobileClkCnt) || 0,
        hints: new Set(row.__hints || []),
      });
      continue;
    }
    if (pc + mobile > current.total) {
      Object.assign(current, { pc, mobile, total: pc + mobile, pcDisplay: String(row.monthlyPcQcCnt ?? ""), mobileDisplay: String(row.monthlyMobileQcCnt ?? "") });
    }
    if (!current.compIdx && row.compIdx) current.compIdx = row.compIdx;
    for (const hint of row.__hints || []) current.hints.add(hint);
  }
  return [...merged.values()].map((row) => ({ ...row, hints: [...row.hints].sort() }));
}

export function sortByVolume(rows) {
  return [...rows].sort((a, b) => b.total - a.total || b.mobile - a.mobile || a.keyword.localeCompare(b.keyword, "ko"));
}

// 전국 = 지역 별칭이 없는 키워드, 지역 = 해당 시·도 별칭을 포함한 키워드. 두 목록은 겹치지 않는다.
export function buildRanking(rawRows, config, { limit = config.limit || 30 } = {}) {
  const compiled = compileConfig(config);
  const merged = mergeRows(rawRows);
  const related = merged
    .filter((row) => isStudioRelated(row.keyword, compiled))
    .map((row) => ({ ...row, regions: detectRegions(row.keyword, compiled) }));

  const nationalCandidates = sortByVolume(related.filter((row) => row.regions.length === 0));
  const regional = compiled.regions.map((region) => {
    const candidates = sortByVolume(related.filter((row) => row.regions.includes(region.id)));
    return {
      id: region.id,
      label: region.label,
      candidateCount: candidates.length,
      totalVolume: candidates.reduce((sum, row) => sum + row.total, 0),
      items: candidates.slice(0, limit),
    };
  });

  return {
    limit,
    counts: {
      raw: rawRows.length,
      merged: merged.length,
      related: related.length,
      national: nationalCandidates.length,
      regional: related.length - nationalCandidates.length,
    },
    national: nationalCandidates.slice(0, limit),
    regional,
    related,
  };
}

const formatNumber = (value) => Number(value || 0).toLocaleString("ko-KR");
const cell = (value = "") => String(value).replace(/\|/g, "\\|");
// "< 10"은 그대로, 숫자 문자열은 천 단위 구분해 표시한다.
const formatCount = (display = "") => {
  const text = String(display).trim();
  if (!text || text.startsWith("<")) return text || "-";
  const number = Number(text.replace(/,/g, ""));
  return Number.isFinite(number) ? formatNumber(number) : text;
};

function keywordTable(items) {
  const lines = [
    "| 순위 | 키워드 | 월간 검색수 | PC | 모바일 | 경쟁도 |",
    "|---:|---|---:|---:|---:|:---:|",
  ];
  items.forEach((row, index) => {
    lines.push(
      `| ${index + 1} | ${cell(row.keyword)} | ${formatNumber(row.total)} | ${formatCount(row.pcDisplay)} | ${formatCount(row.mobileDisplay)} | ${cell(row.compIdx || "-")} |`,
    );
  });
  if (!items.length) lines.push("| - | (후보 없음) | - | - | - | - |");
  return lines.join("\n");
}

export function renderMarkdown(result, { date, source, fetchedAt, hintCount, callCount, failedCalls = 0 } = {}) {
  const regionalSummary = [...result.regional]
    .sort((a, b) => b.totalVolume - a.totalVolume)
    .map((region, index) => `| ${index + 1} | ${region.label} | ${formatNumber(region.totalVolume)} | ${region.candidateCount} | ${region.items[0] ? cell(region.items[0].keyword) : "-"} |`);

  const lines = [
    `# 스튜디오·촬영 키워드 Top ${result.limit} (${date})`,
    "",
    `> 소스: ${source} · 수집 ${fetchedAt} · 힌트 키워드 ${hintCount}개 / API 호출 ${callCount}회${failedCalls ? ` (실패 ${failedCalls}회)` : ""}`,
    "> 월간 검색수는 최근 30일 네이버 통합검색 기준(PC+모바일). `< 10`은 0으로 계산해 정렬했다.",
    "> 전국 = 17개 시·도 지역명(주요 지구 포함)이 들어가지 않은 키워드, 지역 = 해당 시·도 지역명이 들어간 키워드. 두 표는 겹치지 않는다.",
    `> 후보 통계: 원자료 ${formatNumber(result.counts.raw)}행 → 중복 제거 ${formatNumber(result.counts.merged)} → 스튜디오·촬영 관련 ${formatNumber(result.counts.related)} (전국 후보 ${formatNumber(result.counts.national)} / 지역 후보 ${formatNumber(result.counts.regional)})`,
    "",
    `## 전국 Top ${result.limit}`,
    "",
    keywordTable(result.national),
    "",
    "## 지역 요약 (시·도별 검색수 합계)",
    "",
    "| 순위 | 시·도 | 관련 키워드 검색수 합계 | 후보 수 | 1위 키워드 |",
    "|---:|---|---:|---:|---|",
    ...regionalSummary,
    "",
    `## 지역 Top ${result.limit}`,
    "",
  ];

  for (const region of result.regional) {
    lines.push(`### ${region.label} (후보 ${region.candidateCount}개 · 합계 ${formatNumber(region.totalVolume)})`, "", keywordTable(region.items), "");
  }

  lines.push(
    "---",
    "",
    "관련성 판정과 지역 별칭은 `config/keywords/studio-keywords.json`에서 조정한다. 원자료로 다시 렌더링: `npm run keywords:studio -- --from=runs/" + date + "/keywords/studio-keywords-raw.json`",
    "",
  );
  return lines.join("\n");
}
