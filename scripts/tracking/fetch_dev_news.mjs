import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Parser from "rss-parser";
import {
  FEED_TIMEOUT_MS,
  articleContent,
  evaluateSignalScore,
  fetchText,
  matchesAny,
  matchesNone,
  mergeScoring,
  outputDate,
  rawDir as resolveRawDir,
  sinceDate,
  uniqueArticles,
} from "./tracking_utils.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..", "..");
const sourcesPath = path.join(root, "news-tracking", "dev-sources.json");
const runsDir = path.join(root, "runs");
const parser = new Parser();

function rawDir(date = outputDate()) {
  return resolveRawDir(runsDir, date);
}

function devArticlesPath(date = outputDate()) {
  return path.join(rawDir(date), "dev-articles.json");
}

function devFetchReportPath(date = outputDate()) {
  return path.join(rawDir(date), "dev-fetch-report.json");
}

async function fetchRssFeed(source, since, scoring) {
  try {
    const xml = await fetchText(source.rss, FEED_TIMEOUT_MS, "CTTD Trend Report DEV RSS Tracker");
    const feed = await parser.parseString(xml);
    const articles = [];
    let skippedByScore = 0;
    for (const item of feed.items) {
      if (!item.pubDate) continue;
      const pubDate = new Date(item.pubDate);
      if (Number.isNaN(pubDate.getTime()) || pubDate < since) continue;
      const content = articleContent(item);
      const text = `${item.title || ""} ${content}`;
      if (!matchesAny(text, source.includeTitlePatterns || [])) continue;
      if (!matchesNone(text, source.excludeTitlePatterns || [])) continue;
      const signal = evaluateSignalScore(text, scoring);
      if (signal.evaluated && !signal.passes) {
        skippedByScore += 1;
        continue;
      }
      articles.push({
        title: item.title || "",
        link: item.link || "",
        pubDate: item.pubDate || "",
        source: source.name,
        content,
        signalScore: signal.score,
        signalReasons: signal.reasons,
      });
    }
    return { articles, error: "", skippedByScore };
  } catch (error) {
    console.error(`Error fetching ${source.name}: ${error.message}`);
    return { articles: [], error: error.message, skippedByScore: 0 };
  }
}

async function collectArticles(sources) {
  const since = sinceDate();
  const globalScoring = sources.scoring || {};
  const groups = [
    ["feeds", sources.feeds || []],
    ["newsletters", sources.newsletters || []],
    ["blogs", sources.blogs || []],
    ["podcasts", sources.podcasts || []],
  ];
  const articles = [];
  const sourceResults = [];
  let totalSkippedByScore = 0;

  for (const [groupName, sourceList] of groups) {
    if (!sourceList.length) continue;
    console.log(`Fetching ${groupName}...`);
    for (const source of sourceList) {
      if (!source.rss) continue;
      const scoring = mergeScoring(globalScoring, source.scoring || {});
      const result = await fetchRssFeed(source, since, scoring);
      articles.push(...result.articles);
      totalSkippedByScore += result.skippedByScore || 0;
      sourceResults.push({
        name: source.name,
        group: groupName,
        type: "feed",
        url: source.rss,
        status: result.error ? "error" : "ok",
        count: result.articles.length,
        skippedByScore: result.skippedByScore || 0,
        error: result.error,
      });
    }
  }

  return {
    articles: uniqueArticles(articles)
      .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate)),
    sourceResults,
    totalSkippedByScore,
    globalScoring,
  };
}

async function main() {
  const date = outputDate();
  const outputDir = rawDir(date);
  await fs.mkdir(outputDir, { recursive: true });

  const sources = JSON.parse(await fs.readFile(sourcesPath, "utf8"));
  const { articles, sourceResults, totalSkippedByScore, globalScoring } = await collectArticles(sources);

  const articlesPath = devArticlesPath(date);
  await fs.writeFile(articlesPath, `${JSON.stringify(articles, null, 2)}\n`, "utf8");
  const reportPath = devFetchReportPath(date);
  await fs.writeFile(reportPath, `${JSON.stringify({
    date,
    sourceFile: "news-tracking/dev-sources.json",
    totalArticles: articles.length,
    totalSkippedByScore,
    scoring: globalScoring,
    sourceResults,
  }, null, 2)}\n`, "utf8");

  console.log(`Fetched ${articles.length} DEV articles (skipped by score: ${totalSkippedByScore})`);
  console.log(`Saved to ${articlesPath}`);
  console.log(`Saved fetch report to ${reportPath}`);
  console.log("Next: use docs/dev-digest-agent-prompt.md with this JSON to select, summarize, and write DEV items.");
}

main().catch((error) => {
  console.error("Failed to fetch DEV news:", error);
  process.exit(1);
});
