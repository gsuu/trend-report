#!/usr/bin/env node
// 사용자가 채운 feedback-YYYY-MM-DD.md를 파싱해
// runs/_feedback/preferences.json에 누적 점수를 합산한다.
// 사용법: node scripts/feedback/apply_feedback.mjs [--date=YYYY-MM-DD] [--dry-run]
//
// 소프트 가산점만 누적한다. 우선순위 자동 강등이나 도메인 차단은 일어나지 않는다.

import fs from "node:fs/promises";
import path from "node:path";
import url from "node:url";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..", "..");

const REASON_CODES = new Set([
  "general_appeal_low",
  "audience_mismatch",
  "stale_topic",
  "promotional",
  "weak_evidence",
  "weak_source",
  "other",
]);

function todayKST() {
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return kst.toISOString().slice(0, 10);
}

function getArg(name) {
  const prefix = `--${name}=`;
  const found = process.argv.find((a) => a.startsWith(prefix));
  return found ? found.slice(prefix.length) : null;
}

function hasFlag(name) {
  return process.argv.includes(`--${name}`);
}

async function readJsonIfExists(filePath) {
  try {
    return JSON.parse(await fs.readFile(filePath, "utf8"));
  } catch {
    return null;
  }
}

function domainOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function clampScore(n) {
  const x = Math.max(-2, Math.min(2, Math.round(n)));
  return x;
}

function parseFeedbackTable(md) {
  const lines = md.split(/\r?\n/);
  const header = lines.findIndex((l) => /^\|\s*#\s*\|\s*id\s*\|/.test(l));
  if (header === -1) return [];
  const rows = [];
  for (let i = header + 2; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line.startsWith("|")) break;
    const cells = line.split("|").map((c) => c.trim());
    // 행 예시: ["", "1", "service-0", "service", "P0", "...", "0", "audience_mismatch", "메모", ""]
    if (cells.length < 9) continue;
    const [, idx, id, area, priority, title, score, reasons, note] = cells;
    const scoreNum = Number(score);
    if (!id || Number.isNaN(scoreNum)) continue;
    const reasonList = (reasons || "")
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s && REASON_CODES.has(s));
    rows.push({
      idx: Number(idx),
      id,
      area,
      priority,
      title,
      score: clampScore(scoreNum),
      reasons: reasonList,
      note: note || "",
    });
  }
  return rows;
}

async function loadCandidateMeta(date) {
  const magazineDir = path.join(root, "runs", date, "magazine");
  const classification = (await readJsonIfExists(path.join(magazineDir, "target-classification.json"))) || [];
  const svFiles = ["source-verification-service.json", "source-verification-design.json", "source-verification-dev.json"];
  const svIndex = new Map();
  for (const f of svFiles) {
    const data = await readJsonIfExists(path.join(magazineDir, f));
    if (Array.isArray(data)) {
      for (const row of data) {
        if (row && row.id) svIndex.set(row.id, row);
      }
    }
  }
  const meta = new Map();
  for (const row of classification) {
    const sv = svIndex.get(row.id) || {};
    meta.set(row.id, {
      finalSourceUrl: row.final_source_url || sv.final_source_url || "",
      publisher: row.publisher || sv.publisher || "",
      category: row.target_judgment || "",
      area: row.area || "",
    });
  }
  return meta;
}

function bump(obj, key, score) {
  if (!key) return;
  if (!obj[key]) obj[key] = { score: 0, count: 0 };
  obj[key].score += score;
  obj[key].count += 1;
}

function bumpReason(reasons, code, key) {
  if (!key) return;
  if (!reasons[code]) reasons[code] = {};
  reasons[code][key] = (reasons[code][key] || 0) + 1;
}

async function main() {
  const date = getArg("date") || todayKST();
  const dryRun = hasFlag("dry-run");
  const feedbackPath = path.join(root, "runs", date, "magazine", `feedback-${date}.md`);
  const prefsPath = path.join(root, "runs", "_feedback", "preferences.json");

  const md = await fs.readFile(feedbackPath, "utf8").catch((err) => {
    throw new Error(`feedback 파일을 찾지 못했습니다: ${feedbackPath}\n  먼저 \`npm run feedback:template -- --date=${date}\`로 생성하세요.`);
  });
  const rows = parseFeedbackTable(md);
  if (rows.length === 0) {
    console.error(`피드백 표를 파싱하지 못했습니다: ${feedbackPath}`);
    process.exit(1);
  }
  const meta = await loadCandidateMeta(date);

  const prefs = (await readJsonIfExists(prefsPath)) || {};
  prefs.version = 1;
  prefs.updatedAt = todayKST();
  prefs.policy = prefs.policy || {
    scoreScale: [-2, -1, 0, 1, 2],
    autoDemote: false,
    softSortBonusOnly: true,
    note: "이 파일은 사용자 평가가 누적되는 가중치 저장소다. autoDemote=false이므로 우선순위 자체는 바꾸지 않고, shortlist 정렬과 안내 표시에만 가산점으로 반영한다.",
  };
  prefs.domains = prefs.domains || {};
  prefs.publishers = prefs.publishers || {};
  prefs.categories = prefs.categories || {};
  prefs.reasons = prefs.reasons || {};
  prefs.history = prefs.history || [];

  let nonZero = 0;
  for (const row of rows) {
    if (row.score === 0 && row.reasons.length === 0) continue;
    nonZero += 1;
    const m = meta.get(row.id) || {};
    const domain = domainOf(m.finalSourceUrl);
    bump(prefs.domains, domain, row.score);
    bump(prefs.publishers, m.publisher, row.score);
    bump(prefs.categories, m.category, row.score);
    for (const code of row.reasons) {
      bumpReason(prefs.reasons, code, domain || m.publisher || row.id);
    }
    prefs.history.push({
      date,
      id: row.id,
      score: row.score,
      reasons: row.reasons,
      domain,
      publisher: m.publisher,
      category: m.category,
      note: row.note,
    });
  }

  console.log(`feedback rows parsed: ${rows.length}`);
  console.log(`non-zero feedback applied: ${nonZero}`);
  if (dryRun) {
    console.log("--dry-run: preferences.json 저장하지 않음. 미리보기:");
    console.log(JSON.stringify({
      domains: Object.fromEntries(Object.entries(prefs.domains).slice(-5)),
      categories: prefs.categories,
      reasons: Object.fromEntries(Object.entries(prefs.reasons).map(([k, v]) => [k, Object.keys(v).length])),
    }, null, 2));
    return;
  }
  await fs.mkdir(path.dirname(prefsPath), { recursive: true });
  await fs.writeFile(prefsPath, JSON.stringify(prefs, null, 2) + "\n", "utf8");
  console.log(`preferences updated: ${prefsPath}`);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
