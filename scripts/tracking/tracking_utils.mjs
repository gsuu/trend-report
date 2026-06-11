import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// _blocked-sources.json 한 번만 로드해 캐시. council 끝판왕 결정 #4 후속.
// dev/service/design 카테고리별 auto_exclude_keywords를 fetch 단계에서 제목 매칭으로 컷.
const BLOCKED_SOURCES_PATH = path.join(__dirname, "..", "..", "news-tracking", "_blocked-sources.json");
let _blockedKeywordsCache = null;
function getBlockedKeywords() {
  if (_blockedKeywordsCache !== null) return _blockedKeywordsCache;
  try {
    const raw = fsSync.readFileSync(BLOCKED_SOURCES_PATH, "utf8");
    _blockedKeywordsCache = JSON.parse(raw).auto_exclude_keywords || {};
  } catch {
    _blockedKeywordsCache = {};
  }
  return _blockedKeywordsCache;
}

/**
 * council 끝판왕 결정 #6 + #4 통합 — title이 카테고리별 자동 제외 키워드와 매치되면 true.
 * fetch 단계에서 .filter(article => !isAutoExcluded(article.title, "dev")) 형태로 사용.
 * @param {string} title - 후보 제목
 * @param {"dev"|"service"|"design"} category - news-tracking 카테고리
 * @returns {boolean}
 */
export function isAutoExcluded(title, category) {
  if (!title || !category) return false;
  const keywords = getBlockedKeywords()[category] || [];
  if (!keywords.length) return false;
  return keywords.some((kw) => {
    try {
      return new RegExp(kw, "i").test(title);
    } catch {
      return title.toLowerCase().includes(kw.toLowerCase());
    }
  });
}

export const FEED_TIMEOUT_MS = 25000;
export const PAGE_TIMEOUT_MS = 25000;
// 폴링 윈도우 14일. 한국 기업 기술블로그(Toss/Kakao/Naver D2/Woowahan 등)와 접근성 전문가 블로그는
// 갱신 빈도가 낮아 7일이면 종종 0건이 된다. previousLinks()가 이전 호 링크를 제외하므로
// 윈도우를 늘려도 중복 후보는 자동으로 컷된다. 필요시 TRACKING_SINCE_DATE 환경변수로 override.
export const BOOTSTRAP_DAYS = 14;
export const FETCH_RETRY_COUNT = 3;
export const FETCH_RETRY_BASE_DELAY_MS = 1500;
export const BROWSER_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

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

export function rawDir(runsDir, date = outputDate()) {
  return path.join(runsDir, date, "raw");
}

export function magazineDir(runsDir, date = outputDate()) {
  return path.join(runsDir, date, "magazine");
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

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchTextOnce(url, timeoutMs, userAgent) {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(timeoutMs),
    headers: {
      "User-Agent": userAgent || BROWSER_UA,
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,application/rss+xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
    },
    redirect: "follow",
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.text();
}

export async function fetchText(url, timeoutMs, userAgent) {
  let lastError;
  for (let attempt = 0; attempt < FETCH_RETRY_COUNT; attempt += 1) {
    try {
      return await fetchTextOnce(url, timeoutMs, userAgent);
    } catch (error) {
      lastError = error;
      if (attempt < FETCH_RETRY_COUNT - 1) {
        await sleep(FETCH_RETRY_BASE_DELAY_MS * (attempt + 1));
      }
    }
  }
  throw lastError;
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

export function addTagWhen(tags, name, pattern, text) {
  if (pattern.test(text)) tags.add(name);
}

// fetch_{service,design,dev}_news.mjs 공용 골격 ----------------------------------
// 영역별로 다른 부분(태그/정렬/articleFields/핸들러)은 각 스크립트에 남기고,
// 완전히 동일한 경로·소스 루프·출력 쓰기만 여기서 공유한다.

export function makeRawPaths(runsDir, area) {
  return {
    rawDir: (date = outputDate()) => rawDir(runsDir, date),
    articlesPath: (date = outputDate()) => path.join(rawDir(runsDir, date), `${area}-articles.json`),
    fetchReportPath: (date = outputDate()) => path.join(rawDir(runsDir, date), `${area}-fetch-report.json`),
  };
}

// sources[key] 각 항목을 handler로 돌리고 articles/sourceResults에 누적한다.
// urlField가 비어 있는 소스는 건너뛴다(feed=rss, 그 외=url).
export async function collectSourceGroup({
  sources,
  key,
  type,
  urlField,
  handler,
  articles,
  sourceResults,
}) {
  for (const source of sources[key] || []) {
    if (!source[urlField]) continue;
    const result = await handler(source);
    articles.push(...result.articles);
    sourceResults.push({
      name: source.name,
      type,
      url: source[urlField],
      status: result.error ? "error" : "ok",
      count: result.articles.length,
      error: result.error,
    });
  }
}

export async function writeFetchOutput({
  paths,
  date,
  sourceFile,
  output,
  sourceResults,
  fetchedLabel,
  nextHint,
}) {
  const outputPath = paths.articlesPath(date);
  await fs.writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
  const reportPath = paths.fetchReportPath(date);
  await fs.writeFile(reportPath, `${JSON.stringify({
    date,
    sourceFile,
    totalArticles: output.length,
    sourceResults,
  }, null, 2)}\n`, "utf8");

  console.log(`Fetched ${output.length} ${fetchedLabel}`);
  console.log(`Saved to ${outputPath}`);
  console.log(`Saved fetch report to ${reportPath}`);
  console.log(nextHint);
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
