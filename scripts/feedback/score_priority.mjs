#!/usr/bin/env node
// preferences.json을 읽어, 주어진 날짜의 후보들에 누적 가산점을 매겨 출력한다.
// shortlist 작성 단계(LLM)가 이 출력을 참고해 같은 priority 안에서 정렬에만 반영한다.
// 우선순위 자체는 절대 바꾸지 않는다 (soft sort bonus only).
//
// 사용법: node scripts/feedback/score_priority.mjs [--date=YYYY-MM-DD]

import fs from "node:fs/promises";
import path from "node:path";
import url from "node:url";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..", "..");

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

function lookupScore(table, key) {
  if (!key || !table || !table[key]) return 0;
  return Number(table[key].score) || 0;
}

async function main() {
  const date = getArg("date") || todayKST();
  const magazineDir = path.join(root, "runs", date, "magazine");
  const prefsPath = path.join(root, "runs", "_feedback", "preferences.json");
  const prefs = (await readJsonIfExists(prefsPath)) || { domains: {}, publishers: {}, categories: {} };

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

  const scored = classification.map((row) => {
    const sv = svIndex.get(row.id) || {};
    const finalUrl = row.final_source_url || sv.final_source_url || "";
    const publisher = row.publisher || sv.publisher || "";
    const category = row.target_judgment || "";
    const domain = domainOf(finalUrl);
    const domainScore = lookupScore(prefs.domains, domain);
    const publisherScore = lookupScore(prefs.publishers, publisher);
    const categoryScore = lookupScore(prefs.categories, category);
    // 가산점은 도메인+publisher만 합산한다. category(target_judgment)는 너무 거친 범주라
    // (예: core_ecommerce 하나에 오늘의집·컬리·Spotify가 모두 묶임) 평가하지 않은
    // 후보까지 깎이는 사이드이펙트를 만든다. category 가산점은 참고용 breakdown으로만 남기고
    // 정렬 가산점에는 반영하지 않는다.
    const bonus = domainScore + publisherScore;
    return {
      id: row.id,
      area: row.area,
      priority: row.priority,
      bonus,
      breakdown: { domain, domainScore, publisher, publisherScore, category, categoryScore },
    };
  });

  scored.sort((a, b) => b.bonus - a.bonus);
  const outPath = path.join(magazineDir, "feedback-bonus.json");
  await fs.writeFile(outPath, JSON.stringify({
    date,
    policy: prefs.policy || { autoDemote: false, softSortBonusOnly: true },
    scored,
  }, null, 2) + "\n", "utf8");
  console.log(`feedback bonus written: ${outPath}`);
  const nonZero = scored.filter((s) => s.bonus !== 0);
  console.log(`non-zero bonus candidates: ${nonZero.length} / ${scored.length}`);
  if (nonZero.length) {
    for (const s of nonZero.slice(0, 10)) {
      console.log(`  ${s.bonus >= 0 ? "+" : ""}${s.bonus}  ${s.id}  (${s.priority})  domain=${s.breakdown.domain} cat=${s.breakdown.category}`);
    }
  }
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
