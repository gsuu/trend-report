import { Client } from "@notionhq/client";
import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const outputPath = path.join(root, "src", "data", "report.json");

loadDotenv();

const notionToken = process.env.NOTION_TOKEN || process.env.NOTION_API_KEY;
const databaseId = process.env.NOTION_DATABASE_ID;

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

function loadDotenv() {
  const envPath = path.join(root, ".env");
  if (!existsSync(envPath)) return;

  for (const rawLine of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#") || !line.includes("=")) continue;
    const [key, ...valueParts] = line.split("=");
    const cleanKey = key.trim();
    if (!cleanKey || process.env[cleanKey]) continue;
    process.env[cleanKey] = valueParts.join("=").trim().replace(/^['"]|['"]$/g, "");
  }
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

function htmlRichText(items = []) {
  return items
    .map((item) => {
      let text = htmlEscape(item.plain_text || "");
      if (item.annotations?.code) text = `<code>${text}</code>`;
      if (item.annotations?.bold) text = `<strong>${text}</strong>`;
      if (item.annotations?.italic) text = `<em>${text}</em>`;
      if (item.href) text = `<a href="${htmlEscape(item.href)}" target="_blank" rel="noreferrer">${text}</a>`;
      return text;
    })
    .join("")
    .trim();
}

function normalizeKey(value = "") {
  return String(value).trim().toLowerCase().replaceAll(/\s+/g, "_").replaceAll("-", "_");
}

function getProperty(properties, names) {
  return names.map((name) => properties[name]).find(Boolean);
}

function hasProperty(properties, names) {
  return names.find((name) => properties[name]);
}

function propertyText(properties, names, fallback = "") {
  const prop = getProperty(properties, names);
  if (!prop) return fallback;
  if (prop.type === "title") return plainRichText(prop.title);
  if (prop.type === "rich_text") return plainRichText(prop.rich_text);
  if (prop.type === "select") return prop.select?.name || fallback;
  if (prop.type === "status") return prop.status?.name || fallback;
  if (prop.type === "url") return prop.url || fallback;
  if (prop.type === "email") return prop.email || fallback;
  if (prop.type === "phone_number") return prop.phone_number || fallback;
  if (prop.type === "number") return String(prop.number ?? fallback);
  if (prop.type === "date") return prop.date?.start || fallback;
  if (prop.type === "checkbox") return prop.checkbox ? "true" : "false";
  if (prop.type === "multi_select") return prop.multi_select.map((item) => item.name).join(", ");
  return fallback;
}

function propertyHtml(properties, names, fallback = "") {
  const prop = getProperty(properties, names);
  if (!prop) return htmlEscape(fallback);
  if (prop.type === "title") return htmlRichText(prop.title);
  if (prop.type === "rich_text") return htmlRichText(prop.rich_text);
  return htmlEscape(propertyText(properties, names, fallback));
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

function propertyImage(properties, names, fallback = "") {
  const prop = getProperty(properties, names);
  if (!prop) return fallback;
  if (prop.type === "url") return prop.url || fallback;
  if (prop.type === "files") {
    const file = prop.files[0];
    return file?.type === "external" ? file.external.url : file?.file?.url || fallback;
  }
  return propertyText(properties, names, fallback);
}

function issueNumber(index, properties) {
  const raw = propertyText(properties, ["Number", "번호", "No", "순번"], "");
  return raw ? raw.padStart(2, "0") : String(index + 1).padStart(2, "0");
}

function blockToProseBlock(block) {
  if (block.type === "heading_2" || block.type === "heading_3") {
    return { kind: "subhead", html: htmlRichText(block[block.type].rich_text) };
  }
  if (block.type === "quote") return { kind: "quote", html: htmlRichText(block.quote.rich_text) };
  if (block.type === "bulleted_list_item" || block.type === "numbered_list_item") {
    return { kind: "list", html: htmlRichText(block[block.type].rich_text) };
  }
  if (block.type === "paragraph") {
    const html = htmlRichText(block.paragraph.rich_text);
    return html ? { kind: "paragraph", html } : null;
  }
  return null;
}

function blockPlainText(block) {
  if (block.type === "heading_2" || block.type === "heading_3") return plainRichText(block[block.type].rich_text);
  if (block.type === "quote") return plainRichText(block.quote.rich_text);
  if (block.type === "bulleted_list_item" || block.type === "numbered_list_item") return plainRichText(block[block.type].rich_text);
  if (block.type === "paragraph") return plainRichText(block.paragraph.rich_text);
  return "";
}

function blockHtmlText(block) {
  if (block.type === "heading_2" || block.type === "heading_3") return htmlRichText(block[block.type].rich_text);
  if (block.type === "quote") return htmlRichText(block.quote.rich_text);
  if (block.type === "bulleted_list_item" || block.type === "numbered_list_item") return htmlRichText(block[block.type].rich_text);
  if (block.type === "paragraph") return htmlRichText(block.paragraph.rich_text);
  return "";
}

async function getAllChildBlocks(notion, blockId) {
  const blocks = [];
  let cursor;
  do {
    const response = await notion.blocks.children.list({
      block_id: blockId,
      start_cursor: cursor,
      page_size: 100,
    });
    blocks.push(...response.results);
    cursor = response.has_more ? response.next_cursor : undefined;
  } while (cursor);
  return blocks;
}

function extractBlockMeta(blocks) {
  const meta = {};
  for (const block of blocks) {
    if (block.type !== "bulleted_list_item" && block.type !== "numbered_list_item") continue;
    const match = blockPlainText(block).match(/^([^:：]{1,18})[:：]\s*(.+)$/);
    if (match) meta[match[1].trim()] = match[2].trim();
  }
  return meta;
}

function buildStructuredSections(blocks) {
  const sections = [];
  let current = null;

  const pushCurrent = () => {
    if (current && (current.blocks.length || current.itemsHtml.length)) sections.push(current);
  };

  for (const block of blocks) {
    if (block.type === "heading_2") {
      const title = blockPlainText(block);
      if (title === "서비스 변화 요약" || title === "기술 변화 요약") {
        pushCurrent();
        current = { title, className: "article-section", prose: false, blocks: [], itemsHtml: [] };
        continue;
      }
      if (title === "매거진 인사이트" || title === "인사이트") {
        pushCurrent();
        current = { title: "인사이트", className: "article-section is-deep-dive", prose: true, blocks: [], itemsHtml: [] };
        continue;
      }
      if (title === "기본 정보" || title === "요약") {
        pushCurrent();
        current = null;
        continue;
      }
      if (current?.prose) {
        const proseBlock = { kind: "subhead", html: blockHtmlText(block) };
        current.blocks.push(proseBlock);
        current.itemsHtml.push(`@@${proseBlock.kind}@@${proseBlock.html}`);
      }
      continue;
    }

    if (!current) continue;

    if (current.prose) {
      const proseBlock = blockToProseBlock(block);
      if (!proseBlock) continue;
      current.blocks.push(proseBlock);
      current.itemsHtml.push(`@@${proseBlock.kind}@@${proseBlock.html}`);
      continue;
    }

    if (block.type === "bulleted_list_item" || block.type === "numbered_list_item" || block.type === "paragraph") {
      const html = blockHtmlText(block);
      if (!html) continue;
      current.blocks.push({ kind: "list", html });
      current.itemsHtml.push(html);
    }
  }

  pushCurrent();
  return sections;
}

async function pageData(notion, page, properties, areaKey) {
  const blocks = await getAllChildBlocks(notion, page.id);
  const blockMeta = extractBlockMeta(blocks);
  const structuredSections = buildStructuredSections(blocks);
  const summaryItems = [
    propertyHtml(properties, ["Summary", "요약", "서비스 변화 요약", "기술 변화 요약"], ""),
    propertyHtml(properties, ["Before", "변경 전"], ""),
    propertyHtml(properties, ["After", "변경 후"], ""),
    propertyHtml(properties, ["Impact", "영향", "확인할 영향"], ""),
  ].filter(Boolean);

  if (structuredSections.length) return { sections: structuredSections, blockMeta };

  const sections = [];
  if (summaryItems.length) {
    sections.push({
      title: areaKey === "dev" ? "기술 변화 요약" : "서비스 변화 요약",
      className: "article-section",
      prose: false,
      itemsHtml: summaryItems,
      blocks: summaryItems.map((html) => ({ kind: "list", html })),
    });
  }

  const proseBlocks = blocks.map(blockToProseBlock).filter(Boolean);
  if (proseBlocks.length) {
    sections.push({
      title: "인사이트",
      className: "article-section is-deep-dive",
      prose: true,
      itemsHtml: proseBlocks.map((block) => `@@${block.kind}@@${block.html}`),
      blocks: proseBlocks,
    });
  }
  return { sections, blockMeta };
}

async function fetchFromNotion() {
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

  const issues = await Promise.all(pages.map(async (page, index) => {
    const properties = page.properties || {};
    const areaKey = normalizeKey(propertyText(properties, ["Area", "대분류", "대카테고리", "Type"], "uiux"));
    const categoryKey = normalizeKey(propertyText(properties, ["Category", "카테고리", "Subcategory", "소분류", "소카테고리"], areaKey === "dev" ? "javascript" : "ecommerce"));
    const number = issueNumber(index, properties);
    const date = propertyText(properties, ["Date", "발행날짜", "Published Date", "날짜"], page.created_time || "").slice(0, 10);
    const platform = propertyText(properties, ["Platform", "서비스", "플랫폼", "Brand", "브랜드명"], "CTTD");
    const takeawayHtml = propertyHtml(properties, ["Takeaway", "Title", "제목", "한줄 인사이트"], platform);
    const deckHtml = propertyHtml(properties, ["Deck", "Summary", "요약", "목록 요약", "설명"], "");
    const { sections, blockMeta } = await pageData(notion, page, properties, areaKey);
    const resolvedNumber = String(blockMeta["번호"] || number).padStart(2, "0");

    return {
      id: page.id,
      number: resolvedNumber,
      platform,
      areaKey,
      area: areaKey === "dev" ? "DEV" : "UIUX",
      categoryKey,
      category: CATEGORY_LABELS[categoryKey] || categoryKey,
      date,
      route: `#/story/${resolvedNumber}`,
      image: propertyImage(properties, ["Image", "이미지", "Cover", "커버"], blockMeta["이미지"] || page.cover?.external?.url || page.cover?.file?.url || ""),
      imageCaption: propertyText(properties, ["Image Caption", "이미지 설명", "캡션"], blockMeta["이미지 설명"] || ""),
      tags: propertyTags(properties, ["Tags", "태그"]),
      takeawayHtml,
      deckHtml,
      sourceUrl: propertyText(properties, ["Source URL", "출처 URL", "URL"], blockMeta["출처 URL"] || ""),
      sourceTitle: propertyText(properties, ["Source Title", "출처", "출처명"], blockMeta["출처"] || ""),
      sections,
    };
  }));

  const first = issues[0];
  return {
    slug: first?.date || new Date().toISOString().slice(0, 10),
    title: "CTTD Trend Magazine",
    description: first ? `${first.date} CTTD UIUX/Web Service Weekly Trend Magazine` : "CTTD UIUX/Web Service Weekly Trend Magazine",
    issues,
  };
}

async function fallbackFromGeneratedSite() {
  const generatedPath = path.join(root, "site", "index.html");
  if (!existsSync(generatedPath)) {
    return {
      slug: "empty",
      title: "CTTD Trend Magazine",
      description: "NOTION_TOKEN과 NOTION_DATABASE_ID를 설정해주세요.",
      issues: [],
    };
  }
  const html = await readFile(generatedPath, "utf8");
  const match = html.match(/<script id="report-data" type="application\/json">([\s\S]*?)<\/script>/);
  if (!match) throw new Error("site/index.html에서 report-data JSON을 찾지 못했습니다.");
  const report = JSON.parse(match[1]);
  return {
    slug: report.slug || "generated",
    title: "CTTD Trend Magazine",
    description: "기존 생성 사이트 데이터로 만든 로컬 미리보기입니다.",
    issues: report.issues || [],
  };
}

const report = notionToken && databaseId ? await fetchFromNotion() : await fallbackFromGeneratedSite();
await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

const source = notionToken && databaseId ? "Notion" : "site/index.html fallback";
console.log(`Wrote ${report.issues.length} issues from ${source} to ${path.relative(root, outputPath)}`);
