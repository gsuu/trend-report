import fs from "node:fs/promises";
import path from "node:path";

export const FEED_TIMEOUT_MS = 15000;
export const PAGE_TIMEOUT_MS = 15000;
export const BOOTSTRAP_DAYS = 7;

export function outputDate() {
  return (process.env.TRACKING_OUTPUT_DATE || new Date().toISOString().slice(0, 10)).trim();
}

export function sinceDate(days = BOOTSTRAP_DAYS) {
  const configured = (process.env.TRACKING_SINCE_DATE || "").trim();
  if (configured) return new Date(`${configured}T00:00:00Z`);
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

export function runDir(runsDir, date = outputDate()) {
  return path.join(runsDir, date);
}

export function decodeHtml(value = "") {
  return String(value)
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/&middot;/g, "·")
    .replace(/&hellip;/g, "…")
    .replace(/\s+/g, " ")
    .trim();
}

export function stripTags(value = "") {
  return decodeHtml(
    String(value)
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " "),
  );
}

export function shortText(value = "", limit = 520) {
  const text = stripTags(value);
  return text.length > limit ? `${text.slice(0, limit - 1).trimEnd()}…` : text;
}

export function absoluteUrl(href, baseUrl) {
  try {
    return new URL(href, baseUrl).toString();
  } catch {
    return "";
  }
}

export function matchesAny(value, patterns = []) {
  if (!patterns.length) return true;
  return patterns.some((pattern) => new RegExp(pattern, "i").test(value));
}

export function matchesNone(value, patterns = []) {
  return !patterns.some((pattern) => new RegExp(pattern, "i").test(value));
}

export function cleanTitle(value = "") {
  return decodeHtml(value)
    .replace(/\s+[-|]\s+.+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function metaContent(html, names) {
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

export function pageTitle(html) {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match ? cleanTitle(stripTags(match[1])) : "";
}

export function isUsableImageUrl(value = "", pageUrl = "") {
  if (!value) return false;
  try {
    const imageUrl = new URL(value, pageUrl || undefined);
    const sourceUrl = pageUrl ? new URL(pageUrl) : null;
    if (sourceUrl && imageUrl.href.replace(/\/$/, "") === sourceUrl.href.replace(/\/$/, "")) return false;
    if (/\.(mp4|mov|webm|avi)(\?|#|$)/i.test(imageUrl.pathname)) return false;
    if (/\.(png|jpe?g|webp|gif|svg|avif)(\?|#|$)/i.test(imageUrl.pathname)) return true;
    return /(image|img|media|cdn|uploads|thumbnail|og-image|preview-card)/i.test(imageUrl.href);
  } catch {
    return false;
  }
}

export function itemImage(item) {
  const mediaContent = item["media:content"];
  const mediaThumbnail = item["media:thumbnail"];
  const candidates = [
    item.image,
    item.imageUrl,
    item.ogImage,
    item.enclosure?.url,
    Array.isArray(mediaContent) ? mediaContent[0]?.$?.url : mediaContent?.$?.url,
    Array.isArray(mediaThumbnail) ? mediaThumbnail[0]?.$?.url : mediaThumbnail?.$?.url,
  ];
  return candidates.find((value) => isUsableImageUrl(value)) || "";
}

export function articleContent(item, limit = 520) {
  return shortText(item.contentSnippet || item["content:encoded"] || item.content || "", limit);
}

export async function fetchText(url, timeoutMs, userAgent) {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(timeoutMs),
    headers: { "User-Agent": userAgent },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.text();
}

export async function fetchArticleMeta(url, { timeoutMs = PAGE_TIMEOUT_MS, userAgent, textLimit = 520 } = {}) {
  try {
    const html = await fetchText(url, timeoutMs, userAgent || "CTTD Article Metadata Scraper");
    const title = metaContent(html, ["og:title", "twitter:title"]) || pageTitle(html);
    const content = metaContent(html, ["og:description", "twitter:description", "description"]);
    const rawImage = absoluteUrl(metaContent(html, ["og:image", "twitter:image", "image"]), url);
    return {
      title: title ? cleanTitle(title) : "",
      content: content ? shortText(content, textLimit) : "",
      image: isUsableImageUrl(rawImage, url) ? rawImage : "",
    };
  } catch {
    return {};
  }
}

export function extractAnchors(html, baseUrl) {
  const anchors = [];
  const pattern = /<a\b[^>]*?href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  for (const match of html.matchAll(pattern)) {
    const link = absoluteUrl(match[1], baseUrl);
    const title = cleanTitle(stripTags(match[2]));
    if (link && title) anchors.push({ title, link });
  }
  return anchors;
}

export async function previousLinks(runsDir, articlesPath, today = outputDate()) {
  const links = new Set();
  const runs = await fs.readdir(runsDir, { withFileTypes: true }).catch(() => []);
  for (const run of runs) {
    if (!run.isDirectory() || run.name === today) continue;
    try {
      const articles = JSON.parse(await fs.readFile(articlesPath(run.name), "utf8"));
      for (const article of articles) {
        if (article?.link) links.add(article.link);
      }
    } catch {
      // Older runs may not have category-specific snapshots yet.
    }
  }
  return links;
}

export function uniqueArticles(articles) {
  const seen = new Set();
  return articles.filter((article) => {
    const linkKey = article.link || "";
    const titleKey = `${article.source || ""}|${cleanTitle(article.title || "").toLowerCase()}`;
    if (!article.title || !article.link || seen.has(linkKey) || seen.has(titleKey)) return false;
    seen.add(linkKey);
    seen.add(titleKey);
    return true;
  });
}
