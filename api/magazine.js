import { fetchMagazineReport } from "../scripts/legacy/fetch_notion.mjs";

const cacheTtl = 5 * 60 * 1000;
const staleTtl = 15 * 60 * 1000;
let cachedPayload;
let cachedAt = 0;
let pendingFetch;

export default async function handler(request, response) {
  if (request.method && request.method !== "GET") {
    response.status(405).json({ ok: false, error: "Method Not Allowed" });
    return;
  }

  try {
    const report = await loadReport();
    response.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
    response.status(200).json({ ok: true, report });
  } catch (error) {
    const staleReport = staleCachedReport();
    if (staleReport) {
      response.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
      response.status(200).json({ ok: true, report: staleReport, stale: true });
      return;
    }

    response.status(500).json({
      ok: false,
      error: error.message || "Failed to fetch magazine data.",
    });
  }
}

async function loadReport() {
  if (freshCachedReport()) return cachedPayload;
  if (!pendingFetch) {
    pendingFetch = fetchMagazineReport()
      .then((report) => {
        cachedPayload = report;
        cachedAt = Date.now();
        return report;
      })
      .finally(() => {
        pendingFetch = null;
      });
  }
  return pendingFetch;
}

function freshCachedReport() {
  return cachedPayload && Date.now() - cachedAt < cacheTtl;
}

function staleCachedReport() {
  if (!cachedPayload) return null;
  return Date.now() - cachedAt < staleTtl ? cachedPayload : null;
}
