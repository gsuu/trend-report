// 스튜디오·촬영 키워드 전국 Top 30 + 17개 시·도별 Top 30 수집.
//
//   npm run keywords:studio                         # 오늘 날짜 폴더에 수집
//   npm run keywords:studio -- --date=2026-09-30    # 날짜 지정
//   npm run keywords:studio -- --regions=서울,부산    # 일부 지역만 (전국은 항상 포함)
//   npm run keywords:studio -- --national-only | --regional-only
//   npm run keywords:studio -- --from=runs/2026-09-30/keywords/studio-keywords-raw.json   # 재요청 없이 설정만 바꿔 다시 순위 산출
//
// 산출물: runs/YYYY-MM-DD/keywords/
//   studio-keywords-raw.json           키워드도구 응답 원자료(힌트별 병합 전)
//   studio-keywords.json               전국/지역 Top N + 관련 후보 전체
//   studio-keywords.md                 사람이 읽는 표
//   studio-keywords-fetch-report.json  호출 수·실패·소요 시간
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { argValue, hasFlag, loadDotenv, repoRoot } from "./env.mjs";
import { MAX_HINTS_PER_CALL, chunk, hasSearchAdCredentials, normalizeHint, relatedKeywords } from "./naver_searchad.mjs";
import { buildRanking, renderMarkdown } from "./rank.mjs";

const configPath = path.join(repoRoot, "config", "keywords", "studio-keywords.json");
const runsDir = path.join(repoRoot, "runs");
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function outputDate() {
  return argValue("--date", (process.env.TRACKING_OUTPUT_DATE || new Date().toISOString().slice(0, 10)).trim());
}

function selectedRegions(config) {
  const wanted = argValue("--regions", "");
  if (!wanted) return config.regions;
  const labels = new Set(wanted.split(",").map((value) => value.trim()).filter(Boolean));
  const picked = config.regions.filter((region) => labels.has(region.label) || labels.has(region.id));
  if (!picked.length) throw new Error(`--regions에 맞는 지역이 없습니다: ${wanted}`);
  return picked;
}

// 힌트 그룹: 전국 시드 + (지역 별칭 앞 N개 × 지역 시드 용어). 각 그룹은 5개씩 끊어 호출한다.
function buildHintGroups(config, regions) {
  const groups = [];
  if (!hasFlag("--regional-only")) {
    groups.push({ scope: "national", label: "전국", hints: config.national.seeds.map(normalizeHint) });
  }
  if (!hasFlag("--national-only")) {
    const aliasLimit = config.regional.seedAliasLimit || 4;
    for (const region of regions) {
      const hints = [];
      for (const alias of region.aliases.slice(0, aliasLimit)) {
        for (const term of config.regional.seedTerms) hints.push(normalizeHint(`${alias}${term}`));
      }
      groups.push({ scope: "regional", label: region.label, hints });
    }
  }
  return groups;
}

async function fetchRawRows(config, regions) {
  const groups = buildHintGroups(config, regions);
  const calls = [];
  const rows = [];
  let failed = 0;
  const startedAt = Date.now();

  for (const group of groups) {
    for (const hints of chunk([...new Set(group.hints)], MAX_HINTS_PER_CALL)) {
      const call = { scope: group.scope, label: group.label, hints, rows: 0, error: null };
      try {
        const list = await relatedKeywords(hints);
        call.rows = list.length;
        for (const row of list) rows.push({ ...row, __hints: hints });
        console.log(`✔ ${group.label} [${hints.join(", ")}] → ${list.length}건`);
      } catch (error) {
        failed += 1;
        call.error = error.message;
        console.error(`✘ ${group.label} [${hints.join(", ")}] → ${error.message}`);
      }
      calls.push(call);
      await sleep(config.requestDelayMs || 300);
    }
  }

  return {
    rows,
    report: {
      hintCount: groups.reduce((sum, group) => sum + new Set(group.hints).size, 0),
      callCount: calls.length,
      failedCalls: failed,
      durationMs: Date.now() - startedAt,
      calls,
    },
  };
}

async function loadRawFile(fromPath) {
  const absolute = path.isAbsolute(fromPath) ? fromPath : path.join(repoRoot, fromPath);
  const data = JSON.parse(await fs.readFile(absolute, "utf8"));
  const rows = Array.isArray(data) ? data : data.rows;
  if (!Array.isArray(rows)) throw new Error(`--from 파일에 rows 배열이 없습니다: ${fromPath}`);
  return { rows, report: data.report || { hintCount: 0, callCount: 0, failedCalls: 0, durationMs: 0, calls: [], reusedFrom: fromPath } };
}

async function main() {
  loadDotenv();
  const config = JSON.parse(await fs.readFile(configPath, "utf8"));
  const date = outputDate();
  const outDir = path.join(runsDir, date, "keywords");
  const fromPath = argValue("--from", "");
  const limit = Number(argValue("--limit", config.limit || 30));
  const regions = selectedRegions(config);

  let rows;
  let report;
  if (fromPath) {
    ({ rows, report } = await loadRawFile(fromPath));
    console.log(`원자료 재사용: ${fromPath} (${rows.length}행)`);
  } else {
    if (!hasSearchAdCredentials()) {
      console.error(
        "네이버 검색광고 API 키가 없어 수집을 건너뜁니다. .env에 NAVER_SEARCHAD_API_KEY / NAVER_SEARCHAD_SECRET_KEY / NAVER_SEARCHAD_CUSTOMER_ID를 넣으세요 (.env.example 참고).",
      );
      process.exitCode = 2;
      return;
    }
    ({ rows, report } = await fetchRawRows(config, regions));
    if (!rows.length) {
      console.error("키워드도구 응답이 비었습니다. fetch report를 확인하세요.");
      process.exitCode = 1;
    }
  }

  const fetchedAt = new Date().toISOString();
  const scopedConfig = { ...config, regions };
  const result = buildRanking(rows, scopedConfig, { limit });
  const meta = { date, source: "네이버 검색광고 키워드도구(연관키워드)", fetchedAt, hintCount: report.hintCount, callCount: report.callCount, failedCalls: report.failedCalls };

  await fs.mkdir(outDir, { recursive: true });
  if (!fromPath) {
    await fs.writeFile(path.join(outDir, "studio-keywords-raw.json"), JSON.stringify({ date, fetchedAt, rows, report }, null, 2), "utf8");
  }
  await fs.writeFile(
    path.join(outDir, "studio-keywords.json"),
    JSON.stringify(
      {
        date,
        fetchedAt,
        source: config.source,
        limit,
        counts: result.counts,
        national: result.national,
        regional: result.regional.map(({ items, ...region }) => ({ ...region, items })),
        related: result.related,
      },
      null,
      2,
    ),
    "utf8",
  );
  await fs.writeFile(path.join(outDir, "studio-keywords.md"), renderMarkdown(result, meta), "utf8");
  await fs.writeFile(path.join(outDir, "studio-keywords-fetch-report.json"), JSON.stringify({ date, fetchedAt, ...report }, null, 2), "utf8");

  console.log("");
  console.log(`전국 Top ${limit}: ${result.national.length}개 (후보 ${result.counts.national})`);
  for (const region of result.regional) {
    console.log(`${region.label} Top ${limit}: ${region.items.length}개 (후보 ${region.candidateCount}, 합계 ${region.totalVolume.toLocaleString("ko-KR")})`);
  }
  console.log(`\n산출물: ${path.relative(repoRoot, outDir)}/studio-keywords.md`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(`✘ ${error.message}`);
    process.exitCode = 1;
  });
}
