import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Parser from "rss-parser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..", "..");
const sourcesPath = path.join(root, "news-tracking", "sources.json");
const runsDir = path.join(root, "runs");
const parser = new Parser();
const FEED_TIMEOUT_MS = 15000;
const BOOTSTRAP_DAYS = 7;
const SCRAPER_BOOTSTRAP_LIMIT = 20;
const ARTICLE_META_TIMEOUT_MS = 12000;

function outputDate() {
  return (process.env.TRACKING_OUTPUT_DATE || new Date().toISOString().slice(0, 10)).trim();
}

function runDir(date = outputDate()) {
  return path.join(runsDir, date);
}

function articlePath(date = outputDate()) {
  return path.join(runDir(date), "articles.json");
}

function digestPath(date = outputDate()) {
  return path.join(runDir(date), "weekly-digest.md");
}

function snapshotDateFromRunName(name) {
  const match = name.match(/^(\d{4}-\d{2}-\d{2})$/);
  return match ? new Date(`${match[1]}T00:00:00Z`) : null;
}

async function trackingSinceDate() {
  const configured = (process.env.TRACKING_SINCE_DATE || "").trim();
  if (configured) return new Date(`${configured}T00:00:00Z`);

  const today = outputDate();
  try {
    const runs = (await fs.readdir(runsDir, { withFileTypes: true }))
      .filter((entry) => entry.isDirectory() && entry.name !== today)
      .map((entry) => entry.name)
      .sort()
      .reverse();
    for (const run of runs) {
      const date = snapshotDateFromRunName(run);
      if (!date) continue;
      try {
        await fs.stat(articlePath(run));
        return date;
      } catch {
        // no article snapshot in this run
      }
    }
  } catch {
    // no previous snapshots yet
  }

  const bootstrap = new Date();
  bootstrap.setDate(bootstrap.getDate() - BOOTSTRAP_DAYS);
  return bootstrap;
}

async function previousTrackedLinks() {
  const today = outputDate();
  const links = new Set();
  try {
    const runs = (await fs.readdir(runsDir, { withFileTypes: true }))
      .filter((entry) => entry.isDirectory() && entry.name !== today)
      .map((entry) => entry.name);
    for (const run of runs) {
      let articles;
      try {
        articles = JSON.parse(await fs.readFile(articlePath(run), "utf8"));
      } catch {
        continue;
      }
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

function rawDigestCategory(article) {
  const source = String(article.source || "").toLowerCase();
  const text = `${article.source || ""} ${article.category || ""} ${article.title || ""} ${article.content || ""}`.toLowerCase();
  if (source.includes("figma blog - design systems") || source.includes("into design systems")) return "Design";
  if (source.includes("javascript weekly") || source.includes("syntax.fm") || source.includes("shoptalk")) return "JavaScript";
  if (source.includes("css weekly") || source.includes("frontend focus")) return "Performance";
  if (source.includes("css-tricks") || source.includes("webkit") || source.includes("chrome developers") || source.includes("mdn") || source.includes("astro") || source.includes("web.dev")) return "HTML/CSS";
  if (article.area === "service") return "Service";
  if (article.area === "design") return "Design";
  if (article.area === "dev" && article.category === "tool") return "AI Tools";
  if (/accessibility|a11y|wcag|wave|avada|screen reader|keyboard|aria/.test(text)) return "Accessibility";
  if (/performance|core web vitals|lcp|cls|inp|lazy loading|font fallback|layout shift/.test(text)) return "Performance";
  if (/css|html|astro|markdown|mdx|web\.dev|css-tricks|css weekly|webkit|safari|chrome developers|mdn/.test(text)) return "HTML/CSS";
  if (/javascript|frontend focus|syntax\.fm|shoptalk|node\.js|react|vercel|hyperframes/.test(text)) return "JavaScript";
  if (/design system|figma|design|ux|ui|prototype|handoff|component|token/.test(text)) return "Design";
  if (/service|ecommerce|commerce|shopping|spotify|올리브영|신세계|무신사|카카오스타일|publy/.test(text)) return "Service";
  if (/ai|agent|codex|claude|openai|gemini|workflow|tool/.test(text)) return "AI Tools";
  return "Others";
}

function normalizedKey(value = "") {
  return stripTags(value)
    .toLowerCase()
    .replace(/&[#a-z0-9]+;/gi, "")
    .replace(/[^a-z0-9가-힣]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function shouldKeepCollectedArticle(article) {
  const title = normalizedKey(article.title || "");
  const link = String(article.link || "").toLowerCase();
  if (!title || title.length < 4) return false;
  if (/^(tag|category|author|privacy|terms)\b/.test(title)) return false;
  if (/운영 정책|개인정보처리방침|privacy policy|cookie policy|terms of service|our principles/.test(title)) return false;
  if (/(\/tag\/|\/tags\/|\/category\/|\/author\/|\/authors\/|\/privacy|\/terms|login|signup)/.test(link)) return false;
  return true;
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).format(date);
}

function digestExcerpt(value = "") {
  return stripTags(value)
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 420);
}

function digestMarkdown(articles, date) {
  const groups = new Map();
  const order = ["Service", "Design", "HTML/CSS", "JavaScript", "Accessibility", "Performance", "AI Tools", "Others"];
  for (const article of articles) {
    const category = rawDigestCategory(article);
    if (!groups.has(category)) groups.set(category, []);
    groups.get(category).push(article);
  }

  const parts = [
    "# 주간 Service/Design/DEV 뉴스 다이제스트",
    `생성일: ${date}`,
    "",
    "이 다이제스트는 RSS/뉴스 소스에서 넓게 수집한 원자료입니다. 매거진 업로드 대상은 이 목록에서 별도 선별합니다.",
    "",
  ];

  for (const category of order) {
    const items = groups.get(category) || [];
    if (!items.length) continue;
    parts.push(`## ${category}`, "");
    for (const article of items) {
      parts.push(
        `### ${article.title || "(제목 없음)"}`,
        `출처: ${article.source || "Unknown"} | 날짜: ${formatDate(article.pubDate)}`,
        "",
        digestExcerpt(article.content || article.summary || article.title || ""),
        "",
        article.link ? `원문: ${article.link}` : "",
        "",
      );
    }
  }

  parts.push(`총 ${articles.length}개의 기사를 수집했습니다.`, "");
  return parts.filter((line, index, array) => line || array[index - 1] !== "").join("\n");
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

function firstInlineImage(html, baseUrl) {
  const patterns = [
    /<table\b[^>]*\bclass\s*=\s*["'][^"']*el-fullwidthimage[^"']*["'][\s\S]*?<img\b(?=[^>]*\bsrc\s*=\s*["']([^"']+)["'])[^>]*>/i,
    /<img\b(?=[^>]*\bclass\s*=\s*["'][^"']*(?:fullwidth|hero|lead|masthead)[^"']*["'])(?=[^>]*\bsrc\s*=\s*["']([^"']+)["'])[^>]*>/i,
    /<img\b(?=[^>]*\bsrc\s*=\s*["']([^"']+)["'])[^>]*>/i,
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    const image = absoluteUrl(match?.[1] || "", baseUrl);
    if (isUsableImageUrl(image, baseUrl)) return image;
  }
  return "";
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
    const image = isUsableImageUrl(rawImage, url) ? rawImage : firstInlineImage(html, url);
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
  const date = outputDate();
  const outputDir = runDir(date);
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
  const seenTitleKeys = new Set();
  const uniqueArticles = articles.filter((article) => {
    if (!shouldKeepCollectedArticle(article)) return false;
    if (!article.link || seenLinks.has(article.link)) return false;
    seenLinks.add(article.link);
    const titleKey = `${article.source || ""}|||${normalizedKey(article.title || "")}`;
    if (seenTitleKeys.has(titleKey)) return false;
    seenTitleKeys.add(titleKey);
    return true;
  });

  uniqueArticles.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

  const outputPath = articlePath(date);
  await fs.writeFile(outputPath, `${JSON.stringify(uniqueArticles, null, 2)}\n`, "utf8");
  const digestOutputPath = digestPath(date);
  await fs.writeFile(digestOutputPath, digestMarkdown(uniqueArticles, date), "utf8");

  console.log(`Fetched ${uniqueArticles.length} articles`);
  console.log(`Tracking since ${sinceDate.toISOString().slice(0, 10)}`);
  console.log(`Saved to ${outputPath}`);
  console.log(`Saved digest to ${digestOutputPath}`);
  console.log(`LATEST_FILE=${outputPath}`);
}

main().catch((error) => {
  console.error("Failed to fetch tracking news:", error);
  process.exit(1);
});
