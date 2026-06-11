import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Parser from "rss-parser";
import {
  FEED_TIMEOUT_MS,
  PAGE_TIMEOUT_MS,
  addTagWhen,
  articleContent,
  cleanTitle,
  collectSourceGroup,
  extractAnchors,
  fetchArticleMeta,
  fetchText,
  isAutoExcluded,
  itemImage,
  makeRawPaths,
  matchesAny,
  matchesNone,
  outputDate,
  previousLinks,
  sinceDate,
  uniqueArticles,
  writeFetchOutput,
} from "./tracking_utils.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..", "..");
const sourcesPath = path.join(root, "news-tracking", "dev-sources.json");
const runsDir = path.join(root, "runs");
const parser = new Parser();
const paths = makeRawPaths(runsDir, "dev");

function articleFields(source) {
  return {
    source: source.name,
    sourceUrl: source.url || "",
    sourceRole: source.sourceRole || "reference",
    locale: source.locale || "global",
    audience: "dev",
    area: "dev",
    category: source.category || "dev_reference",
    topics: source.topics || [],
  };
}

function devValueTags(article) {
  const text = `${article.title || ""} ${article.content || ""}`.toLowerCase();
  const tags = new Set();
  addTagWhen(tags, "web_platform", /chrome|safari|webkit|firefox|browser|web platform|web vitals|baseline|interop|http\/|websocket|service worker|webassembly|wasm|web api/i, text);
  addTagWhen(tags, "frontend_framework", /react|next\.?js|svelte|vue|astro|solid|qwik|remix|nuxt/i, text);
  addTagWhen(tags, "css_html", /\bcss\b|\bhtml\b|tailwind|sass|scss|grid|flexbox|container quer|view transition/i, text);
  addTagWhen(tags, "javascript_ts", /javascript|typescript|\bts\b|ecmascript|es20\d\d|node\.?js|deno|bun/i, text);
  addTagWhen(tags, "performance", /performance|core web vitals|lcp|inp|cls|lighthouse|bundle|tree.?shak|code split|성능 최적화/i, text);
  addTagWhen(tags, "accessibility", /accessibility|\ba11y\b|aria|wcag|screen reader|접근성/i, text);
  addTagWhen(tags, "ai_coding", /\bai\b|llm|copilot|cursor|claude|chatgpt|gpt-|gemini|prompt|agent|mcp|tool use|generative/i, text);
  addTagWhen(tags, "design_system", /design system|component library|storybook|figma|design token|디자인 시스템|컴포넌트/i, text);
  addTagWhen(tags, "tooling", /vite|webpack|esbuild|turbopack|rollup|parcel|biome|eslint|prettier|playwright|cypress|vitest/i, text);
  addTagWhen(tags, "korean_dev", /한국|국내|네이버|카카오|토스|당근|쿠팡|배민|geeknews|hada/i, text);
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
  const roleOrder = { official: 0, inspiration: 1, reference: 2 };
  const localeOrder = { KR: 0, ko: 0, global: 1 };
  return (localeOrder[a.locale] ?? 1) - (localeOrder[b.locale] ?? 1)
    || (roleOrder[a.sourceRole] ?? 9) - (roleOrder[b.sourceRole] ?? 9)
    || String(b.pubDate || "").localeCompare(String(a.pubDate || ""))
    || String(a.source || "").localeCompare(String(b.source || ""));
}

async function main() {
  const date = outputDate();
  await fs.mkdir(paths.rawDir(date), { recursive: true });

  const sources = JSON.parse(await fs.readFile(sourcesPath, "utf8"));
  const since = sinceDate();
  const seenPreviousLinks = await previousLinks(runsDir, paths.articlesPath, date);
  const articles = [];
  const sourceResults = [];

  console.log("Fetching dev feeds...");
  await collectSourceGroup({
    sources, key: "feeds", type: "feed", urlField: "rss",
    handler: (source) => fetchRssFeed(source, since),
    articles, sourceResults,
  });

  console.log("Scraping dev pages...");
  await collectSourceGroup({
    sources, key: "pages", type: "page", urlField: "url",
    handler: (source) => scrapePage(source, seenPreviousLinks),
    articles, sourceResults,
  });

  const output = uniqueArticles(articles)
    .filter((article) => !isAutoExcluded(article.title, "dev"))
    .map((article) => ({ ...article, valueTags: devValueTags(article) }))
    .sort(sortArticles);

  await writeFetchOutput({
    paths, date,
    sourceFile: "news-tracking/dev-sources.json",
    output, sourceResults,
    fetchedLabel: "DEV articles",
    nextHint: "Next: use docs/dev-digest-agent-prompt.md with this JSON to select, summarize, and write DEV items.",
  });
}

main().catch((error) => {
  console.error("Failed to fetch DEV news:", error);
  process.exit(1);
});
