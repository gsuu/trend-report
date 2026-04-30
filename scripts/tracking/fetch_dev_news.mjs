import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Parser from "rss-parser";
import {
  FEED_TIMEOUT_MS,
  PAGE_TIMEOUT_MS,
  articleContent,
  cleanTitle,
  extractAnchors,
  fetchArticleMeta,
  fetchText,
  itemImage,
  matchesAny,
  matchesNone,
  outputDate,
  previousLinks,
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

function devArticlesPath(date = outputDate()) {
  return path.join(runDir(date), "dev-articles.json");
}

function devFetchReportPath(date = outputDate()) {
  return path.join(runDir(date), "dev-fetch-report.json");
}

function articleFields(source) {
  return {
    source: source.name,
    sourceUrl: source.url || "",
    sourceRole: source.sourceRole || "reference",
    locale: source.locale || "global",
    audience: "uiux_dev",
    area: "dev",
    category: source.category || "frontend_practice",
    topics: source.topics || [],
  };
}

function devValueTags(article) {
  const text = `${article.title || ""} ${article.content || ""}`.toLowerCase();
  const tags = new Set();
  if (/css|html|tailwind|stylesheet|grid|flex|container query|view transition/.test(text)) tags.add("html_css");
  if (/javascript|typescript|ecmascript|tc39|node\.js|deno|bun/.test(text)) tags.add("javascript");
  if (/react|next|svelte|vue|astro|solid|qwik|remix/.test(text)) tags.add("framework");
  if (/accessibility|a11y|aria|wcag|screen reader|keyboard|focus|inclusive|deque|axe|접근성/.test(text)) tags.add("accessibility");
  if (/performance|core web vitals|lcp|cls|inp|lighthouse|profiling|hydration|bundle|성능/.test(text)) tags.add("performance");
  if (/design system|component library|token|variable|storybook|shadcn|radix|디자인 시스템|컴포넌트/.test(text)) tags.add("design_system");
  if (/figma|design-to-code|design to code|builder\.io|locofy|anima|v0|ui generation|핸드오프|handoff/.test(text)) tags.add("design_system_automation");
  if (/copilot|cursor|claude code|chatgpt|codex|replit|bolt|lovable|llm|ai pair|ai coding|prompt|mcp|agent|에이전트/.test(text)) tags.add("ai_coding");
  if (/chrome|safari|firefox|webkit|baseline|interop|browser|브라우저/.test(text)) tags.add("browser_release");
  if (/web platform|web component|web api|view transitions|popover|dialog|attr\(\)|css nesting|container queries/.test(text)) tags.add("web_platform");
  if (/korea|korean|naver|kakao|line|toss|한국|국내|네이버|카카오|라인|토스/.test(text)) tags.add("korean_reference");
  return [...tags];
}

async function fetchRssFeed(source, since) {
  try {
    const xml = await fetchText(source.rss, FEED_TIMEOUT_MS, "CTTD Trend Report DEV RSS Tracker");
    const feed = await parser.parseString(xml);
    const articles = feed.items
      .filter((item) => {
        if (!item.pubDate && !item.isoDate) return false;
        const pubDate = new Date(item.pubDate || item.isoDate);
        return !Number.isNaN(pubDate.getTime()) && pubDate >= since;
      })
      .filter((item) => {
        const text = `${item.title || ""} ${articleContent(item)}`;
        return matchesAny(text, source.includeTitlePatterns || [])
          && matchesNone(text, source.excludeTitlePatterns || []);
      })
      .map((item) => ({
        title: cleanTitle(item.title || ""),
        link: item.link || "",
        pubDate: item.pubDate || item.isoDate || "",
        content: articleContent(item),
        image: itemImage(item),
        valueTags: [],
        ...articleFields(source),
      }));
    return { articles, error: "" };
  } catch (error) {
    console.error(`Error fetching ${source.name}: ${error.message}`);
    return { articles: [], error: error.message };
  }
}

async function scrapePage(source, seenPreviousLinks) {
  try {
    const html = await fetchText(source.url, PAGE_TIMEOUT_MS, "CTTD Trend Report DEV Page Scraper");
    const seenLinks = new Set();
    const scrapedAt = new Date().toUTCString();
    const candidates = extractAnchors(html, source.url)
      .filter((item) => !seenPreviousLinks.has(item.link))
      .filter((item) => matchesAny(item.link, source.includeLinkPatterns || []))
      .filter((item) => matchesAny(item.title, source.includeTitlePatterns || []))
      .filter((item) => matchesNone(item.link, source.excludeLinkPatterns || []))
      .filter((item) => matchesNone(item.title, source.excludeTitlePatterns || []))
      .filter((item) => {
        if (seenLinks.has(item.link)) return false;
        seenLinks.add(item.link);
        return true;
      })
      .slice(0, source.limit || 12);

    const articles = [];
    for (const item of candidates) {
      const meta = await fetchArticleMeta(item.link, {
        userAgent: "CTTD DEV Article Metadata Scraper",
      });
      const title = cleanTitle(meta.title || item.title);
      if (!matchesNone(title, source.excludeTitlePatterns || [])) continue;
      articles.push({
        title,
        link: item.link,
        pubDate: scrapedAt,
        content: meta.content || item.title,
        image: meta.image || "",
        valueTags: [],
        scraped: true,
        ...articleFields(source),
      });
    }
    return { articles, error: "" };
  } catch (error) {
    console.error(`Error scraping ${source.name}: ${error.message}`);
    return { articles: [], error: error.message };
  }
}

function sortArticles(a, b) {
  const roleOrder = { official: 0, reference: 1 };
  const localeOrder = { KR: 0, ko: 0, global: 1 };
  return (localeOrder[a.locale] ?? 1) - (localeOrder[b.locale] ?? 1)
    || (roleOrder[a.sourceRole] ?? 9) - (roleOrder[b.sourceRole] ?? 9)
    || String(b.pubDate || "").localeCompare(String(a.pubDate || ""))
    || String(a.source || "").localeCompare(String(b.source || ""));
}

async function main() {
  const date = outputDate();
  await fs.mkdir(runDir(date), { recursive: true });

  const sources = JSON.parse(await fs.readFile(sourcesPath, "utf8"));
  const since = sinceDate();
  const seenPreviousLinks = await previousLinks(runsDir, devArticlesPath, date);
  const articles = [];
  const sourceResults = [];

  console.log("Fetching DEV feeds...");
  for (const source of sources.feeds || []) {
    if (!source.rss) continue;
    const result = await fetchRssFeed(source, since);
    articles.push(...result.articles);
    sourceResults.push({
      name: source.name,
      type: "feed",
      url: source.rss,
      status: result.error ? "error" : "ok",
      count: result.articles.length,
      error: result.error,
    });
  }

  console.log("Scraping DEV pages...");
  for (const source of sources.pages || []) {
    if (!source.url) continue;
    const result = await scrapePage(source, seenPreviousLinks);
    articles.push(...result.articles);
    sourceResults.push({
      name: source.name,
      type: "page",
      url: source.url,
      status: result.error ? "error" : "ok",
      count: result.articles.length,
      error: result.error,
    });
  }

  const output = uniqueArticles(articles)
    .map((article) => ({ ...article, valueTags: devValueTags(article) }))
    .sort(sortArticles);

  const outputPath = devArticlesPath(date);
  await fs.writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
  const reportPath = devFetchReportPath(date);
  await fs.writeFile(reportPath, `${JSON.stringify({
    date,
    sourceFile: "news-tracking/dev-sources.json",
    totalArticles: output.length,
    sourceResults,
  }, null, 2)}\n`, "utf8");

  console.log(`Fetched ${output.length} DEV articles`);
  console.log(`Saved to ${outputPath}`);
  console.log(`Saved fetch report to ${reportPath}`);
  console.log("Next: use docs/dev-digest-agent-prompt.md with this JSON to select, summarize, and write DEV items.");
}

main().catch((error) => {
  console.error("Failed to fetch DEV news:", error);
  process.exit(1);
});
