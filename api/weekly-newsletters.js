import fs from "node:fs";
import crypto from "node:crypto";
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
const DEFAULT_SITE_URL = "https://magazine.cttd.co.kr";
const ONE_OFF_CRON_SKIP_DATES_KST = new Set(["2026-04-27"]);
const NEWSLETTER_TEMPLATE_PATH = path.join(process.cwd(), "templates", "newsletter.html");
const NEWSLETTER_SECTION_PATTERN = /<!-- section:([a-z0-9_-]+) -->\s*([\s\S]*?)\s*<!-- \/section:\1 -->/g;
const SUBSCRIBER_EMAIL_PROPERTIES = ["Email", "이메일", "이름", "Name"];
const SUBSCRIBER_STATUS_PROPERTIES = ["Status", "상태"];
const SUBSCRIBER_AUDIENCE_PROPERTIES = ["Audience", "구독분야", "뉴스레터"];
const NEWSLETTER_AUDIENCES = ["service", "design", "dev"];
const NEWSLETTER_AUDIENCE_LABELS = {
  service: "Service",
  design: "Design",
  dev: "DEV",
};
const NEWSLETTER_SUBJECT_PREFIX = "[CTTD Magazine]";
let newsletterTemplateCache;

loadEnvFiles();

function siteUrl() {
  return (process.env.SITE_URL || process.env.MAGAZINE_BASE_URL || DEFAULT_SITE_URL).replace(/\/$/, "");
}

function loadEnvFiles() {
  for (const envPath of [path.join(process.cwd(), ".env.local"), path.join(process.cwd(), ".env")]) {
    if (!fs.existsSync(envPath)) continue;

    for (const rawLine of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#") || !line.includes("=")) continue;

      const [key, ...valueParts] = line.split("=");
      const cleanKey = key.trim();
      if (!cleanKey || process.env[cleanKey]) continue;
      process.env[cleanKey] = valueParts.join("=").trim().replace(/^['"]|['"]$/g, "");
    }
  }
}

function normalizeKey(value = "") {
  return String(value).trim().toLowerCase().replaceAll(/[\s./-]+/g, "_").replaceAll(/_+/g, "_").replace(/^_+|_+$/g, "");
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

function loadNewsletterTemplates() {
  if (newsletterTemplateCache) return newsletterTemplateCache;
  const content = fs.readFileSync(NEWSLETTER_TEMPLATE_PATH, "utf8");
  const sections = {};
  for (const match of content.matchAll(NEWSLETTER_SECTION_PATTERN)) {
    sections[match[1]] = match[2];
  }
  for (const key of ["shell", "card", "empty"]) {
    if (!sections[key]) throw new Error(`뉴스레터 템플릿 섹션이 없습니다: ${key}`);
  }
  newsletterTemplateCache = sections;
  return sections;
}

function fillNewsletterTemplate(template, values) {
  let rendered = template;
  for (const [key, value] of Object.entries(values)) {
    rendered = rendered.replaceAll(`{{${key}}}`, value);
  }
  return rendered;
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

function normalizeEmail(value = "") {
  return String(value).trim().toLowerCase();
}

function uniqueEmails(emails) {
  return [...new Set(emails.map((email) => normalizeEmail(email)).filter(Boolean))];
}

function unsubscribeSecret() {
  return unsubscribeSecrets()[0] || "";
}

function unsubscribeSecrets() {
  const primary = process.env.NEWSLETTER_UNSUBSCRIBE_SECRET || "";
  const fallbacks = (process.env.NEWSLETTER_UNSUBSCRIBE_SECRETS || "")
    .split(",")
    .map((secret) => secret.trim())
    .filter(Boolean);
  const legacy = process.env.CRON_SECRET || "";
  return [...new Set([primary, ...fallbacks, legacy].filter(Boolean))];
}

function unsubscribeUrl(email) {
  const secret = unsubscribeSecret();
  if (!secret || !email) return "";
  const normalizedEmail = normalizeEmail(email);
  const signature = crypto.createHmac("sha256", secret).update(normalizedEmail).digest("hex");
  return `${siteUrl()}/api/unsubscribe?email=${encodeURIComponent(normalizedEmail)}&sig=${signature}`;
}

function ensureUnsubscribeLinksEnabled() {
  if (!unsubscribeSecret()) throw new Error("NEWSLETTER_UNSUBSCRIBE_SECRET or CRON_SECRET is required.");
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

function newsletterTitle(sendDateLabel = kstDateString()) {
  return `${sendDateLabel} Weekly Web Trends`;
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

function subscriberDatabaseId() {
  const databaseId = (process.env.NEWSLETTER_SUBSCRIBERS_DATABASE_ID || "").trim();
  if (!databaseId) throw new Error("NEWSLETTER_SUBSCRIBERS_DATABASE_ID is required.");
  return databaseId;
}

function subscriberEmail(page) {
  return normalizeEmail(propertyText(page.properties || {}, SUBSCRIBER_EMAIL_PROPERTIES, ""));
}

function subscriberStatus(page) {
  return normalizeKey(propertyText(page.properties || {}, SUBSCRIBER_STATUS_PROPERTIES, "active"));
}

function subscriberAudiences(page) {
  return propertyTags(page.properties || {}, SUBSCRIBER_AUDIENCE_PROPERTIES).map((audience) => normalizeKey(audience));
}

function expandSubscriberAudiences(values = []) {
  if (!values.length) return NEWSLETTER_AUDIENCES;
  const selected = new Set();
  for (const value of values) {
    if (["service", "service_planning", "planning", "pm", "product", "general", "uiux", "ui_ux", "service_design"].includes(value)) {
      selected.add("service");
    }
    if (["design", "web_design", "webdesign", "general", "uiux", "ui_ux", "service_design"].includes(value)) {
      selected.add("design");
    }
    if (["dev", "develop", "development", "frontend"].includes(value)) {
      selected.add("dev");
    }
  }
  return NEWSLETTER_AUDIENCES.filter((audience) => selected.has(audience));
}

async function notionNewsletterSubscribers() {
  const notionToken = process.env.NOTION_TOKEN || process.env.NOTION_API_KEY;
  if (!notionToken) return [];
  const databaseId = subscriberDatabaseId();

  const notion = new Client({ auth: notionToken });
  const pages = [];
  let cursor;

  do {
    const response = await notion.databases.query({
      database_id: databaseId,
      start_cursor: cursor,
      page_size: 100,
    });
    pages.push(...response.results);
    cursor = response.has_more ? response.next_cursor : undefined;
  } while (cursor);

  const seenEmails = new Set();
  return pages
    .filter((page) => !["unsubscribed", "inactive", "해지"].includes(subscriberStatus(page)))
    .map((page) => ({
      email: subscriberEmail(page),
      audiences: expandSubscriberAudiences(subscriberAudiences(page)),
    }))
    .filter((subscriber) => {
      if (!subscriber.email || seenEmails.has(subscriber.email) || !subscriber.audiences.length) return false;
      seenEmails.add(subscriber.email);
      return true;
    });
}

function isAuthorized(request) {
  const secret = process.env.CRON_SECRET || "";
  if (!secret) return true;

  const auth = request.headers.authorization || "";
  const url = new URL(request.url, `https://${request.headers.host || "localhost"}`);
  return auth === `Bearer ${secret}` || url.searchParams.get("secret") === secret;
}

function kstDateString(date = new Date()) {
  return new Date(date.getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

function pausedCronDatesKst() {
  const envDates = (process.env.NEWSLETTER_CRON_SKIP_DATES_KST || "")
    .split(",")
    .map((date) => date.trim())
    .filter(Boolean);
  return new Set([...ONE_OFF_CRON_SKIP_DATES_KST, ...envDates]);
}

function isNewsletterCronPausedToday() {
  return pausedCronDatesKst().has(kstDateString());
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

function renderAudienceHeading(label) {
  return (
    '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:26px 0 8px;background:#111111;">'
    + '<tr>'
    + `<td style="padding:10px 14px;color:#ffffff;font-size:14px;line-height:1.35;font-weight:800;letter-spacing:0.04em;text-transform:uppercase;font-family:Arial,Apple SD Gothic Neo,Malgun Gothic,sans-serif;">${htmlEscape(label)}</td>`
    + '</tr></table>'
  );
}

function renderIssueCards(issues, startNumber = 1) {
  const templates = loadNewsletterTemplates();

  return issues.map((issue, index) => {
    const categoryBlock = issue.category
      ? `<div style="margin:0 0 6px;color:#777777;font-size:11px;line-height:1.3;font-weight:400;letter-spacing:0.08em;text-transform:uppercase;font-family:Arial,Apple SD Gothic Neo,Malgun Gothic,sans-serif;">${htmlEscape(issue.category)}</div>`
      : "";
    const descriptionBlock = issue.deck
      ? `<div style="margin:6px 0 0;color:#555555;font-size:13px;line-height:1.55;font-family:Arial,Apple SD Gothic Neo,Malgun Gothic,sans-serif;">${htmlEscape(issue.deck)}</div>`
      : "";
    const detailSummaryBlock = `<div style="margin:10px 0 0;padding:10px 0 0;border-top:1px solid #eeeeee;color:#333333;font-size:13px;line-height:1.58;font-family:Arial,Apple SD Gothic Neo,Malgun Gothic,sans-serif;"><a href="${htmlEscape(issue.magazineUrl)}" style="color:#111111;text-decoration:underline;text-underline-offset:3px;">더보기</a></div>`;
    const tags = issue.tags.map((tag) => `<span style="display:inline-block;margin:0 5px 5px 0;padding:4px 7px;background:#f9ffc1;background:rgba(238,255,72,0.34);color:#111111;font-size:11px;line-height:1.2;font-family:Arial,Apple SD Gothic Neo,Malgun Gothic,sans-serif;">#${htmlEscape(tag)}</span>`).join("");
    return fillNewsletterTemplate(templates.card, {
      DISPLAY_NUMBER: String(startNumber + index).padStart(2, "0"),
      AREA_BLOCK: categoryBlock,
      HREF: htmlEscape(issue.magazineUrl),
      TITLE: htmlEscape(`[${issue.platform}] ${issue.title || issue.platform}`),
      DESCRIPTION_BLOCK: descriptionBlock,
      DETAIL_SUMMARY_BLOCK: detailSummaryBlock,
      TAGS: tags,
    });
  }).join("");
}

function selectedIssuesByAudience(audiences, issuesByAudience) {
  return audiences.flatMap((audience) => issuesByAudience[audience] || []);
}

function renderNewsletter(audiences, issuesByAudience, weekRange, recipientEmail = "", sendDateLabel = kstDateString()) {
  const selectedAudiences = audiences.filter((audience) => NEWSLETTER_AUDIENCES.includes(audience));
  const logoSrc = `${siteUrl()}/assets/cttd-logo-email.png`;
  const title = newsletterTitle(sendDateLabel);
  const templates = loadNewsletterTemplates();
  let displayNumber = 1;
  const bodyParts = [];

  for (const audience of selectedAudiences) {
    const issues = issuesByAudience[audience] || [];
    if (!issues.length) continue;
    bodyParts.push(renderAudienceHeading(NEWSLETTER_AUDIENCE_LABELS[audience]));
    bodyParts.push(renderIssueCards(issues, displayNumber));
    displayNumber += issues.length;
  }

  const body = bodyParts.join("") || fillNewsletterTemplate(templates.empty, {
    EMPTY_MESSAGE: "선택한 카테고리에 이번 주 대상 이슈가 없습니다.",
  });
  const selectedLabels = selectedAudiences.map((audience) => NEWSLETTER_AUDIENCE_LABELS[audience]).join(", ");

  return fillNewsletterTemplate(templates.shell, {
    PAGE_TITLE: htmlEscape(`${NEWSLETTER_SUBJECT_PREFIX} ${title}`),
    PREHEADER: "Service/Design/DEV 주간 트렌드 리포트",
    LOGO_SRC: htmlEscape(logoSrc),
    KICKER: "NEWSLETTER",
    DISPLAY_TITLE: htmlEscape(title),
    DESCRIPTION: htmlEscape(`${sendDateLabel} 기준 ${selectedLabels || "선택한 카테고리"} 업데이트입니다. 상세 내용은 각 매거진 링크에서 확인하세요.`),
    BODY: body,
    FOOTER: footerHtml(recipientEmail),
  });
}

function audienceSubject(sendDateLabel = kstDateString()) {
  return `${NEWSLETTER_SUBJECT_PREFIX} ${newsletterTitle(sendDateLabel)}`;
}

function footerHtml(recipientEmail = "") {
  const unsubscribeLink = unsubscribeUrl(recipientEmail);
  const unsubscribeHtml = unsubscribeLink
    ? `<br>수신을 원하지 않는다면 👉🏻 <a href="${htmlEscape(unsubscribeLink)}" style="color:#555555;font-weight:700;text-decoration:underline;text-underline-offset:3px;">구독 해지하기</a>`
    : "";
  return `이 메일은 CTTD Newsletter 시스템에서 발송되었습니다.${unsubscribeHtml}`;
}

function renderPlainText(audiences, issuesByAudience, weekRange, recipientEmail = "", sendDateLabel = kstDateString()) {
  const unsubscribeLink = unsubscribeUrl(recipientEmail);
  const issueLines = [];
  for (const audience of audiences) {
    const issues = issuesByAudience[audience] || [];
    if (!issues.length) continue;
    issueLines.push(`## ${NEWSLETTER_AUDIENCE_LABELS[audience]}`);
    issueLines.push("");
    issueLines.push(...issues.flatMap((issue) => [
      `[${issue.platform}] ${issue.title || issue.platform}`,
      issue.area || "",
      issue.deck,
      issue.magazineUrl,
      "",
    ]));
  }
  return [
    `CTTD ${newsletterTitle(sendDateLabel)}`,
    "",
    ...issueLines,
    unsubscribeLink ? `구독 해지: ${unsubscribeLink}` : "",
  ].join("\n");
}

async function sendNewsletters(issuesByAudience, weekRange) {
  const subscribers = await notionNewsletterSubscribers();
  const sendDateLabel = kstDateString();
  if (!subscribers.length) return { sent: false, reason: "no recipients" };

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

  let sent = 0;
  let skipped = 0;
  for (const subscriber of subscribers) {
    const selectedIssues = selectedIssuesByAudience(subscriber.audiences, issuesByAudience);
    if (!selectedIssues.length) {
      skipped += 1;
      continue;
    }
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: subscriber.email,
      subject: audienceSubject(sendDateLabel),
      text: renderPlainText(subscriber.audiences, issuesByAudience, weekRange, subscriber.email, sendDateLabel),
      html: renderNewsletter(subscriber.audiences, issuesByAudience, weekRange, subscriber.email, sendDateLabel),
    });
    sent += 1;
  }
  return { sent: sent > 0, recipients: sent, skipped, reason: sent ? undefined : "no matching issues" };
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

function renderArchiveMarkdown({ weekRange, serviceIssues, designIssues, devIssues, results }) {
  const rangeText = weekRangeLabel(weekRange);
  return [
    `# CTTD Weekly Newsletter Archive`,
    "",
    `- 기간: ${rangeText}`,
    `- 생성 시각: ${new Date().toISOString()}`,
    `- Service 이슈 수: ${serviceIssues.length}`,
    `- Design 이슈 수: ${designIssues.length}`,
    `- DEV 이슈 수: ${devIssues.length}`,
    `- 발송 결과: ${results.sent ? `sent(${results.recipients})` : `skipped(${results.reason})`}`,
    "",
    issuesMarkdown("Service", serviceIssues),
    "",
    issuesMarkdown("Design", designIssues),
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

  if (isNewsletterCronPausedToday()) {
    response.status(200).json({ ok: true, skipped: true, reason: "newsletter cron paused for today", dateKst: kstDateString() });
    return;
  }

  if (!process.env.SMTP_HOST || !process.env.SMTP_FROM) {
    response.status(500).json({ ok: false, error: "SMTP_HOST and SMTP_FROM are required." });
    return;
  }

  try {
    ensureUnsubscribeLinksEnabled();
    const { issues, weekRange } = await fetchIssuesFromNotion();
    const serviceIssues = issues.filter((issue) => issue.areaKey === "service");
    const designIssues = issues.filter((issue) => issue.areaKey === "design");
    const devIssues = issues.filter((issue) => issue.areaKey === "dev");
    const issuesByAudience = { service: serviceIssues, design: designIssues, dev: devIssues };
    const results = await sendNewsletters(issuesByAudience, weekRange);
    const archive = await archiveMarkdownToGithub(
      renderArchiveMarkdown({ weekRange, serviceIssues, designIssues, devIssues, results }),
      weekRange,
    );
    response.status(200).json({ ok: true, issues: issues.length, weekRange: weekRangeLabel(weekRange), results, archive });
  } catch (error) {
    response.status(500).json({ ok: false, error: error.message });
  }
}
