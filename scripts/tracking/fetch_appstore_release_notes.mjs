import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  evaluateSignalScore,
  mergeScoring,
  outputDate,
  rawDir as resolveRawDir,
} from "./tracking_utils.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..", "..");
const sourcesPath = path.join(root, "news-tracking", "appstore-tracking.json");
const runsDir = path.join(root, "runs");

function rawDir(date = outputDate()) {
  return resolveRawDir(runsDir, date);
}

function appstoreArticlesPath(date = outputDate()) {
  return path.join(rawDir(date), "appstore-articles.json");
}

function appstoreFetchReportPath(date = outputDate()) {
  return path.join(rawDir(date), "appstore-fetch-report.json");
}

async function lookupApp(appId, country = "kr") {
  const url = `https://itunes.apple.com/lookup?id=${encodeURIComponent(appId)}&country=${encodeURIComponent(country)}`;
  const response = await fetch(url, {
    headers: { "User-Agent": "CTTD Trend Report AppStore Release Note Tracker" },
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${appId}`);
  }
  const data = await response.json();
  if (!data.resultCount) {
    return null;
  }
  return data.results[0];
}

function buildTitle(app, info) {
  const version = info.version || "신규 버전";
  return `${app.name} v${version} — ${(info.releaseNotes || "").split(/\r?\n/)[0] || "릴리즈 노트"}`.slice(0, 180);
}

async function main() {
  const date = outputDate();
  await fs.mkdir(rawDir(date), { recursive: true });
  const sources = JSON.parse(await fs.readFile(sourcesPath, "utf8"));
  const globalScoring = sources.scoring || {};
  const articles = [];
  const sourceResults = [];
  let totalSkippedByScore = 0;

  for (const app of sources.apps || []) {
    if (!app.appId) continue;
    try {
      const info = await lookupApp(app.appId, app.country || "kr");
      if (!info) {
        sourceResults.push({ name: app.name, appId: app.appId, status: "not_found", count: 0 });
        continue;
      }
      const releaseNotes = (info.releaseNotes || "").trim();
      if (!releaseNotes) {
        sourceResults.push({ name: app.name, appId: app.appId, status: "no_release_notes", count: 0 });
        continue;
      }
      const scoring = mergeScoring(globalScoring, app.scoring || {});
      const text = `${app.name} ${info.version || ""} ${releaseNotes}`;
      const signal = evaluateSignalScore(text, scoring);
      if (signal.evaluated && !signal.passes) {
        totalSkippedByScore += 1;
        sourceResults.push({
          name: app.name,
          appId: app.appId,
          status: "skipped_by_score",
          count: 0,
          signalScore: signal.score,
        });
        continue;
      }
      articles.push({
        title: buildTitle(app, info),
        link: info.trackViewUrl || `https://apps.apple.com/${app.country || "kr"}/app/id${app.appId}`,
        pubDate: info.currentVersionReleaseDate || new Date().toUTCString(),
        content: releaseNotes,
        image: info.artworkUrl512 || info.artworkUrl100 || "",
        version: info.version || "",
        source: `App Store - ${app.name}`,
        sourceUrl: info.trackViewUrl || "",
        sourceTier: "discovery",
        sourceRole: "release_note",
        publishStatus: "reference_only",
        locale: (app.country || "kr").toUpperCase(),
        audience: "uiux",
        area: app.area || "service",
        category: app.category || "appstore_release_note",
        appId: app.appId,
        sellerName: info.sellerName || "",
        signalScore: signal.score,
        signalReasons: signal.reasons,
      });
      sourceResults.push({
        name: app.name,
        appId: app.appId,
        status: "ok",
        count: 1,
        version: info.version,
        releaseDate: info.currentVersionReleaseDate,
        signalScore: signal.score,
      });
    } catch (error) {
      console.error(`Error fetching ${app.name}: ${error.message}`);
      sourceResults.push({ name: app.name, appId: app.appId, status: "error", count: 0, error: error.message });
    }
  }

  const outputPath = appstoreArticlesPath(date);
  await fs.writeFile(outputPath, `${JSON.stringify(articles, null, 2)}\n`, "utf8");
  const reportPath = appstoreFetchReportPath(date);
  await fs.writeFile(reportPath, `${JSON.stringify({
    date,
    sourceFile: "news-tracking/appstore-tracking.json",
    totalArticles: articles.length,
    totalSkippedByScore,
    scoring: globalScoring,
    sourceResults,
  }, null, 2)}\n`, "utf8");

  console.log(`Fetched ${articles.length} App Store release notes (skipped by score: ${totalSkippedByScore})`);
  console.log(`Saved to ${outputPath}`);
  console.log(`Saved fetch report to ${reportPath}`);
  console.log("Note: appstore-articles are sourceTier=discovery — never published as main magazine items without a verified product blog/news source.");
}

main().catch((error) => {
  console.error("Failed to fetch App Store release notes:", error);
  process.exit(1);
});
