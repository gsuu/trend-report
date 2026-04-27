import crypto from "node:crypto";
import { Client } from "@notionhq/client";

const EMAIL_PROPERTIES = ["Email", "이메일", "이름", "Name"];
const STATUS_PROPERTIES = ["Status", "상태"];
const UNSUBSCRIBED_AT_PROPERTIES = ["Unsubscribed At", "해지일"];

function htmlEscape(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function normalizeEmail(value = "") {
  return String(value).trim().toLowerCase();
}

function unsubscribeSecret() {
  return process.env.NEWSLETTER_UNSUBSCRIBE_SECRET || process.env.CRON_SECRET || "";
}

function signEmail(email) {
  const secret = unsubscribeSecret();
  if (!secret) return "";
  return crypto.createHmac("sha256", secret).update(normalizeEmail(email)).digest("hex");
}

function isValidSignature(email, signature) {
  const expected = signEmail(email);
  if (!expected || !signature || expected.length !== signature.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

function propertyText(properties, names) {
  const prop = names.map((name) => properties[name]).find(Boolean);
  if (!prop) return "";
  if (prop.type === "title") return prop.title.map((item) => item.plain_text || "").join("").trim();
  if (prop.type === "rich_text") return prop.rich_text.map((item) => item.plain_text || "").join("").trim();
  if (prop.type === "email") return prop.email || "";
  if (prop.type === "select") return prop.select?.name || "";
  return "";
}

function findPropertyName(properties, names) {
  return names.find((name) => properties[name]);
}

function pageEmail(page) {
  return normalizeEmail(propertyText(page.properties || {}, EMAIL_PROPERTIES));
}

function subscriberDatabaseId() {
  const databaseId = (process.env.NEWSLETTER_SUBSCRIBERS_DATABASE_ID || "").trim();
  if (!databaseId) throw new Error("NEWSLETTER_SUBSCRIBERS_DATABASE_ID is required.");
  return databaseId;
}

async function fetchSubscriberPage(notion, databaseId, email) {
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

  return pages.find((page) => pageEmail(page) === normalizeEmail(email));
}

function renderPage({ title, message, email, signature, confirmed = false }) {
  const safeTitle = htmlEscape(title);
  const safeMessage = htmlEscape(message);
  const safeEmail = htmlEscape(email);
  const safeSignature = htmlEscape(signature);
  const form = confirmed
    ? ""
    : `
      <form method="post" style="margin:28px 0 0;">
        <input type="hidden" name="email" value="${safeEmail}">
        <input type="hidden" name="sig" value="${safeSignature}">
        <button type="submit" style="border:0;background:#111111;color:#ffffff;padding:12px 18px;font-size:14px;font-weight:700;cursor:pointer;">구독 해지</button>
      </form>
    `;

  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${safeTitle}</title>
</head>
<body style="margin:0;background:#ffffff;color:#111111;font-family:Arial,Apple SD Gothic Neo,Malgun Gothic,sans-serif;">
  <main style="max-width:520px;margin:0 auto;padding:64px 24px;">
    <h1 style="margin:0 0 16px;font-size:28px;line-height:1.2;">${safeTitle}</h1>
    <p style="margin:0;color:#555555;font-size:15px;line-height:1.7;">${safeMessage}</p>
    ${form}
  </main>
</body>
</html>`;
}

async function readFormBody(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8");
}

export default async function handler(request, response) {
  const url = new URL(request.url, `https://${request.headers.host || "localhost"}`);
  const formParams = request.method === "POST" ? new URLSearchParams(await readFormBody(request)) : null;
  const email = formParams ? formParams.get("email") : url.searchParams.get("email");
  const signature = formParams ? formParams.get("sig") : url.searchParams.get("sig");

  if (!email || !isValidSignature(email, signature || "")) {
    response.status(400).send(renderPage({
      title: "구독 해지 링크가 올바르지 않습니다",
      message: "메일 하단의 구독 해지 링크를 다시 눌러주세요.",
      email: "",
      signature: "",
      confirmed: true,
    }));
    return;
  }

  if (request.method !== "POST") {
    response.status(200).send(renderPage({
      title: "뉴스레터 구독을 해지할까요?",
      message: `${normalizeEmail(email)} 주소로 발송되는 CTTD 뉴스레터 구독을 해지합니다.`,
      email,
      signature,
    }));
    return;
  }

  const notionToken = process.env.NOTION_TOKEN || process.env.NOTION_API_KEY;
  if (!notionToken) {
    response.status(500).send(renderPage({
      title: "구독 해지를 처리하지 못했습니다",
      message: "서버의 Notion 설정이 누락되었습니다.",
      email: "",
      signature: "",
      confirmed: true,
    }));
    return;
  }
  try {
    const databaseId = subscriberDatabaseId();
    const notion = new Client({ auth: notionToken });
    const database = await notion.databases.retrieve({ database_id: databaseId });
    const page = await fetchSubscriberPage(notion, databaseId, email);

    if (page) {
      const properties = {};
      const statusName = findPropertyName(database.properties || {}, STATUS_PROPERTIES);
      const unsubscribedAtName = findPropertyName(database.properties || {}, UNSUBSCRIBED_AT_PROPERTIES);

      if (statusName) properties[statusName] = { select: { name: "Unsubscribed" } };
      if (unsubscribedAtName) properties[unsubscribedAtName] = { date: { start: new Date().toISOString() } };

      await notion.pages.update({
        page_id: page.id,
        ...(Object.keys(properties).length ? { properties } : { archived: true }),
      });
    }

    response.status(200).send(renderPage({
      title: "구독 해지가 완료되었습니다",
      message: "앞으로 해당 주소로 CTTD 뉴스레터가 발송되지 않습니다.",
      email: "",
      signature: "",
      confirmed: true,
    }));
  } catch (error) {
    response.status(500).send(renderPage({
      title: "구독 해지를 처리하지 못했습니다",
      message: error.message,
      email: "",
      signature: "",
      confirmed: true,
    }));
  }
}
