// scripts/collect/notify.mjs
// 최신 주차 매거진을 audience별 구독자에게 nodemailer로 발송
// 구독자 소스: config/subscribers.{service|design|dev}.txt

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import nodemailer from "nodemailer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..", "..");
const DATA_DIR = path.join(ROOT, "src", "data");
const CONFIG_DIR = path.join(ROOT, "config");
const TEMPLATE_PATH = path.join(ROOT, "templates", "newsletter.html");
const SITE_URL = process.env.MAIL_SITE_URL || "https://magazine.cttd.co.kr";

const AUDIENCES = ["service", "design", "dev"];

async function main() {
  const report = JSON.parse(await fs.readFile(path.join(DATA_DIR, "report.json"), "utf8"));
  if (!report?.issues?.length) {
    console.log("[notify] issue 없음 — 발송 skip");
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 465),
    secure: process.env.SMTP_SECURE !== "false",
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  const template = await fs.readFile(TEMPLATE_PATH, "utf8").catch(() => null);

  for (const audience of AUDIENCES) {
    const recipients = await loadSubscribers(audience);
    if (!recipients.length) {
      console.log(`[notify] ${audience}: 구독자 없음`);
      continue;
    }
    const filtered = filterIssuesByAudience(report, audience);
    if (!filtered.issues.length) {
      console.log(`[notify] ${audience}: 해당 카테고리 issue 없음`);
      continue;
    }
    const html = renderHtml(template, filtered, audience);
    const subject = `[CTTD Magazine] ${filtered.weekLabel} ${labelOf(audience)} 트렌드 리포트`;

    for (const to of recipients) {
      try {
        await transporter.sendMail({
          from: process.env.MAIL_FROM,
          to,
          subject,
          html,
        });
        console.log(`[notify] ${audience} → ${maskEmail(to)} 발송 OK`);
      } catch (err) {
        console.error(`[notify] ${audience} → ${maskEmail(to)} 실패: ${err.message}`);
      }
    }
  }
}

async function loadSubscribers(audience) {
  const file = path.join(CONFIG_DIR, `subscribers.${audience}.txt`);
  try {
    const raw = await fs.readFile(file, "utf8");
    return raw
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"))
      .filter((line) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(line));
  } catch {
    return [];
  }
}

function filterIssuesByAudience(report, audience) {
  return {
    ...report,
    issues: report.issues.filter((i) => i.areaKey === audience),
  };
}

function renderHtml(template, report, audience) {
  if (template) {
    // 템플릿 사용 — 간단한 Mustache-like 치환만 (안전한 부분만)
    return template
      .replace(/\{\{title\}\}/g, escapeHtml(report.title))
      .replace(/\{\{weekLabel\}\}/g, escapeHtml(report.weekLabel))
      .replace(/\{\{audience\}\}/g, escapeHtml(labelOf(audience)))
      .replace(/\{\{siteUrl\}\}/g, SITE_URL)
      .replace(/<!-- ISSUES -->[\s\S]*?<!-- \/ISSUES -->/, renderIssueListHtml(report.issues));
  }
  // 템플릿 없으면 미니멀 폴백
  return `
    <h1>${escapeHtml(report.title)}</h1>
    <p>${escapeHtml(report.weekLabel)} ${escapeHtml(labelOf(audience))} 리포트</p>
    ${renderIssueListHtml(report.issues)}
    <p><a href="${SITE_URL}">매거진 전체 보기</a></p>
  `;
}

function renderIssueListHtml(issues) {
  return issues
    .map(
      (i) => `
      <article style="margin:24px 0;padding:16px;border:1px solid #eee">
        ${i.image ? `<img src="${i.image}" alt="" style="max-width:100%"/>` : ""}
        <h2>${escapeHtml(i.platform || "")} <small>${escapeHtml(i.category || "")}</small></h2>
        <p><strong>${stripUnsafe(i.takeawayHtml || "")}</strong></p>
        <div>${stripUnsafe(i.deckHtml || "")}</div>
        <a href="${i.sourceUrl}">원문 보기 →</a>
      </article>
    `,
    )
    .join("");
}

function labelOf(audience) {
  return { service: "Service", design: "Design", dev: "DEV" }[audience] || audience;
}

function escapeHtml(s = "") {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// HTML 본문 자체는 신뢰하되, script/style 태그만 제거
function stripUnsafe(s = "") {
  return String(s).replace(/<\/?(script|style|iframe|object|embed)[^>]*>/gi, "");
}

function maskEmail(e) {
  return e.replace(/^(.).*(@.*)$/, "$1***$2");
}

main().catch((err) => {
  console.error("[notify] 실패:", err);
  process.exit(1);
});
