import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Parser from "rss-parser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..", "..");
const sourcesPath = path.join(root, "news-tracking", "dev-sources.json");
const runsDir = path.join(root, "runs");
const parser = new Parser();
const FEED_TIMEOUT_MS = 15000;

function outputDate() {
  return (process.env.TRACKING_OUTPUT_DATE || new Date().toISOString().slice(0, 10)).trim();
}

function sinceDate() {
  const configured = (process.env.TRACKING_SINCE_DATE || "").trim();
  if (configured) return new Date(`${configured}T00:00:00Z`);
  const date = new Date();
  date.setDate(date.getDate() - 7);
  return date;
}

function runDir(date = outputDate()) {
  return path.join(runsDir, date);
}

function stripTags(value = "") {
  return String(value)
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function articleContent(item) {
  return stripTags(item.contentSnippet || item["content:encoded"] || item.content || "");
}

async function fetchRssFeed(url, source, since) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FEED_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "CTTD Trend Report DEV RSS Tracker",
      },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const feed = await parser.parseString(await response.text());
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
  } finally {
    clearTimeout(timeoutId);
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

  const seenLinks = new Set();
  return articles
    .filter((article) => article.title && article.link)
    .filter((article) => {
      if (seenLinks.has(article.link)) return false;
      seenLinks.add(article.link);
      return true;
    })
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
