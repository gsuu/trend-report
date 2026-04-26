import fs from "node:fs";
import path from "node:path";
import { Client } from "@notionhq/client";
import nodemailer from "nodemailer";

const CATEGORY_LABELS = {
  fashion: "fashion",
  ecommerce: "ecommerce",
  department_store: "department",
  beauty: "beauty",
  book_content: "book",
  ai: "AI",
  html: "HTML",
  css: "CSS",
  javascript: "JAVASCRIPT",
  web_accessibility: "웹접근성",
  tool: "TOOL",
  data_api: "DATA/API",
};

function normalizeKey(value = "") {
  return String(value).trim().toLowerCase().replaceAll(/\s+/g, "_").replaceAll("-", "_");
}

function plainRichText(items = []) {
  return items.map((item) => item.plain_text || "").join("").trim();
}

function htmlEscape(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function getProperty(properties, names) {
  return names.map((name) => properties[name]).find(Boolean);
}

function propertyText(properties, names, fallback = "") {
  const prop = getProperty(properties, names);
  if (!prop) return fallback;
  if (prop.type === "title") return plainRichText(prop.title);
  if (prop.type === "rich_text") return plainRichText(prop.rich_text);
  if (prop.type === "select") return prop.select?.name || fallback;
  if (prop.type === "status") return prop.status?.name || fallback;
  if (prop.type === "url") return prop.url || fallback;
  if (prop.type === "date") return prop.date?.start || fallback;
  if (prop.type === "multi_select") return prop.multi_select.map((item) => item.name).join(", ");
  if (prop.type === "number") return String(prop.number ?? fallback);
  return fallback;
}

function propertyTags(properties, names) {
  const prop = getProperty(properties, names);
  if (!prop) return [];
  if (prop.type === "multi_select") return prop.multi_select.map((item) => item.name).filter(Boolean);
  return propertyText(properties, names)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function hasProperty(properties, names) {
  return names.find((name) => properties[name]);
}

function splitRecipients(value = "") {
  return value
    .split(/[,\n;]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function readDevSubscribers() {
  const configured = splitRecipients(process.env.DEV_NEWSLETTER_TO || process.env.DEV_WEEKLY_TO || "");
  if (configured.length) return configured;

  const subscribersPath = path.join(process.cwd(), "config", "dev-final-subscribers.txt");
  if (!fs.existsSync(subscribersPath)) return [];
  return splitRecipients(fs.readFileSync(subscribersPath, "utf8"));
}

function resolveRecipients(audience) {
  if (audience === "dev") return readDevSubscribers();
  return splitRecipients(process.env.UIUX_NEWSLETTER_TO || process.env.UIUX_WEEKLY_TO || "cxd@cttd.co.kr");
}

function isAuthorized(request) {
  const secret = process.env.CRON_SECRET || "";
  if (!secret) return true;

  const auth = request.headers.authorization || "";
  const url = new URL(request.url, `https://${request.headers.host || "localhost"}`);
  return auth === `Bearer ${secret}` || url.searchParams.get("secret") === secret;
}

async function fetchIssuesFromNotion() {
  const notionToken = process.env.NOTION_TOKEN || process.env.NOTION_API_KEY;
  const databaseId = process.env.NOTION_DATABASE_ID;
  if (!notionToken || !databaseId) throw new Error("NOTION_TOKEN and NOTION_DATABASE_ID are required.");

  const notion = new Client({ auth: notionToken });
  const database = await notion.databases.retrieve({ database_id: databaseId });
  const databaseProperties = database.properties || {};
  const dateProperty = hasProperty(databaseProperties, ["Date", "발행날짜", "Published Date", "날짜"]);
  const sorts = dateProperty
    ? [{ property: dateProperty, direction: "descending" }]
    : [{ timestamp: "created_time", direction: "descending" }];
  const pages = [];
  let cursor;

  do {
    const response = await notion.databases.query({
      database_id: databaseId,
      start_cursor: cursor,
      page_size: 100,
      sorts,
    });
    pages.push(...response.results);
    cursor = response.has_more ? response.next_cursor : undefined;
  } while (cursor);

  const limit = Number.parseInt(process.env.WEEKLY_NEWSLETTER_LIMIT || "30", 10);
  return pages.slice(0, Number.isFinite(limit) && limit > 0 ? limit : 30).map((page, index) => {
    const properties = page.properties || {};
    const areaKey = normalizeKey(propertyText(properties, ["Area", "대분류", "대카테고리", "Type"], "uiux"));
    const categoryKey = normalizeKey(propertyText(properties, ["Category", "카테고리", "Subcategory", "소분류", "소카테고리"], areaKey === "dev" ? "javascript" : "ecommerce"));
    const number = String(index + 1).padStart(2, "0");
    const title = propertyText(properties, ["Takeaway", "Title", "제목", "한줄 인사이트"], "");
    const deck = propertyText(properties, ["Deck", "Summary", "요약", "목록 요약", "설명"], "");

    return {
      id: page.id,
      number,
      platform: propertyText(properties, ["Platform", "서비스", "플랫폼", "Brand", "브랜드명"], "CTTD"),
      areaKey,
      area: areaKey === "dev" ? "DEV" : "UIUX",
      categoryKey,
      category: CATEGORY_LABELS[categoryKey] || categoryKey,
      date: propertyText(properties, ["Date", "발행날짜", "Published Date", "날짜"], page.created_time || "").slice(0, 10),
      title,
      deck,
      tags: propertyTags(properties, ["Tags", "태그"]),
      sourceUrl: propertyText(properties, ["Source URL", "출처 URL", "URL"], ""),
      magazineUrl: `${(process.env.MAGAZINE_BASE_URL || "https://email.cttd.co.kr/magazine").replace(/\/$/, "")}/#/story/${number}`,
    };
  });
}

function renderNewsletter(audience, issues) {
  const label = audience === "dev" ? "DEV" : "UIUX";
  const description = audience === "dev"
    ? "이번 주 프론트엔드 구현, 접근성 QA, 브라우저/도구 변화입니다."
    : "이번 주 커머스와 서비스 UIUX 변화입니다.";

  const cards = issues.map((issue) => `
    <article style="padding:22px 0;border-top:1px solid #d8d8d8;">
      <p style="margin:0 0 8px;color:#777;font-size:13px;text-transform:uppercase;">${htmlEscape(issue.platform)} · ${htmlEscape(issue.category)}</p>
      <h2 style="margin:0 0 10px;color:#242424;font-size:22px;line-height:1.3;font-weight:600;">${htmlEscape(issue.title || issue.platform)}</h2>
      ${issue.deck ? `<p style="margin:0 0 14px;color:#555;font-size:15px;line-height:1.65;">${htmlEscape(issue.deck)}</p>` : ""}
      <p style="margin:0;color:#777;font-size:13px;">${issue.tags.map((tag) => `#${htmlEscape(tag)}`).join(" ")}</p>
      <p style="margin:16px 0 0;"><a href="${htmlEscape(issue.magazineUrl)}" style="color:#111;text-decoration:underline;">매거진에서 보기</a></p>
    </article>
  `).join("");

  return `<!doctype html>
<html lang="ko">
  <body style="margin:0;background:#fff;color:#242424;font-family:Apple SD Gothic Neo,Malgun Gothic,Arial,sans-serif;">
    <main style="max-width:720px;margin:0 auto;padding:36px 22px;">
      <p style="margin:0 0 10px;color:#777;font-size:13px;letter-spacing:.08em;text-transform:uppercase;">CTTD Trend Magazine</p>
      <h1 style="margin:0;color:#111;font-size:32px;line-height:1.2;">${label} Weekly Trend Report</h1>
      <p style="margin:14px 0 28px;color:#555;font-size:16px;line-height:1.7;">${description}</p>
      ${cards || `<p style="color:#777;">이번 주 ${label} 대상 이슈가 없습니다.</p>`}
    </main>
  </body>
</html>`;
}

function renderPlainText(audience, issues) {
  const label = audience === "dev" ? "DEV" : "UIUX";
  return [
    `CTTD ${label} Weekly Trend Report`,
    "",
    ...issues.flatMap((issue) => [
      `[${issue.platform}] ${issue.title || issue.platform}`,
      issue.deck,
      issue.magazineUrl,
      "",
    ]),
  ].join("\n");
}

async function sendNewsletter(audience, issues) {
  const recipients = resolveRecipients(audience);
  if (!recipients.length) return { audience, sent: false, reason: "no recipients" };
  if (!issues.length) return { audience, sent: false, reason: "no issues" };

  const port = Number.parseInt(process.env.SMTP_PORT || "587", 10);
  const secure = String(process.env.SMTP_SSL || "").toLowerCase() === "true" || port === 465;
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure,
    auth: process.env.SMTP_USER && process.env.SMTP_PASSWORD
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
      : undefined,
    requireTLS: String(process.env.SMTP_TLS || "true").toLowerCase() !== "false" && !secure,
  });

  const label = audience === "dev" ? "DEV" : "UIUX";
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: recipients,
    subject: `[CTTD] ${label} Weekly Trend Report`,
    text: renderPlainText(audience, issues),
    html: renderNewsletter(audience, issues),
  });
  return { audience, sent: true, recipients: recipients.length, issues: issues.length };
}

export default async function handler(request, response) {
  if (!isAuthorized(request)) {
    response.status(401).json({ ok: false, error: "Unauthorized" });
    return;
  }

  if (!process.env.SMTP_HOST || !process.env.SMTP_FROM) {
    response.status(500).json({ ok: false, error: "SMTP_HOST and SMTP_FROM are required." });
    return;
  }

  try {
    const issues = await fetchIssuesFromNotion();
    const uiuxIssues = issues.filter((issue) => issue.areaKey !== "dev");
    const devIssues = issues.filter((issue) => issue.areaKey === "dev");
    const results = [
      await sendNewsletter("uiux", uiuxIssues),
      await sendNewsletter("dev", devIssues),
    ];
    response.status(200).json({ ok: true, issues: issues.length, results });
  } catch (error) {
    response.status(500).json({ ok: false, error: error.message });
  }
}
