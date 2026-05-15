#!/usr/bin/env node
// 오늘자 shortlist(target-classification.json + source-verification-*.json)를 읽어
// 사용자 평가 입력용 마크다운 템플릿을 생성한다.
// 사용법: node scripts/feedback/generate_template.mjs [--date=YYYY-MM-DD]

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

async function loadCandidates(date) {
  const magazineDir = path.join(root, "runs", date, "magazine");
  const classification = await readJsonIfExists(path.join(magazineDir, "target-classification.json"));
  if (!classification || !Array.isArray(classification)) {
    throw new Error(`target-classification.json을 찾지 못했습니다: ${magazineDir}`);
  }
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
  return classification.map((row) => {
    const sv = svIndex.get(row.id) || {};
    return {
      id: row.id,
      area: row.area || "",
      title: row.title || sv.title || "(제목 없음)",
      finalSourceUrl: row.final_source_url || sv.final_source_url || "",
      publisher: row.publisher || sv.publisher || "",
      priority: row.priority || "",
      targetJudgment: row.target_judgment || "",
      headline: row.headline || "",
    };
  });
}

function domainOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function templateMarkdown(date, candidates) {
  const lines = [
    `---`,
    `date: ${date}`,
    `purpose: shortlist user feedback`,
    `score_scale: "-2 절대 제외 / -1 감점 / 0 보통 / +1 가점 / +2 우대"`,
    `reason_codes: "general_appeal_low | audience_mismatch | stale_topic | promotional | weak_evidence | weak_source | other"`,
    `total_candidates: ${candidates.length}`,
    `---`,
    "",
    `# ${date} 매거진 후보 피드백`,
    "",
    `이 파일은 shortlist의 각 후보에 대해 사용자가 점수와 사유를 매기는 입력 파일입니다.`,
    `채워서 저장한 뒤 \`npm run feedback:apply -- --date=${date}\`를 실행하면 \`runs/_feedback/preferences.json\`에 누적됩니다.`,
    `누적 가중치는 다음 fetch부터 shortlist 정렬에만 소프트 가산점으로 반영되며(우선순위 자동 강등 없음), 자동 차단은 일어나지 않습니다.`,
    "",
    `## 점수 척도`,
    "",
    `| 점수 | 의미 |`,
    `|---|---|`,
    `| -2 | 절대 제외하고 싶음 (도메인·주제 누적 감점 강화) |`,
    `| -1 | 흥미 없음 / 감점 (다음 shortlist 정렬에서 아래로) |`,
    `|  0 | 보통 (기본값, 변화 없음) |`,
    `| +1 | 가점 (정렬에서 위로) |`,
    `| +2 | 다음에도 같은 소스·주제 우대 |`,
    "",
    `## 사유 코드 (다중 선택 가능, 쉼표로 구분)`,
    "",
    `- \`general_appeal_low\` — 독자에게 흥미가 없을 것 같다`,
    `- \`audience_mismatch\` — CTTD 독자(웹기획·UIUX·웹DEV)와 관련 없다`,
    `- \`stale_topic\` — 이미 다뤘거나 신선도 낮다`,
    `- \`promotional\` — 단순 홍보·광고성`,
    `- \`weak_evidence\` — 화면·플로우 근거가 약하다`,
    `- \`weak_source\` — 출처 신뢰도가 낮다`,
    `- \`other\` — 기타 (메모에 직접 적기)`,
    "",
    `## 입력 표`,
    "",
    `각 행의 **score**와 **reasons** 칸만 채우면 됩니다. 0점이면 그대로 두세요.`,
    `메모가 있으면 \`note\` 칸에 자유롭게 적어주세요.`,
    "",
    `| # | id | area | priority | 제목 | score | reasons | note |`,
    `|---|---|---|---|---|---|---|---|`,
  ];
  candidates.forEach((c, i) => {
    const titleSafe = c.title.replace(/\|/g, "\\|").slice(0, 80);
    lines.push(`| ${i + 1} | ${c.id} | ${c.area} | ${c.priority} | ${titleSafe} | 0 |  |  |`);
  });
  lines.push("");
  lines.push(`## 후보 상세 (참조용)`);
  lines.push("");
  candidates.forEach((c, i) => {
    lines.push(`### ${i + 1}. [${c.priority} / ${c.targetJudgment}] ${c.title}`);
    lines.push(`- id: \`${c.id}\` · area: ${c.area} · domain: \`${domainOf(c.finalSourceUrl)}\``);
    lines.push(`- 출처: ${c.publisher}`);
    lines.push(`- 원문: ${c.finalSourceUrl}`);
    if (c.headline) lines.push(`- 한 줄 화두: ${c.headline}`);
    lines.push("");
  });
  return lines.join("\n");
}

async function main() {
  const date = getArg("date") || todayKST();
  const candidates = await loadCandidates(date);
  const outPath = path.join(root, "runs", date, "magazine", `feedback-${date}.md`);
  const content = templateMarkdown(date, candidates);
  await fs.writeFile(outPath, content, "utf8");
  console.log(`feedback template written: ${outPath}`);
  console.log(`candidates: ${candidates.length}`);
  console.log(`다음 단계: 파일에 점수·사유를 채운 뒤 \`npm run feedback:apply -- --date=${date}\``);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
