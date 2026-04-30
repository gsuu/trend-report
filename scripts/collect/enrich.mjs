// scripts/collect/enrich.mjs
// 통과한 후보의 본문을 가져와 OG 메타와 본문 텍스트를 추출
// got-scraping은 named export로 import해야 함

import { gotScraping } from "got-scraping";
import metascraperFactory from "metascraper";
import metaTitle from "metascraper-title";
import metaDesc from "metascraper-description";
import metaImage from "metascraper-image";
import metaUrl from "metascraper-url";
import { JSDOM } from "jsdom";

const scraper = metascraperFactory([metaTitle(), metaDesc(), metaImage(), metaUrl()]);
const TIMEOUT_MS = 15000;

/**
 * @param {import('./types.mjs').RawCandidate} candidate
 * @param {import('./types.mjs').FilterVerdict} verdict
 * @returns {Promise<import('./types.mjs').EnrichedArticle | null>}
 */
export async function enrichArticle(candidate, verdict) {
  if (!candidate.link) return null;
  try {
    const res = await gotScraping({
      url: candidate.link,
      timeout: { request: TIMEOUT_MS },
      retry: { limit: 2 },
    });
    const html = res.body;
    const og = await scraper({ html, url: candidate.link });
    const fullText = extractMainText(html);
    return {
      id: candidate.id,
      title: og.title || candidate.title,
      link: candidate.link,
      pubDate: candidate.pubDate,
      sourceId: candidate.sourceId,
      sourceName: candidate.sourceName,
      category: verdict.category,
      locale: candidate.locale,
      relevance: verdict.relevance,
      tags: verdict.tags ?? [],
      ogTitle: og.title || "",
      ogDescription: og.description || "",
      ogImage: og.image || candidate.image || "",
      fullText: fullText.slice(0, 8000),
    };
  } catch (err) {
    console.error(`[enrich] ${candidate.link} 실패: ${err.message}`);
    return null;
  }
}

function extractMainText(html) {
  try {
    const dom = new JSDOM(html);
    const doc = dom.window.document;
    doc.querySelectorAll("script, style, nav, header, footer, aside").forEach((el) => el.remove());
    const candidates = doc.querySelectorAll("article, main, [role='main'], .post, .article, .content");
    const target = candidates[0] || doc.body;
    return (target?.textContent || "").replace(/\s+/g, " ").trim();
  } catch {
    return "";
  }
}
