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
import { hasNaverApiHubCredentials, searchBlog, searchTrend, searchWeb } from "../collect/naver_api_hub.mjs";

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

// "20260925" → Date. 블로그 검색 응답의 postdate 형식.
function parseNaverPostdate(value = "") {
  const match = String(value).match(/^(\d{4})(\d{2})(\d{2})$/);
  return match ? new Date(`${match[1]}-${match[2]}-${match[3]}T00:00:00+09:00`) : null;
}

// NAVER API HUB 블로그·웹문서 검색. 공식 채널이 놓친 서비스 변화를 찾는 발견 경로라서
// sourceRole은 기본 discovery — 글쓰기 전 source-verifier가 최종 기준 원문을 따로 찾는다.
async function fetchNaverSearch(source, since, seenPreviousLinks) {
  try {
    const display = Math.min(source.display || 30, 100);
    const isBlog = source.api === "blog";
    const data = isBlog
      ? await searchBlog(source.query, { display, sort: source.sort || "date" })
      : await searchWeb(source.query, { display });

    const candidates = data.items
      .map((item) => {
        const postdate = isBlog ? parseNaverPostdate(item.postdate) : null;
        return { ...item, postdate };
      })
      // 웹문서 검색은 날짜가 없어 이전 회차에 본 링크로만 신선도를 거른다.
      .filter((item) => (item.postdate ? item.postdate >= since : !seenPreviousLinks.has(item.link)))
      .filter((item) => matchesAny(`${item.title} ${item.description}`, source.includeTitlePatterns || []))
      .filter((item) => matchesNone(`${item.title} ${item.description}`, source.excludeTitlePatterns || []))
      .filter((item) => matchesAny(item.link, source.includeLinkPatterns || []))
      .filter((item) => matchesNone(item.link, source.excludeLinkPatterns || []))
      .slice(0, source.limit || 8);

    const articles = [];
    for (const item of candidates) {
      const meta = await fetchArticleMeta(item.link, {
        userAgent: "CTTD Service Article Metadata Scraper",
        textLimit: 700,
      });
      articles.push({
        title: cleanTitle(item.title),
        link: item.link,
        pubDate: item.postdate ? item.postdate.toUTCString() : new Date().toUTCString(),
        content: item.description || meta.content || "",
        image: meta.image || "",
        scraped: !item.postdate,
        searchQuery: source.query,
        searchApi: isBlog ? "naver_blog" : "naver_webkr",
        ...(isBlog ? { blogger: item.bloggername || "" } : {}),
        ...articleFields({ sourceRole: "discovery", ...source }),
      });
    }
    return { articles, error: "" };
  } catch (error) {
    console.error(`Error searching ${source.name}: ${error.message}`);
    return { articles: [], error: error.message };
  }
}

// 데이터랩 검색어트렌드. 후보 기사가 아니라 편집 맥락 자료라서 articles와 별도 파일로 남긴다.
async function fetchNaverTrend(trendConfig, date) {
  if (!trendConfig?.keywordGroups?.length) return null;
  const end = new Date();
  const start = new Date(end.getTime() - (trendConfig.days || 56) * 24 * 60 * 60 * 1000);
  const iso = (value) => value.toISOString().slice(0, 10);
  const results = [];
  // API 한 번에 최대 5그룹.
  for (let index = 0; index < trendConfig.keywordGroups.length; index += 5) {
    const data = await searchTrend({
      startDate: iso(start),
      endDate: iso(end),
      timeUnit: trendConfig.timeUnit || "week",
      keywordGroups: trendConfig.keywordGroups.slice(index, index + 5),
    });
    results.push(...data.results.map((result) => ({
      ...result,
      // 같은 요청 안에서만 비교 가능한 상대값이라 요청 묶음 번호를 함께 남긴다.
      batch: index / 5,
      latestRatio: result.data.at(-1)?.ratio ?? null,
      changeFromFirst: result.data.length > 1 ? Number((result.data.at(-1).ratio - result.data[0].ratio).toFixed(2)) : null,
    })));
  }
  const outputPath = path.join(paths.rawDir(date), "service-naver-trend.json");
  await fs.writeFile(outputPath, `${JSON.stringify({ date, startDate: iso(start), endDate: iso(end), results }, null, 2)}\n`, "utf8");
  console.log(`Saved Naver search trend to ${outputPath}`);
  return outputPath;
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

  if (hasNaverApiHubCredentials()) {
    console.log("Searching NAVER API HUB (blog/webkr)...");
    await collectSourceGroup({
      sources, key: "naverSearch", type: "naver_search", urlField: "query",
      handler: (source) => fetchNaverSearch(source, since, seenPreviousLinks),
      articles, sourceResults,
    });
    try {
      await fetchNaverTrend(sources.naverTrend, date);
    } catch (error) {
      console.error(`Error fetching Naver search trend: ${error.message}`);
      sourceResults.push({ name: "네이버 데이터랩 검색어트렌드", type: "naver_trend", url: "", status: "error", count: 0, error: error.message });
    }
  } else if ((sources.naverSearch || []).length) {
    console.warn("NAVER_API_HUB_CLIENT_ID/SECRET 없음 — 네이버 검색 수집을 건너뜁니다.");
    for (const source of sources.naverSearch) {
      sourceResults.push({ name: source.name, type: "naver_search", url: source.query, status: "skipped", count: 0, error: "missing NAVER_API_HUB credentials" });
    }
  }

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
