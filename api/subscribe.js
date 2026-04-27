import { Client } from "@notionhq/client";

const EMAIL_PROPERTIES = ["Email", "이메일", "이름", "Name"];
const STATUS_PROPERTIES = ["Status", "상태"];
const AUDIENCE_PROPERTIES = ["Audience", "구독분야", "뉴스레터"];
const UNSUBSCRIBED_AT_PROPERTIES = ["Unsubscribed At", "해지일"];
const ALLOWED_AUDIENCES = new Set(["Service/Design", "DEV"]);

function normalizeEmail(value = "") {
  return String(value).trim().toLowerCase();
}

function isEmail(value = "") {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function propertyText(properties, names) {
  const prop = names.map((name) => properties[name]).find(Boolean);
  if (!prop) return "";
  if (prop.type === "title") return prop.title.map((item) => item.plain_text || "").join("").trim();
  if (prop.type === "rich_text") return prop.rich_text.map((item) => item.plain_text || "").join("").trim();
  if (prop.type === "email") return prop.email || "";
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

async function readJsonBody(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
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

function subscriberProperties(databaseProperties, email, audiences) {
  const titleName = Object.entries(databaseProperties).find(([, prop]) => prop.type === "title")?.[0] || "이름";
  const emailName = findPropertyName(databaseProperties, EMAIL_PROPERTIES);
  const statusName = findPropertyName(databaseProperties, STATUS_PROPERTIES);
  const audienceName = findPropertyName(databaseProperties, AUDIENCE_PROPERTIES);
  const unsubscribedAtName = findPropertyName(databaseProperties, UNSUBSCRIBED_AT_PROPERTIES);
  const properties = {
    [titleName]: { title: [{ text: { content: email } }] },
  };

  if (emailName && emailName !== titleName) properties[emailName] = { email };
  if (statusName) properties[statusName] = { select: { name: "Active" } };
  if (audienceName) properties[audienceName] = { multi_select: audiences.map((name) => ({ name })) };
  if (unsubscribedAtName) properties[unsubscribedAtName] = { date: null };

  return properties;
}

export default async function handler(request, response) {
  response.setHeader("Access-Control-Allow-Origin", process.env.NEWSLETTER_ALLOWED_ORIGIN || "*");
  response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (request.method === "OPTIONS") {
    response.status(200).json({ ok: true });
    return;
  }

  if (request.method !== "POST") {
    response.status(405).json({ ok: false, error: "Method not allowed" });
    return;
  }

  try {
    const payload = await readJsonBody(request);
    const email = normalizeEmail(payload.email);
    const audiences = Array.isArray(payload.audiences)
      ? [...new Set(payload.audiences.filter((value) => ALLOWED_AUDIENCES.has(value)))]
      : [];

    if (!isEmail(email)) {
      response.status(400).json({ ok: false, error: "올바른 이메일을 입력해주세요." });
      return;
    }

    if (!audiences.length) {
      response.status(400).json({ ok: false, error: "구독할 카테고리를 선택해주세요." });
      return;
    }

    const notionToken = process.env.NOTION_TOKEN || process.env.NOTION_API_KEY;
    if (!notionToken) {
      response.status(500).json({ ok: false, error: "Notion 설정이 누락되었습니다." });
      return;
    }
    const databaseId = subscriberDatabaseId();

    const notion = new Client({ auth: notionToken });
    const database = await notion.databases.retrieve({ database_id: databaseId });
    const properties = subscriberProperties(database.properties || {}, email, audiences);
    const existingPage = await fetchSubscriberPage(notion, databaseId, email);

    if (existingPage) {
      await notion.pages.update({ page_id: existingPage.id, properties });
      response.status(200).json({ ok: true, subscribed: true, updated: true });
      return;
    }

    await notion.pages.create({
      parent: { database_id: databaseId },
      properties,
    });
    response.status(201).json({ ok: true, subscribed: true, updated: false });
  } catch (error) {
    response.status(500).json({ ok: false, error: error.message });
  }
}
