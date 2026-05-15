// scripts/collect/appstore.mjs
// 앱스토어 업데이트 추적 — iTunes Lookup API 사용
// API: https://itunes.apple.com/lookup?id={appId}&country={kr|us|...}
// 응답: { results: [{ trackName, version, currentVersionReleaseDate, releaseNotes, screenshotUrls, ... }] }

import crypto from "node:crypto";

const USER_AGENT = "CTTD Trend Report Bot (+https://magazine.cttd.co.kr)";

/**
 * @param {Object} source - { id, name, category, locale, appId, country }
 * @param {Date} sinceDate
 * @returns {Promise<Array>}
 */
export async function fetchAppStoreSource(source, sinceDate) {
  if (!source.appId) return [];
  const country = source.country || "kr";
  const url = `https://itunes.apple.com/lookup?id=${source.appId}&country=${country}`;
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(source.fetchTimeoutMs ?? 15000),
      headers: { "User-Agent": USER_AGENT, "Accept": "application/json" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const r = data.results?.[0];
    if (!r) {
      console.warn(`[appstore] ${source.name}: appId=${source.appId} 결과 없음`);
      return [];
    }

    const releaseDate = new Date(r.currentVersionReleaseDate || 0);
    if (Number.isNaN(releaseDate.getTime()) || releaseDate < sinceDate) {
      // 7일 이내 업데이트가 아니면 skip
      return [];
    }

    const version = r.version || "";
    const versionSlug = version.replace(/[^\w.-]/g, "_");
    const id = `${source.id}-v${versionSlug || crypto.createHash("sha1").update(r.currentVersionReleaseDate || "").digest("hex").slice(0, 6)}`;

    const releaseNotes = (r.releaseNotes || "").trim();
    const screenshot = r.screenshotUrls?.[0] || r.ipadScreenshotUrls?.[0] || r.artworkUrl512 || "";

    return [{
      id,
      title: `${r.trackName} ${version} 업데이트`,
      link: r.trackViewUrl || `https://apps.apple.com/${country}/app/id${source.appId}`,
      pubDate: r.currentVersionReleaseDate,
      contentSnippet: releaseNotes.slice(0, 800),
      image: screenshot,
      sourceId: source.id,
      sourceName: source.name,
      sourceCategory: source.category,
      locale: source.locale || (country === "kr" ? "KR" : "global"),
    }];
  } catch (err) {
    console.error(`[appstore] ${source.name} 실패: ${err.message}`);
    return [];
  }
}
