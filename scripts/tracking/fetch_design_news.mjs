import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Parser from "rss-parser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..", "..");
const sourcesPath = path.join(root, "news-tracking", "design-sources.json");
const runsDir = path.join(root, "runs");
const parser = new Parser();
const FEED_TIMEOUT_MS = 15000;
const PAGE_TIMEOUT_MS = 15000;
const BOOTSTRAP_DAYS = 7;

function outputDate() {
  return (process.env.TRACKING_OUTPUT_DATE || new Date().toISOString().slice(0, 10)).trim();
}

function sinceDate() {
  const configured = (process.env.TRACKING_SINCE_DATE || "").trim();
  if (configured) return new Date(`${configured}T00:00:00Z`);
  const date = new Date();
  date.setDate(date.getDate() - BOOTSTRAP_DAYS);
  return date;
}

function runDir(date = outputDate()) {
  return path.join(runsDir, date);
}

function designArticlesPath(date = outputDate()) {
  return path.join(runDir(date), "design-articles.json");
}

function decodeHtml(value = "") {
  return String(value)
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
  return decodeHtml(
    String(value)
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " "),
  );
}

function shortText(value = "", limit = 520) {
  const text = stripTags(value);
  return text.length > limit ? `${text.slice(0, limit - 1).trimEnd()}…` : text;
}

function absoluteUrl(href, baseUrl) {
  try {
    return new URL(href, baseUrl).toString();
  } catch {
    return "";
  }
}

function matchesAny(value, patterns = []) {
  if (!patterns.length) return true;
  return patterns.some((pattern) => new RegExp(pattern, "i").test(value));
}

function matchesNone(value, patterns = []) {
  return !patterns.some((pattern) => new RegExp(pattern, "i").test(value));
}

function cleanTitle(value = "") {
  return decodeHtml(value)
    .replace(/\s+[-|]\s+.+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
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
  return match ? cleanTitle(stripTags(match[1])) : "";
}

function isUsableImageUrl(value = "", pageUrl = "") {
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

function itemImage(item) {
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

function articleFields(source) {
  return {
    source: source.name,
    sourceUrl: source.url || "",
    sourceRole: source.sourceRole || "reference",
    locale: source.locale || "global",
    audience: "uiux",
    area: "design",
    category: source.category || "design_reference",
    topics: source.topics || [],
  };
}

function designValueTags(article) {
  const text = `${article.title || ""} ${article.content || ""}`.toLowerCase();
  const tags = new Set();
  if (/awwwards|siteinspire|land-book|godly|httpster|webflow showcase|website|landing|portfolio|homepage|web design|웹디자인/.test(text)) tags.add("web_reference");
  if (/trend|inspiration|showcase|gallery|lookbook|editorial|magazine|season|collection|트렌드|레퍼런스|룩북/.test(text)) tags.add("visual_trend");
  if (/hero|layout|grid|card|navigation|scroll|section|composition|responsive|레이아웃|그리드|카드|히어로|스크롤/.test(text)) tags.add("layout_pattern");
  if (/typography|typeface|font|color|palette|visual|graphic|illustration|photo|image|타이포|컬러|비주얼|그래픽|일러스트/.test(text)) tags.add("look_and_feel");
  if (/brand|identity|branding|campaign|tone|art direction|creative direction|브랜드|아이덴티티|캠페인/.test(text)) tags.add("brand_expression");
  if (/motion|animation|interaction|transition|microinteraction|3d|scroll-driven|모션|애니메이션|인터랙션/.test(text)) tags.add("motion_interaction");
  if (/commerce|shop|store|product page|lookbook|collection|retail|커머스|쇼핑|상품|스토어/.test(text)) tags.add("commerce_design");
  if (/korea|korean|seoul|한국|국내|대한민국|서울|네이버|카카오|토스|삼성|무신사|올리브영|29cm|w컨셉|ssg|쿠팡|배민/.test(text)) tags.add("korean_reference");
  if (/promotion|event|campaign|sale|coupon|benefit|popup|pop-up|프로모션|이벤트|기획전|행사|혜택|쿠폰|팝업|시즌|페스티벌|라이브/.test(text)) tags.add("promotion_event_design");
  if (/special order|lookbook|collection|brand shop|brand hall|editorial|curation|기획전|스페셜오더|룩북|컬렉션|브랜드관|화보|큐레이션|취향/.test(text)) tags.add("commerce_campaign_design");
  if (/renewal|redesign|case study|app|service|mobile|web|ux|ui|리뉴얼|개편|사례|앱|서비스|모바일|웹|사용성|경험/.test(text)) tags.add("korean_uiux_case");
  if (/design system|component|token|variable|library|documentation|디자인 시스템|컴포넌트|토큰/.test(text)) tags.add("design_system");
  if (/prototype|interaction|animation|motion|framer|프로토타입|인터랙션|모션/.test(text)) tags.add("prototyping");
  if (/brand|visual|campaign|identity|template|브랜드|비주얼|아이덴티티|템플릿/.test(text)) tags.add("visual_reference");
  if (/ai|firefly|canva|figma make|생성|자동화|워크플로우/.test(text)) tags.add("design_ai_workflow");
  if (/research|usability|journey|persona|heuristic|리서치|사용성|여정/.test(text)) tags.add("ux_method");
  return [...tags];
}

async function fetchText(url, timeoutMs, userAgent) {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(timeoutMs),
    headers: { "User-Agent": userAgent },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.text();
}

async function fetchArticleMeta(url) {
  try {
    const html = await fetchText(url, PAGE_TIMEOUT_MS, "CTTD Design Article Metadata Scraper");
    const title = metaContent(html, ["og:title", "twitter:title"]) || pageTitle(html);
    const content = metaContent(html, ["og:description", "twitter:description", "description"]);
    const rawImage = absoluteUrl(metaContent(html, ["og:image", "twitter:image", "image"]), url);
    return {
      title: title ? cleanTitle(title) : "",
      content: content ? shortText(content) : "",
      image: isUsableImageUrl(rawImage, url) ? rawImage : "",
    };
  } catch {
    return {};
  }
}

async function fetchRssFeed(source, since) {
  try {
    const xml = await fetchText(source.rss, FEED_TIMEOUT_MS, "CTTD Trend Report Design RSS Tracker");
    const feed = await parser.parseString(xml);
    return feed.items
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
  } catch (error) {
    console.error(`Error fetching ${source.name}: ${error.message}`);
    return [];
  }
}

function articleContent(item) {
  return shortText(item.contentSnippet || item["content:encoded"] || item.content || "");
}

function extractAnchors(html, baseUrl) {
  const anchors = [];
  const pattern = /<a\b[^>]*?href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  for (const match of html.matchAll(pattern)) {
    const link = absoluteUrl(match[1], baseUrl);
    const title = cleanTitle(stripTags(match[2]));
    if (link && title) anchors.push({ title, link });
  }
  return anchors;
}

async function scrapePage(source, seenPreviousLinks) {
  try {
    const html = await fetchText(source.url, PAGE_TIMEOUT_MS, "CTTD Trend Report Design Page Scraper");
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
      const meta = await fetchArticleMeta(item.link);
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
    return articles;
  } catch (error) {
    console.error(`Error scraping ${source.name}: ${error.message}`);
    return [];
  }
}

async function previousDesignLinks() {
  const today = outputDate();
  const links = new Set();
  const runs = await fs.readdir(runsDir, { withFileTypes: true }).catch(() => []);
  for (const run of runs) {
    if (!run.isDirectory() || run.name === today) continue;
    try {
      const articles = JSON.parse(await fs.readFile(designArticlesPath(run.name), "utf8"));
      for (const article of articles) {
        if (article?.link) links.add(article.link);
      }
    } catch {
      // Older runs may not have design snapshots yet.
    }
  }
  return links;
}

function uniqueArticles(articles) {
  const seen = new Set();
  return articles.filter((article) => {
    const key = article.link || `${article.source}|${article.title}`;
    if (!article.title || !article.link || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function sortArticles(a, b) {
  const roleOrder = { inspiration: 0, official: 1, reference: 2 };
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
  const seenPreviousLinks = await previousDesignLinks();
  const articles = [];

  console.log("Fetching design feeds...");
  for (const source of sources.feeds || []) {
    if (source.rss) articles.push(...await fetchRssFeed(source, since));
  }

  console.log("Scraping design pages...");
  for (const source of sources.pages || []) {
    if (source.url) articles.push(...await scrapePage(source, seenPreviousLinks));
  }

  const output = uniqueArticles(articles)
    .map((article) => ({ ...article, valueTags: designValueTags(article) }))
    .sort(sortArticles);

  const outputPath = designArticlesPath(date);
  await fs.writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");

  console.log(`Fetched ${output.length} design articles`);
  console.log(`Saved to ${outputPath}`);
  console.log("Next: use docs/design-digest-agent-prompt.md to select UIUX design references.");
}

main().catch((error) => {
  console.error("Failed to fetch design news:", error);
  process.exit(1);
});
