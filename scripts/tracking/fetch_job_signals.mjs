import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PAGE_TIMEOUT_MS, fetchText, outputDate, rawDir as resolveRawDir } from "./tracking_utils.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..", "..");
const sourcesPath = path.join(root, "news-tracking", "jobs-tracking.json");
const runsDir = path.join(root, "runs");
const publicSignalsPath = path.join(root, "public", "data", "signals.json");

function rawDir(date = outputDate()) {
  return resolveRawDir(runsDir, date);
}

function jobsArticlesPath(date = outputDate()) {
  return path.join(rawDir(date), "jobs-signals.json");
}

function stripHtml(html = "") {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z]+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function countSignals(text, signalKeywords) {
  const counts = {};
  for (const signal of signalKeywords) {
    let count = 0;
    for (const pattern of signal.patterns) {
      const matches = text.match(new RegExp(pattern, "ig"));
      if (matches) count += matches.length;
    }
    counts[signal.key] = count;
  }
  return counts;
}

async function fetchCompany(company, signalKeywords) {
  try {
    const html = await fetchText(company.url, PAGE_TIMEOUT_MS, "CTTD Job Signals Tracker");
    const text = stripHtml(html);
    const counts = countSignals(text, signalKeywords);
    return {
      name: company.name,
      url: company.url,
      area: company.area,
      category: company.category,
      status: "ok",
      counts,
      textLength: text.length,
    };
  } catch (error) {
    return {
      name: company.name,
      url: company.url,
      area: company.area,
      category: company.category,
      status: "error",
      counts: {},
      error: error.message,
    };
  }
}

function aggregateSignalTotals(results, signalKeywords) {
  return signalKeywords.map((signal) => {
    const breakdown = [];
    let total = 0;
    for (const result of results) {
      const count = result.counts?.[signal.key] || 0;
      if (count > 0) breakdown.push({ company: result.name, count });
      total += count;
    }
    return {
      key: signal.key,
      label: signal.label,
      total,
      breakdown: breakdown.sort((a, b) => b.count - a.count),
    };
  }).sort((a, b) => b.total - a.total);
}

async function main() {
  const date = outputDate();
  await fs.mkdir(rawDir(date), { recursive: true });
  const sources = JSON.parse(await fs.readFile(sourcesPath, "utf8"));
  const signalKeywords = sources.signalKeywords || [];
  const results = [];

  for (const company of sources.companies || []) {
    if (!company.url) continue;
    console.log(`Fetching ${company.name} careers...`);
    const result = await fetchCompany(company, signalKeywords);
    results.push(result);
  }

  const signals = aggregateSignalTotals(results, signalKeywords);
  const payload = {
    generatedAt: new Date().toISOString(),
    sourceFile: "news-tracking/jobs-tracking.json",
    signals,
    companies: results,
  };

  const outputPath = jobsArticlesPath(date);
  await fs.writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  await fs.writeFile(publicSignalsPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

  console.log(`Aggregated ${signals.length} signal categories from ${results.length} companies`);
  console.log(`Saved raw to ${outputPath}`);
  console.log(`Saved public signals to ${publicSignalsPath}`);
  console.log("Note: 채용 공고는 sourceTier=discovery 데이터. 메인 매거진 글로 발행하지 않고 /signals 사이드 위젯으로만 노출.");
}

main().catch((error) => {
  console.error("Failed to fetch job signals:", error);
  process.exit(1);
});
