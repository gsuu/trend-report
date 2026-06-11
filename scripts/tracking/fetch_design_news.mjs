import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Parser from "rss-parser";
import {
  FEED_TIMEOUT_MS,
  PAGE_TIMEOUT_MS,
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
const sourcesPath = path.join(root, "news-tracking", "design-sources.json");
const runsDir = path.join(root, "runs");
const parser = new Parser();
const paths = makeRawPaths(runsDir, "design");

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

async function fetchRssFeed(source, since) {
  try {
    const xml = await fetchText(source.rss, FEED_TIMEOUT_MS, "CTTD Trend Report Design RSS Tracker");
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
      const meta = await fetchArticleMeta(item.link, {
        userAgent: "CTTD Design Article Metadata Scraper",
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

async function fetchStibeeArchive(source, since, seenPreviousLinks) {
  try {
    const raw = await fetchText(source.url, FEED_TIMEOUT_MS, "CTTD Trend Report Stibee Archive Tracker");
    let issues;
    try {
      issues = JSON.parse(raw);
    } catch {
      issues = [];
    }
    if (!Array.isArray(issues)) issues = [];
    const candidates = issues
      .filter((issue) => issue && issue.permanentLink && issue.subject)
      .filter((issue) => !seenPreviousLinks.has(issue.permanentLink))
      .filter((issue) => {
        if (!issue.sentTime) return true;
        const when = new Date(issue.sentTime);
        return Number.isNaN(when.getTime()) ? true : when >= since;
      })
      .filter((issue) => {
        const text = `${issue.subject} ${issue.previewText || ""}`;
        return matchesAny(text, source.includeTitlePatterns || [])
          && matchesNone(text, source.excludeTitlePatterns || []);
      })
      .sort((a, b) => String(b.sentTime || "").localeCompare(String(a.sentTime || "")))
      .slice(0, source.limit || 8);

    const articles = candidates.map((issue) => ({
      title: cleanTitle(issue.subject),
      link: issue.permanentLink,
      pubDate: issue.sentTime || new Date().toUTCString(),
      content: issue.previewText || "",
      image: "",
      valueTags: [],
      scraped: true,
      ...articleFields(source),
    }));
    return { articles, error: "" };
  } catch (error) {
    console.error(`Error fetching Stibee archive ${source.name}: ${error.message}`);
    return { articles: [], error: error.message };
  }
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
  await fs.mkdir(paths.rawDir(date), { recursive: true });

  const sources = JSON.parse(await fs.readFile(sourcesPath, "utf8"));
  const since = sinceDate();
  const seenPreviousLinks = await previousLinks(runsDir, paths.articlesPath, date);
  const articles = [];
  const sourceResults = [];

  console.log("Fetching design feeds...");
  await collectSourceGroup({
    sources, key: "feeds", type: "feed", urlField: "rss",
    handler: (source) => fetchRssFeed(source, since),
    articles, sourceResults,
  });

  console.log("Scraping design pages...");
  await collectSourceGroup({
    sources, key: "pages", type: "page", urlField: "url",
    handler: (source) => scrapePage(source, seenPreviousLinks),
    articles, sourceResults,
  });

  console.log("Reading Stibee newsletter archives...");
  await collectSourceGroup({
    sources, key: "stibeeArchives", type: "stibeeArchive", urlField: "url",
    handler: (source) => fetchStibeeArchive(source, since, seenPreviousLinks),
    articles, sourceResults,
  });

  const output = uniqueArticles(articles)
    .filter((article) => !isAutoExcluded(article.title, "design"))
    .map((article) => ({ ...article, valueTags: designValueTags(article) }))
    .sort(sortArticles);

  await writeFetchOutput({
    paths, date,
    sourceFile: "news-tracking/design-sources.json",
    output, sourceResults,
    fetchedLabel: "design articles",
    nextHint: "Next: use docs/design-digest-agent-prompt.md to select UIUX design references.",
  });
}

main().catch((error) => {
  console.error("Failed to fetch design news:", error);
  process.exit(1);
});
