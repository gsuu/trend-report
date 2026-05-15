// scripts/collect/scrape.mjs
// RSS 미제공 사이트 대응 — 페이지 HTML에서 anchor 추출 + 정규식 필터

import crypto from "node:crypto";

const USER_AGENT = "CTTD Trend Report Bot (+https://magazine.cttd.co.kr)";

/**
 * 페이지 스크래핑 모드 source 처리
 * source.pageUrl: 인덱스 페이지 (예: 매거진 메인)
 * source.includeLinkPatterns: 정규식 배열 (anchor href 매칭)
 * source.excludeLinkPatterns / excludeTitlePatterns: 제외 정규식
 *
 * @param {Object} source
 * @param {Date} sinceDate (현재 미사용 — 페이지 anchor에 날짜 정보 없음)
 * @returns {Promise<Array>}
 */
export async function scrapeSource(source, sinceDate) {
  if (!source.pageUrl) return [];
  try {
    const html = await fetchText(source.pageUrl, source.fetchTimeoutMs ?? 15000);
    const anchors = extractAnchors(html, source.pageUrl);

    const seen = new Set();
    const filtered = anchors
      .filter((a) => matchesAny(a.link, source.includeLinkPatterns || []))
      .filter((a) => !matchesAny(a.link, source.excludeLinkPatterns || []))
      .filter((a) => !matchesAny(a.title, source.excludePatterns || source.excludeTitlePatterns || []))
      .filter((a) => {
        if (seen.has(a.link)) return false;
        seen.add(a.link);
        return true;
      })
      .slice(0, source.maxItemsPerSource ?? 30);

    return filtered.map((a) => ({
      id: makeId(source.id, a.link),
      title: a.title,
      link: a.link,
      pubDate: "",
      contentSnippet: "",
      image: "",
      sourceId: source.id,
      sourceName: source.name,
      sourceCategory: source.category,
      locale: source.locale,
    }));
  } catch (err) {
    console.error(`[scrape] ${source.name} 실패: ${err.message}`);
    return [];
  }
}

async function fetchText(url, timeoutMs) {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(timeoutMs),
    headers: { "User-Agent": USER_AGENT, "Accept-Language": "ko,en;q=0.8" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

function extractAnchors(html, baseUrl) {
  const anchors = [];
  const pattern = /<a\b[^>]*?href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  for (const m of html.matchAll(pattern)) {
    let link;
    try { link = new URL(m[1], baseUrl).toString(); } catch { continue; }
    const title = m[2].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    if (link && title && title.length > 3) anchors.push({ title, link });
  }
  return anchors;
}

function matchesAny(text, patterns) {
  if (!patterns?.length) return false;
  return patterns.some((p) => new RegExp(p, "i").test(text || ""));
}

function makeId(sourceId, key) {
  const hash = crypto.createHash("sha1").update(key || "").digest("hex").slice(0, 8);
  return `${sourceId}-${hash}`;
}
