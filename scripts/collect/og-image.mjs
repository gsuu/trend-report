// scripts/collect/og-image.mjs
// 원문 페이지에서 og:image 추출 — 빌드 단계에서 picsum fallback 전 우선 시도

let _scraper = null;
let _gotScraping = null;
let _initFailed = false;

async function getScraper() {
  if (_initFailed) return null;
  if (_scraper && _gotScraping) return { scraper: _scraper, gotScraping: _gotScraping };
  try {
    const gotMod = await import("got-scraping");
    const metaMod = await import("metascraper");
    const metaImageMod = await import("metascraper-image");
    const metaUrlMod = await import("metascraper-url");
    const metaTitleMod = await import("metascraper-title");

    _gotScraping = gotMod.gotScraping || gotMod.default?.gotScraping;
    const metascraper = metaMod.default || metaMod;
    const metaImage = metaImageMod.default || metaImageMod;
    const metaUrl = metaUrlMod.default || metaUrlMod;
    const metaTitle = metaTitleMod.default || metaTitleMod;

    if (!_gotScraping || typeof _gotScraping !== "function") {
      throw new Error("gotScraping 함수 로드 실패");
    }

    _scraper = metascraper([metaImage(), metaUrl(), metaTitle()]);
    return { scraper: _scraper, gotScraping: _gotScraping };
  } catch (err) {
    console.warn(`[og-image] 의존성 로드 실패 (skip): ${err.message}`);
    _initFailed = true;
    return null;
  }
}

/**
 * @param {string} url
 * @param {number} [timeoutMs]
 * @returns {Promise<string>}
 */
export async function fetchOgImage(url, timeoutMs = 10000) {
  if (!url || !/^https?:\/\//i.test(url)) return "";
  const tools = await getScraper();
  if (!tools) return "";
  try {
    const res = await tools.gotScraping({
      url,
      timeout: { request: timeoutMs },
      retry: { limit: 1 },
    });
    if (!res.ok) return "";
    const meta = await tools.scraper({ html: res.body, url });
    return meta.image || "";
  } catch {
    return "";
  }
}
