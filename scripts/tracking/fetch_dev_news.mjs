import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Parser from "rss-parser";
import {
  FEED_TIMEOUT_MS,
  articleContent,
  fetchText,
  outputDate,
  runDir as resolveRunDir,
  sinceDate,
  uniqueArticles,
} from "./tracking_utils.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..", "..");
const sourcesPath = path.join(root, "news-tracking", "dev-sources.json");
const runsDir = path.join(root, "runs");
const parser = new Parser();

function runDir(date = outputDate()) {
  return resolveRunDir(runsDir, date);
}

async function fetchRssFeed(url, source, since) {
  try {
    const xml = await fetchText(url, FEED_TIMEOUT_MS, "CTTD Trend Report DEV RSS Tracker");
    const feed = await parser.parseString(xml);
    return feed.items
      .filter((item) => {
        if (!item.pubDate) return false;
        const pubDate = new Date(item.pubDate);
        return !Number.isNaN(pubDate.getTime()) && pubDate >= since;
      })
      .map((item) => ({
        title: item.title || "",
        link: item.link || "",
        pubDate: item.pubDate || "",
        source,
        content: articleContent(item),
      }));
  } catch (error) {
    console.error(`Error fetching ${source}: ${error.message}`);
    return [];
  }
}

async function collectArticles(sources) {
  const since = sinceDate();
  const groups = [
    ["newsletters", sources.newsletters || []],
    ["blogs", sources.blogs || []],
    ["podcasts", sources.podcasts || []],
  ];
  const articles = [];

  for (const [groupName, sourceList] of groups) {
    console.log(`Fetching ${groupName}...`);
    for (const source of sourceList) {
      if (!source.rss) continue;
      articles.push(...await fetchRssFeed(source.rss, source.name, since));
    }
  }

  return uniqueArticles(articles)
    .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
}

async function main() {
  const date = outputDate();
  const outputDir = runDir(date);
  await fs.mkdir(outputDir, { recursive: true });

  const sources = JSON.parse(await fs.readFile(sourcesPath, "utf8"));
  const articles = await collectArticles(sources);

  const articlesPath = path.join(outputDir, "dev-articles.json");
  await fs.writeFile(articlesPath, `${JSON.stringify(articles, null, 2)}\n`, "utf8");

  console.log(`Fetched ${articles.length} DEV articles`);
  console.log(`Saved to ${articlesPath}`);
  console.log("Next: use docs/dev-digest-agent-prompt.md with this JSON to select, summarize, and write DEV items.");
}

main().catch((error) => {
  console.error("Failed to fetch DEV news:", error);
  process.exit(1);
});
