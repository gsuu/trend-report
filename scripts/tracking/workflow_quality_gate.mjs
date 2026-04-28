import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { outputDate } from "./tracking_utils.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..", "..");
const runsDir = path.join(root, "runs");

function argValue(name, fallback = "") {
  const prefix = `${name}=`;
  const match = process.argv.find((arg) => arg.startsWith(prefix));
  return match ? match.slice(prefix.length) : fallback;
}

function hasArg(name) {
  return process.argv.includes(name);
}

function runDir(date) {
  return path.join(runsDir, date);
}

function trackingDataPath(date) {
  return path.join(runDir(date), "tracking-data.json");
}

function workflowStatePath(date) {
  return path.join(runDir(date), "tracking-quality-state.json");
}

function outputDirRelative(filePath) {
  return path.relative(root, filePath).replaceAll("\\", "/");
}

function isValidUrl(value) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function normalizeText(value) {
  return String(value || "").trim();
}

function requiredFields(article) {
  return {
    title: normalizeText(article.title),
    link: normalizeText(article.link),
    source: normalizeText(article.source),
    area: normalizeText(article.area),
    category: normalizeText(article.category),
  };
}

function checkArticle(article, index, seen) {
  const issues = [];
  const fields = requiredFields(article);
  const missing = Object.entries(fields)
    .filter(([, value]) => !value)
    .map(([name]) => name);

  if (missing.length) {
    issues.push({
      level: "error",
      articleIndex: index + 1,
      message: `필수 필드 누락: ${missing.join(", ")}`,
      articleTitle: fields.title || "제목 없음",
    });
  }

  if (fields.link && !isValidUrl(fields.link)) {
    issues.push({
      level: "error",
      articleIndex: index + 1,
      message: "링크 형식이 유효하지 않습니다",
      articleTitle: fields.title || "제목 없음",
    });
  }

  if (fields.link) {
    if (seen.links.has(fields.link)) {
      issues.push({
        level: "warn",
        articleIndex: index + 1,
        message: "링크 중복",
        articleTitle: fields.title || "제목 없음",
      });
    } else {
      seen.links.add(fields.link);
    }
  }

  const titleKey = fields.title.toLowerCase();
  if (titleKey) {
    if (seen.titles.has(titleKey)) {
      issues.push({
        level: "warn",
        articleIndex: index + 1,
        message: "제목 중복",
        articleTitle: fields.title || "제목 없음",
      });
    } else {
      seen.titles.add(titleKey);
    }
  }

  if (fields.source === "") {
    issues.push({
      level: "warn",
      articleIndex: index + 1,
      message: "source 값이 비어 있습니다",
      articleTitle: fields.title || "제목 없음",
    });
  }

  if (!/^(service|design|dev)$/i.test(fields.area)) {
    issues.push({
      level: "warn",
      articleIndex: index + 1,
      message: `area 값이 권장값(service/design/dev)과 다릅니다: ${fields.area || "빈 값"}`,
      articleTitle: fields.title || "제목 없음",
    });
  }

  if (fields.category === "") {
    issues.push({
      level: "warn",
      articleIndex: index + 1,
      message: "category 값이 비어 있습니다",
      articleTitle: fields.title || "제목 없음",
    });
  }

  if (normalizeText(article.summary).length < 10) {
    issues.push({
      level: "warn",
      articleIndex: index + 1,
      message: "summary 길이가 짧아 본문 보강이 필요할 수 있습니다",
      articleTitle: fields.title || "제목 없음",
    });
  }

  return issues;
}

function classify(items) {
  const counts = items.reduce((acc, item) => {
    const key = item.machineStatus === "candidate" ? "candidate" : "nonCandidate";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return {
    total: items.length,
    candidate: counts.candidate || 0,
    nonCandidate: counts.nonCandidate || 0,
  };
}

async function main() {
  const date = argValue("--date", outputDate()).trim();
  const strict = hasArg("--strict");
  const dataPath = trackingDataPath(date);
  const statePath = workflowStatePath(date);

  let runData;
  try {
    runData = JSON.parse(await fs.readFile(dataPath, "utf8"));
  } catch {
    console.error(`tracking-data를 읽을 수 없습니다: ${dataPath}`);
    process.exit(1);
  }

  const articles = Array.isArray(runData.articles) ? runData.articles : [];

  const seen = {
    links: new Set(),
    titles: new Set(),
  };

  const issueEntries = [];
  for (const [index, article] of articles.entries()) {
    issueEntries.push(...checkArticle(article, index, seen));
  }

  const errorCount = issueEntries.filter((issue) => issue.level === "error").length;
  const warnCount = issueEntries.filter((issue) => issue.level === "warn").length;
  const status = errorCount > 0 ? "fail" : warnCount > 0 ? "warn" : "ok";

  const checks = {
    date,
    status,
    summary: {
      ...classify(articles),
      issues: {
        error: errorCount,
        warn: warnCount,
      },
    },
    runDataFiles: {
      trackingData: outputDirRelative(dataPath),
      editorialBrief: outputDirRelative(runData.editorialBriefPath || path.join(runDir(date), "editorial-brief.md")),
      report: outputDirRelative(path.join(runDir(date), "magazine-report.md")),
    },
    checks: {
      strict,
      candidateRatio: articles.length ? (classify(articles).candidate / articles.length) : 0,
    },
    issues: issueEntries,
  };

  await fs.mkdir(runDir(date), { recursive: true });
  await fs.writeFile(statePath, `${JSON.stringify(checks, null, 2)}\n`, "utf-8");

  console.log(`tracking-data: ${outputDirRelative(dataPath)}`);
  console.log(`workflow-state: ${outputDirRelative(statePath)}`);
  console.log(`진행 상태: ${status}`);
  console.log(`총 아티클: ${checks.summary.total} / 후보: ${checks.summary.candidate} / 제외: ${checks.summary.nonCandidate}`);
  console.log(`이슈: error=${errorCount}, warn=${warnCount}`);

  if (status === "fail" && strict) {
    process.exitCode = 1;
    return;
  }
}

main().catch((error) => {
  console.error(`quality gate 실행 실패: ${error.message}`);
  process.exit(1);
});
