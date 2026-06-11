// Notion 구독자 DB 공용 헬퍼 — api/subscribe.js, api/unsubscribe.js 공유.
// (api/_ 로 시작하는 경로는 Vercel 라우트로 노출되지 않는다.)

export const EMAIL_PROPERTIES = ["Email", "이메일", "이름", "Name"];
export const STATUS_PROPERTIES = ["Status", "상태"];
export const UNSUBSCRIBED_AT_PROPERTIES = ["Unsubscribed At", "해지일"];

export function normalizeEmail(value = "") {
  return String(value).trim().toLowerCase();
}

export function propertyText(properties, names) {
  const prop = names.map((name) => properties[name]).find(Boolean);
  if (!prop) return "";
  if (prop.type === "title") return prop.title.map((item) => item.plain_text || "").join("").trim();
  if (prop.type === "rich_text") return prop.rich_text.map((item) => item.plain_text || "").join("").trim();
  if (prop.type === "email") return prop.email || "";
  if (prop.type === "select") return prop.select?.name || "";
  return "";
}

export function findPropertyName(properties, names) {
  return names.find((name) => properties[name]);
}

export function pageEmail(page) {
  return normalizeEmail(propertyText(page.properties || {}, EMAIL_PROPERTIES));
}

export function subscriberDatabaseId() {
  const databaseId = (process.env.NEWSLETTER_SUBSCRIBERS_DATABASE_ID || "").trim();
  if (!databaseId) throw new Error("NEWSLETTER_SUBSCRIBERS_DATABASE_ID is required.");
  return databaseId;
}

export function emailPropertyFilter(name, property, email) {
  if (property.type === "email") return { property: name, email: { equals: normalizeEmail(email) } };
  if (property.type === "title") return { property: name, title: { equals: normalizeEmail(email) } };
  if (property.type === "rich_text") return { property: name, rich_text: { equals: normalizeEmail(email) } };
  return null;
}

export async function fetchSubscriberPage(notion, databaseId, databaseProperties, email) {
  const filters = EMAIL_PROPERTIES
    .filter((name) => databaseProperties[name])
    .map((name) => emailPropertyFilter(name, databaseProperties[name], email))
    .filter(Boolean);

  if (filters.length) {
    const response = await notion.databases.query({
      database_id: databaseId,
      page_size: 1,
      filter: filters.length === 1 ? filters[0] : { or: filters },
    });
    return response.results.find((page) => pageEmail(page) === normalizeEmail(email));
  }

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
