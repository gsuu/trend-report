import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Parser from "rss-parser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");
const sourcesPath = path.join(root, "news-tracking", "sources.json");
const outputDir = path.join(root, "news-tracking", "articles");
const parser = new Parser();
const FEED_TIMEOUT_MS = 15000;
const BOOTSTRAP_DAYS = 7;
const SCRAPER_BOOTSTRAP_LIMIT = 20;
const ARTICLE_META_TIMEOUT_MS = 12000;

function outputDate() {
  return (process.env.TRACKING_OUTPUT_DATE || new Date().toISOString().slice(0, 10)).trim();
}

function snapshotDateFromFileName(fileName) {
  const match = fileName.match(/^(\d{4}-\d{2}-\d{2})\.json$/);
  return match ? new Date(`${match[1]}T00:00:00Z`) : null;
}

async function trackingSinceDate() {
  const configured = (process.env.TRACKING_SINCE_DATE || "").trim();
  if (configured) return new Date(`${configured}T00:00:00Z`);

  const todayFile = `${outputDate()}.json`;
  try {
    const files = (await fs.readdir(outputDir))
      .filter((name) => name.endsWith(".json") && name !== todayFile)
      .sort()
      .reverse();
    for (const file of files) {
      const date = snapshotDateFromFileName(file);
      if (date) return date;
    }
  } catch {
    // no previous snapshots yet
  }

  const bootstrap = new Date();
  bootstrap.setDate(bootstrap.getDate() - BOOTSTRAP_DAYS);
  return bootstrap;
}

async function previousTrackedLinks() {
  const todayFile = `${outputDate()}.json`;
  const links = new Set();
  try {
    const files = (await fs.readdir(outputDir)).filter((name) => name.endsWith(".json") && name !== todayFile);
    for (const file of files) {
      const articles = JSON.parse(await fs.readFile(path.join(outputDir, file), "utf8"));
      for (const article of articles) {
        if (article?.link) links.add(article.link);
      }
    }
  } catch {
    // no previous snapshots yet
  }
  return links;
}

function trackedArticleFields(source) {
  return {
    source: source.name,
    audience: source.audience || "dev",
    area: source.area || "",
    category: source.category || "",
    trackingStatus: source.trackingStatus || "candidate",
    publishStatus: source.publishStatus || "pending",
    sendTarget: source.sendTarget !== false,
  };
}

function firstString(...values) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function isUsableImageUrl(value = "", pageUrl = "") {
  if (!value) return false;
  try {
    const imageUrl = new URL(value, pageUrl || undefined);
    const sourceUrl = pageUrl ? new URL(pageUrl) : null;
    if (sourceUrl && imageUrl.href.replace(/\/$/, "") === sourceUrl.href.replace(/\/$/, "")) return false;
    if (/\.(mp4|mov|webm|avi)(\?|#|$)/i.test(imageUrl.pathname)) return false;
    if (/\.(png|jpe?g|webp|gif|svg|avif)(\?|#|$)/i.test(imageUrl.pathname)) return true;
    return /(image|img|media|cdn|sanity|uploads|thumbnail|og-image|preview-card)/i.test(imageUrl.href);
  } catch {
    return false;
  }
}

function itemImage(item) {
  const mediaContent = item["media:content"];
  const mediaThumbnail = item["media:thumbnail"];
  const enclosure = item.enclosure;
  const candidates = [
    item.image,
    item.imageUrl,
    item.ogImage,
    item.itunes?.image,
    enclosure?.url,
    Array.isArray(mediaContent) ? mediaContent[0]?.$?.url : mediaContent?.$?.url,
    Array.isArray(mediaThumbnail) ? mediaThumbnail[0]?.$?.url : mediaThumbnail?.$?.url,
  ];
  return firstString(...candidates.filter((value) => isUsableImageUrl(value)));
}

async function fetchRssFeed(url, source, sinceDate) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FEED_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "CTTD Trend Report RSS Tracker",
      },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const xml = await response.text();
    const feed = await parser.parseString(xml);
    const items = feed.items
      .filter((item) => {
        if (!item.pubDate) return false;
        const pubDate = new Date(item.pubDate);
        return !Number.isNaN(pubDate.getTime()) && pubDate >= sinceDate;
      })
      .map((item) => ({
        title: item.title,
        link: item.link,
        pubDate: item.pubDate,
        content: item.contentSnippet || stripTags(item["content:encoded"] || item.content || ""),
        image: itemImage(item),
        ...trackedArticleFields(source),
      }));
    const enriched = [];
    for (const item of items) {
      if (!item.link || (item.content && item.content.length >= 160 && item.image)) {
        enriched.push(item);
        continue;
      }
      const meta = await fetchArticleMeta(item.link);
      enriched.push({
        ...item,
        title: cleanScrapedTitle(meta.title || item.title),
        content: meta.content || item.content,
        image: meta.image || item.image,
      });
    }
    return enriched;
  } catch (error) {
    console.error(`Error fetching ${source.name}: ${error.message}`);
    return [];
  } finally {
    clearTimeout(timeoutId);
  }
}

function absoluteUrl(href, baseUrl) {
  try {
    return new URL(href, baseUrl).toString();
  } catch {
    return "";
  }
}

function decodeHtml(value = "") {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function stripTags(value = "") {
  return decodeHtml(value.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<[^>]+>/g, " "));
}

function cleanScrapedTitle(value = "") {
  return decodeHtml(value)
    .replace(/\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s+\d{4}\s+By[\s\S]+$/i, "")
    .replace(/\s+By\s+[A-Z][\s\S]+$/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function matchesAny(value, patterns = []) {
  if (!patterns.length) return true;
  return patterns.some((pattern) => new RegExp(pattern, "i").test(value));
}

function matchesNone(value, patterns = []) {
  return !patterns.some((pattern) => new RegExp(pattern, "i").test(value));
}

function extractAnchors(html, baseUrl) {
  const anchors = [];
  const pattern = /<a\b[^>]*?href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  for (const match of html.matchAll(pattern)) {
    const link = absoluteUrl(match[1], baseUrl);
    const title = cleanScrapedTitle(stripTags(match[2]));
    if (!link || !title) continue;
    anchors.push({ title, link });
  }
  return anchors;
}

function metaContent(html, names) {
  for (const name of names) {
    const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const patterns = [
      new RegExp(`<meta\\b(?=[^>]*(?:property|name)\\s*=\\s*["']${escapedName}["'])(?=[^>]*content\\s*=\\s*["']([^"']+)["'])[^>]*>`, "i"),
      new RegExp(`<meta\\b(?=[^>]*content\\s*=\\s*["']([^"']+)["'])(?=[^>]*(?:property|name)\\s*=\\s*["']${escapedName}["'])[^>]*>`, "i"),
    ];
    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match?.[1]) return decodeHtml(match[1]);
    }
  }
  return "";
}

function pageTitle(html) {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match ? cleanScrapedTitle(stripTags(match[1])) : "";
}

function pageDescription(html) {
  const description = metaContent(html, ["og:description", "twitter:description", "description"]);
  if (description) return description;
  const articleMatch = html.match(/<article\b[^>]*>([\s\S]{300,4000}?)<\/article>/i);
  return articleMatch ? stripTags(articleMatch[1]).slice(0, 800) : "";
}

async function fetchArticleMeta(url) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ARTICLE_META_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "CTTD Trend Report Article Metadata Scraper",
      },
    });
    if (!response.ok) return {};
    const html = await response.text();
    const title = firstString(metaContent(html, ["og:title", "twitter:title"]), pageTitle(html));
    const content = pageDescription(html);
    const rawImage = absoluteUrl(metaContent(html, ["og:image", "twitter:image", "image"]), url);
    const image = isUsableImageUrl(rawImage, url) ? rawImage : "";
    return { title, content, image };
  } catch {
    return {};
  } finally {
    clearTimeout(timeoutId);
  }
}

async function scrapeSource(source, seenPreviousLinks) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FEED_TIMEOUT_MS);
  try {
    const response = await fetch(source.url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "CTTD Trend Report Scraper",
      },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const html = await response.text();
    const seenLinks = new Set();
    const scrapedAt = new Date().toUTCString();
    const anchors = extractAnchors(html, source.url)
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
      .slice(0, source.limit || SCRAPER_BOOTSTRAP_LIMIT);

    const enriched = [];
    for (const item of anchors) {
      const meta = await fetchArticleMeta(item.link);
      enriched.push({
        ...item,
        title: cleanScrapedTitle(meta.title || item.title),
        pubDate: scrapedAt,
        content: meta.content || item.title,
        image: meta.image || "",
        scraped: true,
        ...trackedArticleFields(source),
      });
    }
    return enriched;
  } catch (error) {
    console.error(`Error scraping ${source.name}: ${error.message}`);
    return [];
  } finally {
    clearTimeout(timeoutId);
  }
}

async function fetchGroup(sources, groupName, sinceDate) {
  const articles = [];
  console.log(`Fetching ${groupName}...`);
  for (const source of sources) {
    if (!source.rss) continue;
    articles.push(...await fetchRssFeed(source.rss, source, sinceDate));
  }
  return articles;
}

async function scrapeGroup(sources, seenPreviousLinks) {
  const articles = [];
  console.log("Scraping sources...");
  for (const source of sources) {
    if (!source.url) continue;
    articles.push(...await scrapeSource(source, seenPreviousLinks));
  }
  return articles;
}

async function main() {
  await fs.mkdir(outputDir, { recursive: true });

  const sources = JSON.parse(await fs.readFile(sourcesPath, "utf8"));
  const allSources = [
    ...(sources.newsletters || []),
    ...(sources.blogs || []),
    ...(sources.podcasts || []),
    ...(sources.scrapers || []),
  ];
  const sinceDate = await trackingSinceDate();
  const seenPreviousLinks = await previousTrackedLinks();
  const articles = [
    ...await fetchGroup(sources.newsletters || [], "newsletters", sinceDate),
    ...await fetchGroup(sources.blogs || [], "blogs", sinceDate),
    ...await fetchGroup(sources.podcasts || [], "podcasts", sinceDate),
    ...await scrapeGroup(allSources, seenPreviousLinks),
  ];

  const seenLinks = new Set();
  const uniqueArticles = articles.filter((article) => {
    if (!article.link || seenLinks.has(article.link)) return false;
    seenLinks.add(article.link);
    return true;
  });

  uniqueArticles.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

  const outputPath = path.join(outputDir, `${outputDate()}.json`);
  await fs.writeFile(outputPath, `${JSON.stringify(uniqueArticles, null, 2)}\n`, "utf8");

  console.log(`Fetched ${uniqueArticles.length} articles`);
  console.log(`Tracking since ${sinceDate.toISOString().slice(0, 10)}`);
  console.log(`Saved to ${outputPath}`);
  console.log(`LATEST_FILE=${outputPath}`);
}

main().catch((error) => {
  console.error("Failed to fetch tracking news:", error);
  process.exit(1);
});
