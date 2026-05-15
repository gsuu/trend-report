import { Client } from "@notionhq/client";
import { writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..", "..");
const outputPath = path.join(root, "src", "data", "report.json");

loadDotenvFiles();

const notionToken = process.env.NOTION_TOKEN || process.env.NOTION_API_KEY;
const databaseId = process.env.NOTION_DATABASE_ID;

const CATEGORY_LABELS = {
  fashion: "fashion",
  ecommerce: "ecommerce",
  department_store: "department",
  beauty: "beauty",
  book_content: "book",
  global_service_ux: "global",
  global: "global",
  platform: "platform",
  fintech: "fintech",
  ai: "AI",
  html: "HTML",
  css: "CSS",
  javascript: "JAVASCRIPT",
  web_accessibility: "웹접근성",
  update: "Update",
  tool: "TOOL",
  data_api: "DATA/API",
  service: "service",
  performance: "Performance",
  accessibility: "Accessibility",
  browser: "Browser",
  frontend: "Frontend",
  ai_dev: "AI/DEV",
  publishing: "Publishing",
  ai_design: "AI/Design",
  pwa: "PWA",
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
const GENERIC_SERVICE_CATEGORY_KEYS = new Set(["", "service", "services", "서비스", "web_service", "webservice"]);
const SERVICE_SUBCATEGORY_ORDER = ["platform", "fintech", "ecommerce", "fashion", "beauty", "book_content", "department_store", "ai"];
const SERVICE_SUBCATEGORY_KEYWORDS = {
  platform: new Set([
    "platform", "플랫폼", "마켓플레이스", "marketplace", "커뮤니티", "community", "로컬", "local",
    "후기", "리뷰", "review", "콘텐츠", "content", "추천", "탐색", "검색", "온보딩", "계정",
    "당근", "karrot", "spotify", "오픈서베이", "opensurvey", "서비스플랫폼",
  ]),
  fintech: new Set([
    "fintech", "핀테크", "페이", "pay", "결제", "송금", "정산", "간편결제", "캐시", "포인트",
    "금융", "은행", "카드", "보험", "대출", "가맹점", "pos", "사장님", "상점", "매장운영",
    "당근페이", "토스", "토스페이", "토스플레이스", "toss", "panda", "데이터봇", "data_bot", "databot",
  ]),
  fashion: new Set([
    "fashion", "패션", "의류", "룩", "스타일", "스타일링", "키즈", "아울렛", "부티크", "스니커즈",
    "무신사", "w컨셉", "wconcept", "지그재그", "zigzag", "브랜드", "옷", "신발", "가방", "원피스",
    "임부복", "수유복", "플러스사이즈", "플러스_사이즈",
  ]),
  ecommerce: new Set([
    "ecommerce", "e_commerce", "커머스", "이커머스", "쇼핑", "구매", "결제", "주문", "배송", "장바구니",
    "상품", "상품상세", "상품_상세", "거래", "중고거래", "중고", "리세일", "보상판매", "판매", "스토어",
    "마켓", "홈쇼핑", "멤버십", "쿠폰", "할인", "적립", "환불", "교환", "재고", "큐레이션", "선물",
    "g마켓", "gmarket", "네이버플러스", "롯데홈쇼핑", "당근페이", "rakuten", "楽天市場",
  ]),
  beauty: new Set([
    "beauty", "뷰티", "화장품", "스킨케어", "메이크업", "피부", "성분", "제형", "향", "헬스",
    "건강", "건강기능식품", "영양제", "올리브영", "다이소", "무신사뷰티", "무신사_뷰티", "화해",
    "cosme", "코스메", "바로교환", "바로환불",
  ]),
  book_content: new Set([
    "book", "book_content", "content", "콘텐츠", "도서", "책", "서점", "전자책", "웹소설", "웹툰",
    "리디", "ridibooks", "밀리의서재", "뷰어", "이어보기", "추천홈",
  ]),
  department_store: new Set([
    "department", "department_store", "백화점", "신세계", "롯데백화점", "현대백화점", "팝업", "오프라인",
  ]),
  ai: new Set([
    "ai", "생성형ai", "챗봇", "대화형", "자연어", "에이전트", "agent", "agents", "agentic", "llm",
    "추천", "개인화", "자동화", "데이터봇", "data_bot", "databot", "panda", "mcp", "chatgpt", "claude",
  ]),
};

export function loadDotenvFiles() {
  for (const envName of [".env.local", ".env"]) {
    const envPath = path.join(root, envName);
    if (!existsSync(envPath)) continue;

    for (const rawLine of readFileSync(envPath, "utf8").split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#") || !line.includes("=")) continue;
      const [key, ...valueParts] = line.split("=");
      const cleanKey = key.trim();
      if (!cleanKey || process.env[cleanKey]) continue;
      process.env[cleanKey] = valueParts.join("=").trim().replace(/^['"]|['"]$/g, "");
    }
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

function sanitizeEditorialHtml(value = "") {
  return String(value)
    .replaceAll("UIUX 전문가 관점", "설계 관점")
    .replaceAll("프론트엔드 개발 전문가 관점", "구현 관점")
    .replaceAll("Frontend Development 관점", "구현 관점")
    .replaceAll("클라이언트에게 던질 질문", "점검 질문")
    .replaceAll("PM과 웹기획자에게 핵심 질문은 ", "핵심 질문은 ")
    .replaceAll("PM과 웹기획자에게 핵심 질문은", "핵심 질문은")
    .replaceAll("웹기획자와 PM 관점에서는", "설계 관점에서는")
    .replaceAll("웹기획자와 PM은", "설계 과정에서는")
    .replaceAll("웹디자이너와 PM에게", "서비스 설계에")
    .replaceAll("웹디자이너에게", "제작 흐름에서")
    .replaceAll("웹디자이너와 PM", "설계 과정")
    .replaceAll("웹디자이너는", "화면 설계에서는")
    .replaceAll("디자이너와 기획자는", "제작 과정에서는")
    .replaceAll("디자이너라면", "설계 관점에서는")
    .replaceAll("PM은", "운영 기준에서는")
    .replaceAll("웹기획자는", "플로우 설계에서는")
    .replaceAll("웹DEV 관점에서는", "구현 관점에서는")
    .replaceAll("개발자 관전 포인트", "구현 관전 포인트")
    .replaceAll("프론트엔드 개발자", "프론트엔드 구현")
    .replaceAll("개발자는 무엇을 덜 해도 될까", "실무에 어떻게 적용할 수 있을까")
    .replaceAll("개발자에게", "구현 관점에서")
    .replaceAll("개발자는", "구현 과정에서는")
    .replaceAll("클라이언트에게 이야기한다면", "이 업데이트를 적용한다면")
    .replaceAll("클라이언트에게는", "서비스에서는")
    .replaceAll("클라이언트라면", "서비스라면")
    .replaceAll("클라이언트에게", "서비스에")
    .replaceAll("클라이언트가", "서비스가");
}

function htmlRichText(items = []) {
  const html = items
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
  return sanitizeEditorialHtml(html);
}

function normalizeKey(value = "") {
  return String(value)
    .trim()
    .toLowerCase()
    .replaceAll(/`([^`]+)`/g, "$1")
    .replaceAll("#", "")
    .replaceAll(/[\s./-]+/g, "_")
    .replaceAll(/[^0-9a-z가-힣_]+/g, "_")
    .replaceAll(/_+/g, "_")
    .replaceAll(/^_+|_+$/g, "");
}

function normalizeAreaKey(value = "", tags = [], category = "") {
  const key = normalizeKey(value || "service");
  if (normalizeKey(category) === "ai_design") return "design";
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
  if (categoryKey === "global_service_ux") return "global";
  if (categoryKey === "ai_dev") return "ai";
  if (areaKey !== "design") return categoryKey;
  const tokens = [categoryKey, ...tags.map((tag) => normalizeKey(tag))];
  return tokens.some((token) => DESIGN_AI_KEYS.has(token)) ? "ai" : categoryKey;
}

function classificationTokens(values = []) {
  const tokens = new Set();
  for (const value of values) {
    for (const part of String(value || "").split(/[,/|>·\s]+/)) {
      const token = normalizeKey(part);
      if (!token) continue;
      tokens.add(token);
      for (const segment of token.split("_")) {
        if (segment) tokens.add(segment);
      }
    }
  }
  return tokens;
}

function sectionTextValues(sections = []) {
  const values = [];
  for (const section of sections) {
    values.push(section.title);
    for (const block of section.blocks || []) values.push(block.html);
    for (const item of section.itemsHtml || []) values.push(item);
  }
  return values;
}

function inferServiceCategoryKey(rawCategoryKey, fields = {}) {
  const categoryKey = normalizeKey(rawCategoryKey);
  if (!GENERIC_SERVICE_CATEGORY_KEYS.has(categoryKey)) return categoryKey || "service";

  const values = [
    fields.platform,
    fields.takeawayHtml,
    fields.deckHtml,
    fields.sourceTitle,
    ...(fields.tags || []),
    ...sectionTextValues(fields.sections || []),
  ];
  const tokens = classificationTokens(values);
  const blob = normalizeKey(values.join(" "));
  const scores = new Map();
  for (const [key, keywords] of Object.entries(SERVICE_SUBCATEGORY_KEYWORDS)) {
    let score = 0;
    for (const token of tokens) {
      if (keywords.has(token)) score += 1;
    }
    for (const keyword of keywords) {
      if (keyword && !tokens.has(keyword) && blob.includes(keyword)) score += 1;
    }
    if (score) scores.set(key, score);
  }
  if (!scores.size) return "service";

  return [...scores.keys()].sort((a, b) => (
    scores.get(b) - scores.get(a)
    || (SERVICE_SUBCATEGORY_ORDER.indexOf(a) === -1 ? 99 : SERVICE_SUBCATEGORY_ORDER.indexOf(a))
      - (SERVICE_SUBCATEGORY_ORDER.indexOf(b) === -1 ? 99 : SERVICE_SUBCATEGORY_ORDER.indexOf(b))
  ))[0];
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
  if (prop.type === "title") return plainRichText(prop.title) || fallback;
  if (prop.type === "rich_text") return plainRichText(prop.rich_text) || fallback;
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
  if (!prop) return sanitizeEditorialHtml(htmlEscape(fallback));
  if (prop.type === "title") return htmlRichText(prop.title);
  if (prop.type === "rich_text") return htmlRichText(prop.rich_text);
  return sanitizeEditorialHtml(htmlEscape(propertyText(properties, names, fallback)));
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
    for (const block of response.results) {
      blocks.push(block);
      if (!block.has_children) continue;
      if (block.type === "child_page" || block.type === "child_database") continue;
      const nestedBlocks = await getAllChildBlocks(notion, block.id);
      blocks.push(...nestedBlocks);
    }
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

function referenceLinksFromMeta(meta, properties = {}) {
  const links = [];
  const seen = new Set();
  const entries = [];

  for (const [key, value] of Object.entries(meta)) {
    if (/^관련\s*(뉴스|블로그|매거진)/.test(key)) entries.push(["관련 뉴스", value]);
  }

  entries.push(
    ["관련 뉴스", propertyText(properties, ["관련 뉴스", "Related News"], "")],
    ["서비스 URL", meta["서비스 URL"] || propertyText(properties, ["서비스 URL", "Service URL", "서비스 링크"], "")],
    ["보조 출처", meta["보조 출처 URL"] || propertyText(properties, ["보조 출처 URL", "Secondary Source URL", "Reference URL"], "")],
    ["이미지 출처", meta["이미지 출처"] || propertyText(properties, ["이미지 출처", "Image Source"], "")],
  );

  for (const [label, rawValue] of entries) {
    const value = String(rawValue || "").trim();
    if (!value) continue;

    let title = value;
    let url = value;
    const markdown = value.match(/^\[([^\]]+)\]\((https?:\/\/[^)]+)\)$/);
    const pipe = value.match(/^(.+?)\s*\|\s*(https?:\/\/\S+)$/);

    if (markdown) {
      title = markdown[1].trim();
      url = markdown[2].trim();
    } else if (pipe) {
      title = pipe[1].trim();
      url = pipe[2].trim();
    }

    if (!/^https?:\/\//.test(url) || seen.has(url)) continue;
    seen.add(url);
    links.push({ label, title, url });
  }
  return links;
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

export async function fetchMagazineReport(options = {}) {
  const resolvedNotionToken = options.notionToken || notionToken;
  const resolvedDatabaseId = options.databaseId || databaseId;
  if (!resolvedNotionToken || !resolvedDatabaseId) {
    throw new Error("NOTION_TOKEN/NOTION_API_KEY and NOTION_DATABASE_ID are required.");
  }

  const notion = new Client({ auth: resolvedNotionToken });
  const database = await notion.databases.retrieve({ database_id: resolvedDatabaseId });
  const databaseProperties = database.properties || {};
  const dateProperty = hasProperty(databaseProperties, ["Date", "발행날짜", "Published Date", "날짜"]);
  const sorts = dateProperty
    ? [{ property: dateProperty, direction: "descending" }]
    : [{ timestamp: "created_time", direction: "descending" }];
  const pages = [];
  let cursor;
  do {
    const response = await notion.databases.query({
      database_id: resolvedDatabaseId,
      start_cursor: cursor,
      page_size: 100,
      sorts,
    });
    pages.push(...response.results);
    cursor = response.has_more ? response.next_cursor : undefined;
  } while (cursor);

  const pageSignature = (page) => {
    const properties = page.properties || {};
    const sourceUrl = propertyText(properties, ["Source URL", "출처 URL", "URL"], "");
    if (sourceUrl) return `source|${normalizeKey(sourceUrl)}`;

    const sourceKey = propertyText(properties, ["Source Key", "Slug", "Page Key", "고유키"], "");
    if (sourceKey) return `key|${normalizeKey(sourceKey)}`;

    const title = propertyText(properties, ["Takeaway", "Title", "제목", "한줄 인사이트"], "");
    const platform = propertyText(properties, ["Platform", "서비스", "플랫폼", "Brand", "브랜드명"], "");
    const tags = propertyTags(properties, ["Tags", "태그"]);
    const area = normalizeAreaKey(
      propertyText(properties, ["Area", "대분류", "대카테고리", "Type"], "service"),
      tags,
      propertyText(properties, ["Category", "카테고리", "Subcategory", "소분류", "소카테고리"], ""),
    );
    return [platform, area, title].map((value) => normalizeKey(value)).join("|");
  };

  const pageScore = (page) => {
    const properties = page.properties || {};
    let score = 0;
    if (propertyText(properties, ["Source Key", "Slug", "Page Key", "고유키"], "")) score += 10;
    if (propertyText(properties, ["Source URL", "출처 URL", "URL"], "")) score += 5;
    if (propertyText(properties, ["Deck", "Summary", "요약", "목록 요약", "설명"], "")) score += 2;
    return score;
  };

  const uniquePageMap = new Map();
  for (const page of pages) {
    const signature = pageSignature(page);
    if (!signature) continue;
    const existing = uniquePageMap.get(signature);
    if (!existing || pageScore(page) > pageScore(existing)) {
      uniquePageMap.set(signature, page);
    }
  }
  const uniquePages = [...uniquePageMap.values()];

  const issues = await Promise.all(uniquePages.map(async (page, index) => {
    const properties = page.properties || {};
    const tags = propertyTags(properties, ["Tags", "태그"]);
    const rawCategory = propertyText(properties, ["Category", "카테고리", "Subcategory", "소분류", "소카테고리"], "");
    const areaKey = normalizeAreaKey(propertyText(properties, ["Area", "대분류", "대카테고리", "Type"], "service"), tags, rawCategory);
    const number = issueNumber(index, properties);
    const date = propertyText(properties, ["Date", "발행날짜", "Published Date", "날짜"], page.created_time || "").slice(0, 10);
    const platform = propertyText(properties, ["Platform", "서비스", "플랫폼", "Brand", "브랜드명"], "CTTD");
    const takeawayHtml = propertyHtml(properties, ["Takeaway", "Title", "제목", "한줄 인사이트"], platform);
    const deckHtml = propertyHtml(properties, ["Deck", "Summary", "요약", "목록 요약", "설명"], "");
    const { sections, blockMeta } = await pageData(notion, page, properties, areaKey);
    const rawCategoryKey = normalizeCategoryKey(
      normalizeKey(rawCategory || blockMeta["카테고리"] || (areaKey === "dev" ? "javascript" : "service")),
      areaKey,
      tags,
    );
    const categoryKey = areaKey === "service"
      ? inferServiceCategoryKey(rawCategoryKey, { platform, takeawayHtml, deckHtml, sourceTitle: blockMeta["출처"] || "", tags, sections })
      : rawCategoryKey;
    const resolvedNumber = String(blockMeta["번호"] || number).padStart(2, "0");
    const referenceLinks = referenceLinksFromMeta(blockMeta, properties);

    return {
      id: page.id,
      number: resolvedNumber,
      platform,
      areaKey,
      area: areaLabel(areaKey),
      categoryKey,
      category: CATEGORY_LABELS[categoryKey] || categoryKey,
      date,
      route: `/articles/${resolvedNumber}`,
      image: propertyImage(properties, ["Image", "이미지", "Cover", "커버"], blockMeta["이미지"] || page.cover?.external?.url || page.cover?.file?.url || ""),
      imageCaption: propertyText(properties, ["Image Caption", "이미지 설명", "캡션"], blockMeta["이미지 설명"] || ""),
      tags,
      takeawayHtml,
      deckHtml,
      sourceUrl: propertyText(properties, ["Source URL", "출처 URL", "URL"], blockMeta["출처 URL"] || ""),
      sourceTitle: propertyText(properties, ["Source Title", "출처", "출처명"], blockMeta["출처"] || ""),
      referenceLinks,
      sections,
    };
  }));

  issues.sort((a, b) => {
    const dateCompare = String(b.date || "").localeCompare(String(a.date || ""));
    if (dateCompare) return dateCompare;
    return (Number.parseInt(a.number, 10) || 0) - (Number.parseInt(b.number, 10) || 0);
  });

  const uniqueIssues = [];
  const seenIssueSignatures = new Set();
  for (const issue of issues) {
    const signature = issue.sourceUrl
      ? `source|${normalizeKey(issue.sourceUrl)}`
      : [issue.platform, issue.areaKey, issue.takeawayHtml].map((value) => normalizeKey(value)).join("|");
    if (signature && seenIssueSignatures.has(signature)) continue;
    if (signature) seenIssueSignatures.add(signature);
    uniqueIssues.push(issue);
  }

  const first = uniqueIssues[0];
  return {
    slug: first?.date || new Date().toISOString().slice(0, 10),
    title: "CTTD Trend Magazine",
    description: first ? `${first.date} CTTD Service/Design/DEV Weekly Trend Magazine` : "CTTD Service/Design/DEV Weekly Trend Magazine",
    issues: uniqueIssues,
  };
}

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  const report = await fetchMagazineReport();
  await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  console.log(`Wrote ${report.issues.length} issues from Notion to ${path.relative(root, outputPath)}`);
}
