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
  global_service_ux: "global",
  ai: "AI",
  html: "HTML",
  css: "CSS",
  javascript: "JAVASCRIPT",
  web_accessibility: "웹접근성",
  update: "Update",
  tool: "TOOL",
  data_api: "DATA/API",
};
const AREA_LABELS = {
  service: "Service",
  design: "Design",
  dev: "DEV",
};
const SERVICE_AREA_KEYS = new Set(["service", "services", "service_planning", "planning", "pm", "product", "product_management", "ux", "uiux", "ui_ux", "web_service", "webservice", "서비스", "서비스기획", "웹서비스기획"]);
const DESIGN_AREA_KEYS = new Set(["design", "web_design", "webdesign", "product_design", "visual", "visual_design", "brand", "branding", "design_system", "ui_design", "디자인", "웹디자인", "브랜드", "비주얼", "디자인시스템"]);
const DEV_AREA_KEYS = new Set(["dev", "develop", "development", "engineering", "fe", "frontend", "frontend_development", "backend", "web_development", "web_develop", "개발", "프론트", "프론트엔드"]);
const DESIGN_AI_KEYS = new Set(["ai", "ai디자인", "ai이미지", "chatgpt", "claude", "gemini", "figma_ai", "adobe_firefly", "firefly", "photoshop", "canva", "imagen", "veo", "sora", "image_generation", "이미지생성", "프로토타이핑", "디자인ai"]);
const DEFAULT_SITE_URL = "https://cttd-magazine.vercel.app";

function siteUrl() {
  return (process.env.SITE_URL || process.env.MAGAZINE_BASE_URL || DEFAULT_SITE_URL).replace(/\/$/, "");
}

function normalizeKey(value = "") {
  return String(value).trim().toLowerCase().replaceAll(/\s+/g, "_").replaceAll("-", "_");
}

function normalizeAreaKey(value = "", tags = []) {
  const key = normalizeKey(value || "service");
  if (DEV_AREA_KEYS.has(key)) return "dev";
  if (DESIGN_AREA_KEYS.has(key)) return "design";
  if (SERVICE_AREA_KEYS.has(key)) return "service";

  const tagKeys = tags.map((tag) => normalizeKey(tag));
  const hasDesign = tagKeys.some((tag) => DESIGN_AREA_KEYS.has(tag));
  const hasService = tagKeys.some((tag) => SERVICE_AREA_KEYS.has(tag));
  const hasDev = tagKeys.some((tag) => DEV_AREA_KEYS.has(tag) || tag === "웹dev");
  if (hasDev && !hasDesign && !hasService) return "dev";
  if (hasDesign && !hasService && !hasDev) return "design";
  return "service";
}

function areaLabel(areaKey) {
  return AREA_LABELS[areaKey] || AREA_LABELS.service;
}

function normalizeCategoryKey(categoryKey, areaKey, tags = []) {
  if (areaKey !== "design") return categoryKey;
  const tokens = [categoryKey, ...tags.map((tag) => normalizeKey(tag))];
  return tokens.some((token) => DESIGN_AI_KEYS.has(token)) ? "ai" : categoryKey;
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

function startOfKstWeek(now = new Date()) {
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const day = kst.getUTCDay();
  const daysFromMonday = (day + 6) % 7;
  const start = new Date(Date.UTC(kst.getUTCFullYear(), kst.getUTCMonth(), kst.getUTCDate()));
  start.setUTCDate(start.getUTCDate() - daysFromMonday);
  return start;
}

function previousKstWeekRange() {
  const base = process.env.WEEKLY_NEWSLETTER_DATE
    ? new Date(`${process.env.WEEKLY_NEWSLETTER_DATE}T00:00:00+09:00`)
    : new Date();
  const endKst = startOfKstWeek(base);
  endKst.setUTCHours(16, 0, 0, 0);
  const startKst = new Date(endKst);
  startKst.setUTCDate(startKst.getUTCDate() - 7);
  startKst.setUTCMinutes(1, 0, 0);
  return { startKst, endKst };
}

function formatKstDateTime(date) {
  return `${date.toISOString().slice(0, 10)} ${String(date.getUTCHours()).padStart(2, "0")}:${String(date.getUTCMinutes()).padStart(2, "0")} KST`;
}

function weekRangeLabel(range) {
  return `${formatKstDateTime(range.startKst)} ~ ${formatKstDateTime(range.endKst)} 전`;
}

function dateInKstWeek(value, range) {
  if (!value) return false;
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T00:00:00+09:00`)
    : new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  const kstDate = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  return kstDate >= range.startKst && kstDate < range.endKst;
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

  const weekRange = previousKstWeekRange();
  const weeklyPages = pages.filter((page) => {
    const properties = page.properties || {};
    const dateValue = propertyText(properties, ["Date", "발행날짜", "Published Date", "날짜"], "");
    return dateInKstWeek(dateValue || page.created_time, weekRange);
  });
  const pageSignature = (page) => {
    const properties = page.properties || {};
    const title = propertyText(properties, ["Takeaway", "Title", "제목", "한줄 인사이트"], "");
    const platform = propertyText(properties, ["Platform", "서비스", "플랫폼", "Brand", "브랜드명"], "");
    const tags = propertyTags(properties, ["Tags", "태그"]);
    const area = normalizeAreaKey(propertyText(properties, ["Area", "대분류", "대카테고리", "Type"], "service"), tags);
    return [platform, area, title].map((value) => normalizeKey(value)).join("|");
  };
  const uniqueWeeklyPages = [];
  const seenPageSignatures = new Set();
  for (const page of weeklyPages) {
    const signature = pageSignature(page);
    if (signature && seenPageSignatures.has(signature)) continue;
    if (signature) seenPageSignatures.add(signature);
    uniqueWeeklyPages.push(page);
  }
  const issues = uniqueWeeklyPages.map((page, index) => {
    const properties = page.properties || {};
    const tags = propertyTags(properties, ["Tags", "태그"]);
    const areaKey = normalizeAreaKey(propertyText(properties, ["Area", "대분류", "대카테고리", "Type"], "service"), tags);
    const categoryKey = normalizeCategoryKey(
      normalizeKey(propertyText(properties, ["Category", "카테고리", "Subcategory", "소분류", "소카테고리"], areaKey === "dev" ? "javascript" : "ecommerce")),
      areaKey,
      tags,
    );
    const number = String(index + 1).padStart(2, "0");
    const title = propertyText(properties, ["Takeaway", "Title", "제목", "한줄 인사이트"], "");
    const deck = propertyText(properties, ["Deck", "Summary", "요약", "목록 요약", "설명"], "");

    return {
      id: page.id,
      number,
      platform: propertyText(properties, ["Platform", "서비스", "플랫폼", "Brand", "브랜드명"], "CTTD"),
      areaKey,
      area: areaLabel(areaKey),
      categoryKey,
      category: CATEGORY_LABELS[categoryKey] || categoryKey,
      date: propertyText(properties, ["Date", "발행날짜", "Published Date", "날짜"], page.created_time || "").slice(0, 10),
      title,
      deck,
      tags,
      sourceUrl: propertyText(properties, ["Source URL", "출처 URL", "URL"], ""),
      magazineUrl: `${siteUrl()}/articles/${number}`,
    };
  });

  return { issues, weekRange };
}

function renderNewsletter(audience, issues, weekRange) {
  const label = audience === "dev" ? "DEV" : "Service/Design";
  const description = audience === "dev"
    ? "지난주 프론트엔드 구현, 접근성 QA, 브라우저/도구 변화입니다."
    : "지난주 서비스 기획과 웹디자인 관점에서 볼 변화입니다.";
  const logoSrc = `${siteUrl()}/assets/cttd-logo-email.png`;
  const rangeText = weekRangeLabel(weekRange);

  const cards = issues.map((issue, index) => `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0;border-bottom:1px solid #eeeeee;">
      <tr>
        <td width="42" style="width:42px;padding:16px 14px 16px 0;color:#777777;font-size:12px;line-height:1.2;font-weight:800;font-family:Arial,Apple SD Gothic Neo,Malgun Gothic,sans-serif;vertical-align:top;">${String(index + 1).padStart(2, "0")}</td>
        <td style="padding:14px 0 16px;vertical-align:top;">
          <a href="${htmlEscape(issue.magazineUrl)}" style="display:block;color:#111111;font-size:17px;line-height:1.42;font-weight:700;text-decoration:none;font-family:Arial,Apple SD Gothic Neo,Malgun Gothic,sans-serif;">[${htmlEscape(issue.platform)}] ${htmlEscape(issue.title || issue.platform)}</a>
          ${issue.deck ? `<div style="margin:6px 0 0;color:#555555;font-size:13px;line-height:1.55;font-family:Arial,Apple SD Gothic Neo,Malgun Gothic,sans-serif;">${htmlEscape(issue.deck)}</div>` : ""}
          <div style="margin:10px 0 0;padding:10px 0 0;border-top:1px solid #eeeeee;color:#333333;font-size:13px;line-height:1.58;font-family:Arial,Apple SD Gothic Neo,Malgun Gothic,sans-serif;">
            <a href="${htmlEscape(issue.magazineUrl)}" style="color:#111111;text-decoration:underline;text-underline-offset:3px;">더보기</a>
          </div>
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:8px 0 0;"><tr><td>
            ${issue.tags.map((tag) => `<span style="display:inline-block;margin:0 5px 5px 0;padding:4px 7px;background:#f9ffc1;background:rgba(238,255,72,0.34);color:#111111;font-size:11px;line-height:1.2;font-family:Arial,Apple SD Gothic Neo,Malgun Gothic,sans-serif;">#${htmlEscape(tag)}</span>`).join("")}
          </td></tr></table>
        </td>
      </tr>
    </table>
  `).join("");

  return `<!doctype html>
<html lang="ko">
  <body style="margin:0;background:#ffffff;color:#111111;font-family:Arial,Apple SD Gothic Neo,Malgun Gothic,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="display:none;max-height:0;overflow:hidden;">
      <tr><td>Service/Design/DEV 주간 트렌드 리포트</td></tr>
    </table>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#ffffff;">
      <tr>
        <td align="center" style="padding:44px 24px 52px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:760px;margin:0 auto;">
            <tr><td style="padding:0 0 14px;"><img src="${htmlEscape(logoSrc)}" width="124" alt="CTTD" style="display:block;width:124px;max-width:124px;height:auto;border:0;outline:none;text-decoration:none;"></td></tr>
            <tr><td style="padding:0 0 18px;color:#111111;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;font-family:Arial,Apple SD Gothic Neo,Malgun Gothic,sans-serif;">${audience === "dev" ? "Frontend Development Weekly" : "Service/Design Weekly"}</td></tr>
            <tr>
              <td style="padding:36px 0 24px;border-top:4px solid #111111;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 24px;">
                  <tr><td style="padding:0 0 8px;color:#111111;font-size:34px;line-height:1.1;font-weight:800;font-family:Arial,Apple SD Gothic Neo,Malgun Gothic,sans-serif;">${label} Weekly Trend Report</td></tr>
                  <tr><td style="padding:0;color:#666666;font-size:13px;line-height:1.6;font-family:Arial,Apple SD Gothic Neo,Malgun Gothic,sans-serif;">${htmlEscape(rangeText)} 기준 ${description} 상세 내용은 각 매거진 링크에서 확인하세요.</td></tr>
                </table>
                ${cards || `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0;border-top:1px solid #eeeeee;border-bottom:1px solid #eeeeee;"><tr><td style="padding:24px 0;color:#555555;font-size:14px;line-height:1.6;font-family:Arial,Apple SD Gothic Neo,Malgun Gothic,sans-serif;">이번 주 ${label} 대상 이슈가 없습니다.</td></tr></table>`}
              </td>
            </tr>
            <tr><td style="padding:18px 0 0;color:#777777;font-size:12px;line-height:1.6;font-family:Arial,Apple SD Gothic Neo,Malgun Gothic,sans-serif;">이 메일은 CTTD Newsletter 팀에서 발송되었습니다.</td></tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function renderPlainText(audience, issues, weekRange) {
  const label = audience === "dev" ? "DEV" : "Service/Design";
  return [
    `CTTD ${label} Weekly Trend Report`,
    weekRangeLabel(weekRange),
    "",
    ...issues.flatMap((issue) => [
      `[${issue.platform}] ${issue.title || issue.platform}`,
      issue.deck,
      issue.magazineUrl,
      "",
    ]),
  ].join("\n");
}

async function sendNewsletter(audience, issues, weekRange) {
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

  const label = audience === "dev" ? "DEV" : "Service/Design";
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: recipients,
    subject: `[CTTD] ${label} Weekly Trend Report`,
    text: renderPlainText(audience, issues, weekRange),
    html: renderNewsletter(audience, issues, weekRange),
  });
  return { audience, sent: true, recipients: recipients.length, issues: issues.length };
}

function issuesMarkdown(title, issues) {
  if (!issues.length) return `## ${title}\n\n- 대상 이슈 없음\n`;
  return [
    `## ${title}`,
    "",
    ...issues.flatMap((issue, index) => [
      `### ${String(index + 1).padStart(2, "0")}. [${issue.platform}] ${issue.title || issue.platform}`,
      "",
      `- 날짜: ${issue.date || ""}`,
      `- 대카테고리: ${issue.area}`,
      `- 소카테고리: ${issue.category}`,
      `- 태그: ${issue.tags.map((tag) => `#${tag}`).join(" ")}`,
      `- 매거진 URL: ${issue.magazineUrl}`,
      issue.sourceUrl ? `- 출처 URL: ${issue.sourceUrl}` : "",
      "",
      issue.deck || "",
      "",
    ]),
  ].filter((line) => line !== "").join("\n");
}

function renderArchiveMarkdown({ weekRange, serviceDesignIssues, devIssues, results }) {
  const rangeText = weekRangeLabel(weekRange);
  return [
    `# CTTD Weekly Newsletter Archive`,
    "",
    `- 기간: ${rangeText}`,
    `- 생성 시각: ${new Date().toISOString()}`,
    `- Service/Design 이슈 수: ${serviceDesignIssues.length}`,
    `- DEV 이슈 수: ${devIssues.length}`,
    `- 발송 결과: ${results.map((result) => `${result.audience}=${result.sent ? "sent" : `skipped(${result.reason})`}`).join(", ")}`,
    "",
    issuesMarkdown("Service/Design", serviceDesignIssues),
    "",
    issuesMarkdown("DEV", devIssues),
    "",
  ].join("\n");
}

function githubArchiveConfig() {
  const token = process.env.GITHUB_ARCHIVE_TOKEN || process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  const repo = process.env.GITHUB_ARCHIVE_REPOSITORY
    || process.env.GITHUB_REPOSITORY
    || (process.env.VERCEL_GIT_REPO_OWNER && process.env.VERCEL_GIT_REPO_SLUG
      ? `${process.env.VERCEL_GIT_REPO_OWNER}/${process.env.VERCEL_GIT_REPO_SLUG}`
      : "");
  const branch = process.env.GITHUB_ARCHIVE_BRANCH || process.env.VERCEL_GIT_COMMIT_REF || "main";
  const directory = (process.env.GITHUB_ARCHIVE_DIR || "newsletter-archives").replace(/^\/+|\/+$/g, "");
  return { token, repo, branch, directory };
}

async function archiveMarkdownToGithub(markdown, weekRange) {
  const { token, repo, branch, directory } = githubArchiveConfig();
  if (!token || !repo) return { archived: false, reason: "missing GitHub archive configuration" };

  const fileName = `${weekRange.startKst.toISOString().slice(0, 10)}_weekly-newsletter.md`;
  const filePath = `${directory}/${fileName}`;
  const apiUrl = `https://api.github.com/repos/${repo}/contents/${encodeURIComponent(filePath).replaceAll("%2F", "/")}`;
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "Content-Type": "application/json",
  };

  let sha;
  const existing = await fetch(`${apiUrl}?ref=${encodeURIComponent(branch)}`, { headers });
  if (existing.ok) {
    const data = await existing.json();
    sha = data.sha;
  } else if (existing.status !== 404) {
    throw new Error(`GitHub archive lookup failed: ${existing.status} ${await existing.text()}`);
  }

  const write = await fetch(apiUrl, {
    method: "PUT",
    headers,
    body: JSON.stringify({
      message: `chore: archive weekly newsletter ${weekRange.startKst.toISOString().slice(0, 10)}`,
      content: Buffer.from(markdown, "utf8").toString("base64"),
      branch,
      ...(sha ? { sha } : {}),
    }),
  });

  if (!write.ok) throw new Error(`GitHub archive write failed: ${write.status} ${await write.text()}`);
  const data = await write.json();
  return { archived: true, path: filePath, url: data.content?.html_url || "" };
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
    const { issues, weekRange } = await fetchIssuesFromNotion();
    const serviceDesignIssues = issues.filter((issue) => issue.areaKey !== "dev");
    const devIssues = issues.filter((issue) => issue.areaKey === "dev");
    const results = [
      await sendNewsletter("uiux", serviceDesignIssues, weekRange),
      await sendNewsletter("dev", devIssues, weekRange),
    ];
    const archive = await archiveMarkdownToGithub(
      renderArchiveMarkdown({ weekRange, serviceDesignIssues, devIssues, results }),
      weekRange,
    );
    response.status(200).json({ ok: true, issues: issues.length, weekRange: weekRangeLabel(weekRange), results, archive });
  } catch (error) {
    response.status(500).json({ ok: false, error: error.message });
  }
}
