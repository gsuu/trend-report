// scripts/collect/index.mjs
// 진입점 — 워크플로우 오케스트레이션
//
// 사용:
//   node scripts/collect/index.mjs                  # 풀 모드 (ANTHROPIC_API_KEY 필요)
//   node scripts/collect/index.mjs --no-ai          # AI 호출 없이 RSS+dedup만 검증
//   node scripts/collect/index.mjs --preview        # report.json 덮어쓰지 않고 preview로 저장

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "yaml";
import pLimit from "p-limit";

import { fetchSource, previouslySeenLinks } from "./fetch.mjs";
import { isoWeekSlug, persistWeekly } from "./store.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..", "..");
const DATA_DIR = path.join(ROOT, "src", "data");
const SOURCES_PATH = path.join(ROOT, "config", "sources.yaml");

const argv = new Set(process.argv.slice(2));
const NO_AI = argv.has("--no-ai");
const PREVIEW = argv.has("--preview");

const MAX_PARALLEL_FETCH = 6;
const MAX_PARALLEL_ENRICH = 4;
const MAX_EDITORIAL_PER_RUN = 10;
const PREVIEW_TOP_N = 12;

async function main() {
  const startedAt = new Date();
  const slug = isoWeekSlug(startedAt);
  console.log(`[collect] ${slug} 시작 — ${startedAt.toISOString()}`);
  console.log(`[collect] 모드: ${NO_AI ? "NO-AI" : "FULL"} ${PREVIEW ? "+ PREVIEW" : ""}`);

  // 0) 설정 로드
  const config = yaml.parse(await fs.readFile(SOURCES_PATH, "utf8"));
  const since = new Date(startedAt);
  since.setDate(since.getDate() - (config.defaults?.freshnessDays ?? 7));
  const seenLinks = NO_AI ? new Set() : await previouslySeenLinks(DATA_DIR);
  if (NO_AI) console.log("[collect] no-ai 모드: dedup 스킵 (모든 후보 노출)");

  // 1) RSS fetch (병렬)
  const fetchLimit = pLimit(MAX_PARALLEL_FETCH);
  const candidatesNested = await Promise.all(
    config.sources.map((source) =>
      fetchLimit(() => fetchSource({ ...config.defaults, ...source }, since)),
    ),
  );
  const allCandidates = candidatesNested
    .flat()
    .filter((c) => c.link && !seenLinks.has(c.link));
  console.log(`[collect] 후보 ${allCandidates.length}건`);

  // 소스별 통계 출력
  const bySource = {};
  for (const c of allCandidates) bySource[c.sourceName] = (bySource[c.sourceName] ?? 0) + 1;
  for (const [name, count] of Object.entries(bySource).sort((a, b) => b[1] - a[1])) {
    console.log(`         ${count.toString().padStart(3)}건  ${name}`);
  }

  if (!allCandidates.length) {
    console.log("[collect] 신규 후보 없음 — 종료");
    return;
  }

  // ────────── NO-AI 분기 ──────────
  if (NO_AI) {
    const issues = makeStubIssues(allCandidates.slice(0, PREVIEW_TOP_N), startedAt);
    const weekly = makeWeekly(slug, startedAt, issues, "(미리보기, AI 미적용)");
    await persistPreview(weekly, slug);
    console.log(`[collect] no-ai 미리보기 저장 — ${issues.length} stub issues`);
    return;
  }

  // ────────── FULL 모드 (AI) ──────────
  const { filterCandidates } = await import("./filter.mjs");
  const { enrichArticle } = await import("./enrich.mjs");
  const { generateEditorial } = await import("./editorial.mjs");

  // 2) Stage 1 필터
  const verdicts = await filterCandidates(allCandidates);
  console.log(`[collect] 필터 통과 ${verdicts.length}건`);
  if (!verdicts.length) {
    console.log("[collect] 통과 항목 없음 — 종료");
    return;
  }

  // 3) 메타 보강 (병렬, 상위 N건)
  const top = verdicts.sort((a, b) => b.relevance - a.relevance).slice(0, MAX_EDITORIAL_PER_RUN);
  const candidateById = new Map(allCandidates.map((c) => [c.id, c]));
  const enrichLimit = pLimit(MAX_PARALLEL_ENRICH);
  const enriched = (
    await Promise.all(
      top.map((v) =>
        enrichLimit(() => {
          const candidate = candidateById.get(v.id);
          return candidate ? enrichArticle(candidate, v) : null;
        }),
      ),
    )
  ).filter(Boolean);
  console.log(`[collect] 보강 성공 ${enriched.length}건`);

  // 4) Stage 2 풍부 에디토리얼 (직렬)
  const issues = [];
  let n = 1;
  for (const article of enriched) {
    const editorial = await generateEditorial(article);
    if (!editorial) continue;
    issues.push({
      id: article.id,
      number: String(n).padStart(2, "0"),
      date: startedAt.toISOString().slice(0, 10),
      route: `/articles/${String(n).padStart(2, "0")}`,
      image: article.ogImage,
      sourceUrl: article.link,
      sourceTitle: article.sourceName,
      ...editorial,
    });
    n += 1;
  }
  console.log(`[collect] 에디토리얼 생성 ${issues.length}건`);
  if (!issues.length) return;

  // 5) 저장
  const weekly = makeWeekly(slug, startedAt, issues);
  if (PREVIEW) {
    await persistPreview(weekly, slug);
    console.log(`[collect] preview 모드 — report.json 변경 안 함`);
  } else {
    await persistWeekly(weekly, DATA_DIR);
    console.log(`[collect] ${slug} 저장 완료 — ${issues.length} issues`);
  }
}

function makeWeekly(slug, startedAt, issues, descriptionSuffix = "") {
  const [year, weekPart] = slug.split("-W");
  return {
    slug,
    title: `CTTD Trend Magazine — ${slug}`,
    description: `${slug} 주간 트렌드 매거진${descriptionSuffix ? " " + descriptionSuffix : ""}`,
    weekLabel: `${year}년 ${parseInt(weekPart, 10)}주차`,
    publishedAt: startedAt.toISOString().slice(0, 10),
    issues,
  };
}

/**
 * AI 없이 RSS 데이터만으로 stub issue 생성 — 구조 검증 용도
 */
function makeStubIssues(candidates, startedAt) {
  return candidates.map((c, i) => {
    const n = String(i + 1).padStart(2, "0");
    return {
      id: c.id,
      number: n,
      platform: c.sourceName,
      areaKey: c.sourceCategory,
      area: { design: "Design", service: "Service", dev: "DEV" }[c.sourceCategory] || c.sourceCategory,
      categoryKey: "preview",
      category: "(미리보기)",
      date: startedAt.toISOString().slice(0, 10),
      route: `/articles/${n}`,
      image: c.image || "",
      imageCaption: "",
      tags: ["미리보기"],
      takeawayHtml: escapeText(c.title),
      deckHtml: escapeText(c.contentSnippet || c.title),
      sourceUrl: c.link,
      sourceTitle: c.sourceName,
      referenceLinks: [],
      sections: [
        {
          title: "RSS 발췌",
          className: "article-section",
          prose: false,
          blocks: [
            { kind: "list", html: `발행일: ${escapeText(c.pubDate)}` },
            { kind: "list", html: `소스: ${escapeText(c.sourceName)} (${c.sourceCategory})` },
            { kind: "list", html: `요약: ${escapeText((c.contentSnippet || "").slice(0, 280))}` },
          ],
        },
      ],
    };
  });
}

function escapeText(s = "") {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Preview 저장: src/data/preview/{slug}.json + report.preview.json
 * 실제 manifest/report.json은 건드리지 않음
 */
async function persistPreview(weekly, slug) {
  const previewDir = path.join(DATA_DIR, "preview");
  await fs.mkdir(previewDir, { recursive: true });
  const previewPath = path.join(previewDir, `${slug}.json`);
  const reportPreviewPath = path.join(DATA_DIR, "report.preview.json");
  await fs.writeFile(previewPath, JSON.stringify(weekly, null, 2), "utf8");
  await fs.writeFile(reportPreviewPath, JSON.stringify(weekly, null, 2), "utf8");
  console.log(`[collect] preview 파일:`);
  console.log(`           ${path.relative(ROOT, previewPath)}`);
  console.log(`           ${path.relative(ROOT, reportPreviewPath)}`);
}

main().catch((err) => {
  console.error("[collect] 실패:", err);
  process.exit(1);
});
