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
const sourcesPath = path.join(root, "news-tracking", "service-sources.json");
const runsDir = path.join(root, "runs");
const parser = new Parser();

function runDir(date = outputDate()) {
  return resolveRunDir(runsDir, date);
}

function serviceArticlesPath(date = outputDate()) {
  return path.join(runDir(date), "service-articles.json");
}

function serviceFetchReportPath(date = outputDate()) {
  return path.join(runDir(date), "service-fetch-report.json");
}

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

function addTagWhen(tags, name, pattern, text) {
  if (pattern.test(text)) tags.add(name);
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
  await fs.mkdir(runDir(date), { recursive: true });

  const sources = JSON.parse(await fs.readFile(sourcesPath, "utf8"));
  const since = sinceDate();
  const seenPreviousLinks = await previousLinks(runsDir, serviceArticlesPath, date);
  const articles = [];
  const sourceResults = [];

  console.log("Fetching service feeds...");
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

  console.log("Scraping service pages...");
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
    .map((article) => ({
      ...article,
      evidenceTags: serviceEvidenceTags(article),
      riskTags: serviceRiskTags(article),
    }))
    .sort(sortArticles);

  const outputPath = serviceArticlesPath(date);
  await fs.writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
  const reportPath = serviceFetchReportPath(date);
  await fs.writeFile(reportPath, `${JSON.stringify({
    date,
    sourceFile: "news-tracking/service-sources.json",
    totalArticles: output.length,
    sourceResults,
  }, null, 2)}\n`, "utf8");

  console.log(`Fetched ${output.length} SERVICE articles`);
  console.log(`Saved to ${outputPath}`);
  console.log(`Saved fetch report to ${reportPath}`);
  console.log("Next: use docs/service-digest-agent-prompt.md to verify source evidence and select service items.");
}

main().catch((error) => {
  console.error("Failed to fetch SERVICE news:", error);
  process.exit(1);
});
