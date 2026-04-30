// scripts/collect/manual.mjs
// 수동 AI 모드 — RSS fetch 한 번 + AI 1회 + build 한 번
// build: OG 이미지 자동 추출 + 관련 서비스 정보 첨부

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "yaml";
import pLimit from "p-limit";

import { fetchSource, previouslySeenLinks } from "./fetch.mjs";
import { isoWeekSlug, persistWeekly } from "./store.mjs";
import { fetchOgImage } from "./og-image.mjs";
import { attachRelatedService } from "./related-service.mjs";
import { FILTER_SYSTEM_PROMPT, EDITORIAL_SYSTEM_PROMPT } from "./prompts.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..", "..");
const DATA_DIR = path.join(ROOT, "src", "data");
const PUBLIC_DIR = path.join(ROOT, "public", "data");
const SOURCES_PATH = path.join(ROOT, "config", "sources.yaml");
const TMP_DIR = path.join(ROOT, "tmp", "collect");
const OG_CACHE_PATH = path.join(TMP_DIR, "og-cache.json");

const MAX_PARALLEL_FETCH = 6;
const MAX_PARALLEL_OG = 5;
const SNIPPET_MAX_LEN = 500;

const subcommand = process.argv[2] || "fetch";
const argv = new Set(process.argv.slice(3));
const SKIP_OG = argv.has("--no-og");

if (subcommand === "fetch") await fetchPhase();
else if (subcommand === "build") await buildPhase();
else { console.error(`알 수 없는 명령: ${subcommand}`); process.exit(1); }

async function fetchPhase() {
  const startedAt = new Date();
  const slug = isoWeekSlug(startedAt);
  console.log(`[manual:fetch] ${slug} 시작`);
  await fs.mkdir(TMP_DIR, { recursive: true });

  const config = yaml.parse(await fs.readFile(SOURCES_PATH, "utf8"));
  const since = new Date(startedAt);
  since.setDate(since.getDate() - (config.defaults?.freshnessDays ?? 7));
  const seenLinks = await previouslySeenLinks(DATA_DIR);

  const fetchLimit = pLimit(MAX_PARALLEL_FETCH);
  const candidatesNested = await Promise.all(
    config.sources.map((source) =>
      fetchLimit(() => fetchSource({ ...config.defaults, ...source }, since)),
    ),
  );
  const candidates = candidatesNested.flat().filter((c) => c.link && !seenLinks.has(c.link));

  const bySource = {};
  for (const c of candidates) bySource[c.sourceName] = (bySource[c.sourceName] ?? 0) + 1;
  console.log(`[manual:fetch] 후보 ${candidates.length}건 (dedup 후)`);
  for (const [name, count] of Object.entries(bySource).sort((a, b) => b[1] - a[1])) {
    console.log(`              ${count.toString().padStart(3)}건  ${name}`);
  }
  if (!candidates.length) { console.log("[manual:fetch] 신규 후보 없음 — 종료"); return; }

  const candidatesPath = path.join(TMP_DIR, "candidates.json");
  await fs.writeFile(candidatesPath, JSON.stringify(candidates, null, 2), "utf8");

  const state = {
    slug,
    weekLabel: `${slug.split("-W")[0]}년 ${parseInt(slug.split("-W")[1], 10)}주차`,
    publishedAt: startedAt.toISOString().slice(0, 10),
    generatedAt: startedAt.toISOString(),
    candidateCount: candidates.length,
  };
  await fs.writeFile(path.join(TMP_DIR, "state.json"), JSON.stringify(state, null, 2), "utf8");

  await fs.writeFile(path.join(TMP_DIR, "mega-prompt.md"), buildMegaPrompt(candidates, state), "utf8");

  console.log("");
  console.log(`[manual:fetch] ✓ ${path.relative(ROOT, candidatesPath)}`);
  console.log("[manual:fetch] 다음: Cowork에 '이번 주 매거진 빌드해줘' 또는 mega-prompt.md를 AI에 붙여넣고 npm run collect:build");
}

async function buildPhase() {
  console.log("[manual:build] 시작");

  const issues = JSON.parse(await fs.readFile(path.join(TMP_DIR, "issues.json"), "utf8")).map((issue, i) => {
    const n = String(i + 1).padStart(2, "0");
    return { number: n, route: `/articles/${n}`, ...issue };
  });
  const state = JSON.parse(await fs.readFile(path.join(TMP_DIR, "state.json"), "utf8"));

  if (!Array.isArray(issues) || !issues.length) {
    throw new Error("tmp/collect/issues.json 이 비어있거나 배열이 아닙니다");
  }

  // 1) OG 이미지 보강
  if (!SKIP_OG) await enrichWithOgImages(issues);
  else console.log("[manual:build] --no-og 옵션: OG 이미지 추출 skip");

  // 2) 관련 서비스 정보 첨부
  let attached = 0;
  for (const issue of issues) if (attachRelatedService(issue)) attached += 1;
  console.log(`[related-service] ${attached}/${issues.length}건에 서비스 정보 추가`);

  const weekly = {
    slug: state.slug,
    title: `CTTD Trend Magazine — ${state.slug}`,
    description: `${state.slug} 주간 트렌드 매거진 (Service / Design / DEV)`,
    weekLabel: state.weekLabel,
    publishedAt: state.publishedAt,
    issues,
  };

  await persistWeekly(weekly, DATA_DIR, PUBLIC_DIR);

  console.log(`[manual:build] ✓ src/data/weekly/${state.slug}.json (${issues.length} issues)`);
  console.log(`[manual:build] ✓ src/data/manifest.json`);
  console.log(`[manual:build] ✓ src/data/report.json`);
  console.log(`[manual:build] ✓ public/data/magazine.json (Vue가 fetch하는 파일)`);
  console.log(`[manual:build] ✓ public/data/reports.json`);
  console.log("[manual:build] 완료. git add . && git commit && git push 로 배포하세요.");
}

async function enrichWithOgImages(issues) {
  let cache = {};
  try { cache = JSON.parse(await fs.readFile(OG_CACHE_PATH, "utf8")); } catch {}
  const targets = issues.filter((i) => !i.image && i.sourceUrl);
  if (!targets.length) { console.log("[og-image] 모든 아티클이 이미 image 보유 — skip"); return; }

  console.log(`[og-image] ${targets.length}건 보강 시도 (캐시 ${Object.keys(cache).length}건 보유)`);
  const limit = pLimit(MAX_PARALLEL_OG);
  let cached = 0, fetched = 0, failed = 0;

  await Promise.all(targets.map((issue) => limit(async () => {
    if (cache[issue.sourceUrl]) { issue.image = cache[issue.sourceUrl]; cached += 1; return; }
    const og = await fetchOgImage(issue.sourceUrl);
    if (og) { cache[issue.sourceUrl] = og; issue.image = og; fetched += 1; }
    else { failed += 1; }
  })));

  await fs.mkdir(path.dirname(OG_CACHE_PATH), { recursive: true });
  await fs.writeFile(OG_CACHE_PATH, JSON.stringify(cache, null, 2), "utf8");
  console.log(`[og-image] 캐시 hit: ${cached} / 신규 fetch: ${fetched} / 실패(picsum fallback): ${failed}`);
}

function buildMegaPrompt(candidates, state) {
  const slimmed = candidates.map((c) => ({
    id: c.id, title: c.title,
    snippet: (c.contentSnippet || "").slice(0, SNIPPET_MAX_LEN),
    source: c.sourceName, sourceCategoryHint: c.sourceCategory,
    locale: c.locale, link: c.link, image: c.image, pubDate: c.pubDate,
  }));
  return [
    `# CTTD Trend Magazine — ${state.slug} Mega-Prompt`,
    "",
    `> ${state.weekLabel} 매거진. 응답을 tmp/collect/issues.json 에 저장 후 npm run collect:build`,
    "",
    "## Filter System Prompt", "", FILTER_SYSTEM_PROMPT,
    "", "## Editorial System Prompt", "", EDITORIAL_SYSTEM_PROMPT,
    "", "## 작업 지시", "",
    `위 시스템 프롬프트 둘을 통합해 후보 ${slimmed.length}건 중 관련도 6 이상만 필터링하고 상위 8~12건에 풍부 에디토리얼을 작성해 JSON 배열로 반환. 각 issue에 id, date(${state.publishedAt}), image, sourceUrl, sourceTitle 포함.`,
    "", `## Input Candidates (${slimmed.length}건)`, "",
    "```json", JSON.stringify(slimmed, null, 2), "```",
  ].join("\n");
}
