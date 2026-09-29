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
  decodeHtml,
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
const sourcesPath = path.join(root, "news-tracking", "service-sources.json");
const runsDir = path.join(root, "runs");
const parser = new Parser();
const paths = makeRawPaths(runsDir, "service");

function isGenericTitle(value = "") {
  return /^(게시물 상세|상세|뉴스 상세|보도자료 상세|공지사항 상세|article|detail)$/i.test(cleanTitle(value));
}

function articleFields(source) {
  return {
    source: source.name,
    sourceUrl: source.url || "",
    sourceRole: source.sourceRole || "official",
    publishStatus: source.publishStatus || "pending",
    locale: source.locale || "KR",
    audience: "uiux",
    area: "service",
    category: source.category || "service",
    priority: source.priority || "",
    topics: source.topics || [],
  };
}

function serviceEvidenceTags(article) {
  const text = `${article.title || ""} ${article.content || ""}`.toLowerCase();
  const tags = new Set();
  addTagWhen(tags, "commerce_core", /commerce|커머스|쇼핑|상품|스토어|온라인몰|마켓플레이스|기획전|브랜드스토어/, text);
  addTagWhen(tags, "search_discovery", /search|discovery|검색|탐색|발견|추천|개인화|큐레이션/, text);
  addTagWhen(tags, "membership_retention", /membership|subscription|retention|멤버십|구독|리텐션|재구매|혜택|CRM/i, text);
  addTagWhen(tags, "review_trust", /review|trust|후기|리뷰|신뢰|검수|인증|프로필/, text);
  addTagWhen(tags, "payment_checkout", /payment|checkout|pay|결제|주문|예약|장바구니|쿠폰/, text);
  addTagWhen(tags, "o2o_flow", /pickup|offline|store|visit|픽업|매장|오프라인|방문|오늘드림|예약/, text);
  addTagWhen(tags, "seller_operation", /seller|admin|operation|판매자|운영|정산|광고|소상공인|파트너/, text);
  addTagWhen(tags, "service_ai", /\bai\b|agent|chatbot|assistant|자동화|챗봇|에이전트|생성형|인공지능/, text);
  if (article.category === "research") {
    addTagWhen(tags, "research_signal", /research|report|survey|리서치|조사|리포트|데이터|트렌드/, text);
  }
  return [...tags];
}

function serviceRiskTags(article) {
  const text = `${article.title || ""} ${article.content || ""}`.toLowerCase();
  const tags = new Set();
  addTagWhen(tags, "weak_promo", /프로모션|이벤트|세일|할인|쿠폰|혜택|campaign|promotion|event|sale/, text);
  addTagWhen(tags, "partnership_only", /제휴|협약|파트너십|collaboration|partnership|mou/, text);
  addTagWhen(tags, "offline_only", /팝업|오프라인|매장 오픈|전시|행사|popup|offline/, text);
  addTagWhen(tags, "business_only", /투자|실적|매출|영업이익|인수|상장|ir|earnings|revenue/, text);
  addTagWhen(tags, "hiring_or_esg", /채용|공채|esg|사회공헌|기부|봉사|sustainability/, text);
  return [...tags];
}

async function fetchRssFeed(source, since) {
  try {
    const xml = await fetchText(source.rss, FEED_TIMEOUT_MS, "CTTD Trend Report SERVICE RSS Tracker");
    const feed = await parser.parseString(xml);
    const articles = [];
    for (const item of feed.items) {
      if (!item.pubDate && !item.isoDate) continue;
      const pubDate = new Date(item.pubDate || item.isoDate);
      if (Number.isNaN(pubDate.getTime()) || pubDate < since) continue;
      const content = articleContent(item, 700);
      const text = `${item.title || ""} ${content}`;
      if (!matchesAny(text, source.includeTitlePatterns || [])) continue;
      if (!matchesNone(text, source.excludeTitlePatterns || [])) continue;
      const meta = item.link
        ? await fetchArticleMeta(item.link, {
            userAgent: "CTTD Service Article Metadata Scraper",
            textLimit: 700,
          })
        : {};
      const metaTitle = cleanTitle(meta.title || "");
      articles.push({
        title: isGenericTitle(metaTitle) ? cleanTitle(item.title || "") : cleanTitle(metaTitle || item.title || ""),
        link: item.link || "",
        pubDate: item.pubDate || item.isoDate || "",
        content: meta.content || content,
        image: meta.image || itemImage(item),
        ...articleFields(source),
      });
    }
    return { articles, error: "" };
  } catch (error) {
    console.error(`Error fetching ${source.name}: ${error.message}`);
    return { articles: [], error: error.message };
  }
}

async function scrapePage(source, seenPreviousLinks) {
  try {
    const html = await fetchText(source.url, PAGE_TIMEOUT_MS, "CTTD Trend Report SERVICE Page Scraper");
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
        userAgent: "CTTD Service Article Metadata Scraper",
        textLimit: 700,
      });
      const metaTitle = cleanTitle(meta.title || "");
      const title = isGenericTitle(metaTitle) ? cleanTitle(item.title) : cleanTitle(metaTitle || item.title);
      if (!matchesNone(title, source.excludeTitlePatterns || [])) continue;
      articles.push({
        title,
        link: item.link,
        pubDate: scrapedAt,
        content: meta.content || item.title,
        image: meta.image || "",
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

function parseSitemapUrls(xml) {
  const entries = [];
  for (const match of xml.matchAll(/<url\b[^>]*>([\s\S]*?)<\/url>/gi)) {
    const block = match[1];
    const loc = block.match(/<loc>\s*([\s\S]*?)\s*<\/loc>/i)?.[1];
    if (!loc) continue;
    const lastmod = block.match(/<lastmod>\s*([\s\S]*?)\s*<\/lastmod>/i)?.[1] || "";
    entries.push({ link: decodeHtml(loc), lastmod: lastmod.trim() });
  }
  return entries;
}

// 사이트맵(article-sitemap.xml)에서 최근 URL을 골라 본문 메타로 제목을 확보한다.
// RSS도 SSR 링크 목록도 없는 SPA(예: 뉴닉) 대응. source.url은 <urlset> 사이트맵을 직접 가리킨다.
async function fetchSitemap(source, since, seenPreviousLinks) {
  try {
    const xml = await fetchText(source.url, FEED_TIMEOUT_MS, "CTTD Trend Report SERVICE Sitemap Tracker");
    const candidates = parseSitemapUrls(xml)
      .filter((item) => matchesAny(item.link, source.includeLinkPatterns || []))
      .filter((item) => matchesNone(item.link, source.excludeLinkPatterns || []))
      .filter((item) => !seenPreviousLinks.has(item.link))
      .filter((item) => {
        if (!item.lastmod) return true;
        const when = new Date(item.lastmod);
        return Number.isNaN(when.getTime()) ? true : when >= since;
      })
      .sort((a, b) => String(b.lastmod || "").localeCompare(String(a.lastmod || "")))
      .slice(0, source.limit || 12);

    const articles = [];
    for (const item of candidates) {
      const meta = await fetchArticleMeta(item.link, {
        userAgent: "CTTD Service Article Metadata Scraper",
        textLimit: 700,
      });
      const title = cleanTitle(meta.title || "");
      if (!title || isGenericTitle(title)) continue;
      const text = `${title} ${meta.content || ""}`;
      if (!matchesAny(text, source.includeTitlePatterns || [])) continue;
      if (!matchesNone(text, source.excludeTitlePatterns || [])) continue;
      articles.push({
        title,
        link: item.link,
        pubDate: item.lastmod || new Date().toUTCString(),
        content: meta.content || "",
        image: meta.image || "",
        scraped: true,
        ...articleFields(source),
      });
    }
    return { articles, error: "" };
  } catch (error) {
    console.error(`Error fetching sitemap ${source.name}: ${error.message}`);
    return { articles: [], error: error.message };
  }
}

function sortArticles(a, b) {
  const priorityOrder = { priority_commerce: 0, priority_platform: 1 };
  const roleOrder = { official: 0, reference: 1, discovery: 2 };
  const localeOrder = { KR: 0, ko: 0, global: 1 };
  return (priorityOrder[a.priority] ?? 9) - (priorityOrder[b.priority] ?? 9)
    || (localeOrder[a.locale] ?? 1) - (localeOrder[b.locale] ?? 1)
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

  console.log("Fetching service feeds...");
  await collectSourceGroup({
    sources, key: "feeds", type: "feed", urlField: "rss",
    handler: (source) => fetchRssFeed(source, since),
    articles, sourceResults,
  });

  console.log("Scraping service pages...");
  await collectSourceGroup({
    sources, key: "pages", type: "page", urlField: "url",
    handler: (source) => scrapePage(source, seenPreviousLinks),
    articles, sourceResults,
  });

  console.log("Reading service sitemaps...");
  await collectSourceGroup({
    sources, key: "sitemaps", type: "sitemap", urlField: "url",
    handler: (source) => fetchSitemap(source, since, seenPreviousLinks),
    articles, sourceResults,
  });

  const output = uniqueArticles(articles)
    .filter((article) => !isAutoExcluded(article.title, "service"))
    .map((article) => ({
      ...article,
      evidenceTags: serviceEvidenceTags(article),
      riskTags: serviceRiskTags(article),
    }))
    .sort(sortArticles);

  await writeFetchOutput({
    paths, date,
    sourceFile: "news-tracking/service-sources.json",
    output, sourceResults,
    fetchedLabel: "SERVICE articles",
    nextHint: "Next: use docs/service-digest-agent-prompt.md to verify source evidence and select service items.",
  });
}

main().catch((error) => {
  console.error("Failed to fetch SERVICE news:", error);
  process.exit(1);
});
