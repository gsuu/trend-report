// scripts/collect/fetch.mjs
// 디스패처: source.mode 또는 필드 존재 여부로 RSS / scrape / appstore 분기

import Parser from "rss-parser";
import crypto from "node:crypto";

const parser = new Parser({ timeout: 15000 });
const USER_AGENT = "CTTD Trend Report Bot (+https://magazine.cttd.co.kr)";

/**
 * @param {Object} source
 * @param {Date} sinceDate
 * @returns {Promise<Array>}
 */
export async function fetchSource(source, sinceDate) {
  // 1. App Store (iTunes Lookup API)
  if (source.mode === "appstore" || source.appId) {
    const { fetchAppStoreSource } = await import("./appstore.mjs");
    return fetchAppStoreSource(source, sinceDate);
  }
  // 2. 페이지 스크래핑
  if (source.mode === "scrape" || source.pageUrl) {
    const { scrapeSource } = await import("./scrape.mjs");
    return scrapeSource(source, sinceDate);
  }
  // 3. 기본: RSS
  return fetchRssSource(source, sinceDate);
}

async function fetchRssSource(source, sinceDate) {
  if (!source.rss) return [];
  try {
    const xml = await fetchText(source.rss, source.fetchTimeoutMs ?? 15000);
    const feed = await parser.parseString(xml);
    return feed.items
      .filter((item) => {
        const pub = new Date(item.pubDate || item.isoDate || 0);
        return !Number.isNaN(pub.getTime()) && pub >= sinceDate;
      })
      .filter((item) => {
        const text = `${item.title || ""} ${item.contentSnippet || ""}`;
        return !matchesAny(text, source.excludePatterns || []);
      })
      .slice(0, source.maxItemsPerSource ?? 30)
      .map((item) => ({
        id: makeId(source.id, item.link || item.title),
        title: clean(item.title || ""),
        link: item.link || "",
        pubDate: item.pubDate || item.isoDate || "",
        contentSnippet: clean(item.contentSnippet || ""),
        image: extractImage(item),
        sourceId: source.id,
        sourceName: source.name,
        sourceCategory: source.category,
        locale: source.locale,
      }));
  } catch (err) {
    console.error(`[fetch] ${source.name} 실패: ${err.message}`);
    return [];
  }
}

async function fetchText(url, timeoutMs) {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(timeoutMs),
    headers: { "User-Agent": USER_AGENT },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

function matchesAny(text, patterns) {
  return patterns.some((p) => new RegExp(p, "i").test(text));
}

function clean(value) {
  return String(value).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function extractImage(item) {
  const mc = item["media:content"];
  const mt = item["media:thumbnail"];
  return (
    item.enclosure?.url ||
    (Array.isArray(mc) ? mc[0]?.$?.url : mc?.$?.url) ||
    (Array.isArray(mt) ? mt[0]?.$?.url : mt?.$?.url) ||
    ""
  );
}

function makeId(sourceId, key) {
  const hash = crypto.createHash("sha1").update(key || "").digest("hex").slice(0, 8);
  return `${sourceId}-${hash}`;
}

/**
 * 이전 주차 manifest+weekly 파일에서 본 적 있는 link Set 반환
 */
export async function previouslySeenLinks(dataDir) {
  const fs = await import("node:fs/promises");
  const path = await import("node:path");
  const seen = new Set();
  const manifestPath = path.join(dataDir, "manifest.json");
  let manifest;
  try {
    manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
  } catch {
    return seen;
  }
  for (const entry of manifest.weeks ?? []) {
    try {
      const weekly = JSON.parse(await fs.readFile(path.join(dataDir, "weekly", `${entry.slug}.json`), "utf8"));
      for (const issue of weekly.issues ?? []) {
        if (issue.sourceUrl) seen.add(issue.sourceUrl);
        for (const ref of issue.referenceLinks ?? []) if (ref?.url) seen.add(ref.url);
      }
    } catch {}
  }
  return seen;
}
