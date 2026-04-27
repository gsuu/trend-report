import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..", "..");
const runsDir = path.join(root, "runs");

const EDITORIAL_GUIDES = [
  "scripts/tracking/new_collection.py",
  "docs/data-collection-strategy.md",
  "docs/target-fit-classifier-agent.md",
  "docs/editorial-style-guide.md",
];

function argValue(name, fallback = "") {
  const prefix = `${name}=`;
  const value = process.argv.find((arg) => arg.startsWith(prefix));
  return value ? value.slice(prefix.length) : fallback;
}

function hasArg(name) {
  return process.argv.includes(name);
}

function outputDate() {
  return argValue("--date", process.env.TRACKING_OUTPUT_DATE || new Date().toISOString().slice(0, 10)).trim();
}

function runDir(date = outputDate()) {
  return path.join(runsDir, date);
}

function runFile(date, fileName) {
  return path.join(runDir(date), fileName);
}

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd: root, stdio: "inherit", shell: false });
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} ${args.join(" ")} exited with ${code}`));
    });
  });
}

async function latestRunFile(fileName) {
  const runs = (await fs.readdir(runsDir, { withFileTypes: true }).catch(() => []))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort()
    .reverse();

  for (const run of runs) {
    const candidate = runFile(run, fileName);
    try {
      await fs.stat(candidate);
      return candidate;
    } catch {
      // keep looking
    }
  }
  throw new Error(`runs/*/${fileName} 파일이 없습니다.`);
}

function normalize(value = "") {
  return String(value).trim().toLowerCase();
}

function isoDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return outputDate();
  return date.toISOString().slice(0, 10);
}

function shortText(value = "", limit = 320) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if (text.length <= limit) return text;
  return `${text.slice(0, limit - 1).trimEnd()}…`;
}

function cleanTitle(value = "") {
  return String(value || "")
    .replace(/[\u{1F000}-\u{1FAFF}]/gu, "")
    .replace(/\uFE0F/g, "")
    .replace(/[❤♥]/g, "")
    .replace(/[=:\-–—]\s*$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanDisplayText(value = "") {
  return cleanTitle(value)
    .replace(/^보도자료\s*/i, "")
    .replace(/\s*Read the full article\.\.\..*$/i, "")
    .replace(/\s*The post\s+.+$/i, "")
    .replace(/\s*\d{4}\.\d{2}\.\d{2}\s*$/g, "")
    .trim();
}

function linkDomain(link = "") {
  try {
    return new URL(link).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function usableImageUrl(value = "", pageUrl = "") {
  if (!value) return "";
  try {
    const imageUrl = new URL(value, pageUrl || undefined);
    const sourceUrl = pageUrl ? new URL(pageUrl) : null;
    if (sourceUrl && imageUrl.href.replace(/\/$/, "") === sourceUrl.href.replace(/\/$/, "")) return "";
    if (/\.(mp4|mov|webm|avi)(\?|#|$)/i.test(imageUrl.pathname)) return "";
    if (/\.(png|jpe?g|webp|gif|svg|avif)(\?|#|$)/i.test(imageUrl.pathname)) return imageUrl.href;
    return /(image|img|media|cdn|sanity|uploads|thumbnail|og-image|preview-card)/i.test(imageUrl.href) ? imageUrl.href : "";
  } catch {
    return "";
  }
}


function areaLabel(article) {
  const text = `${article.source || ""} ${article.title || ""} ${article.content || ""}`.toLowerCase();
  const area = normalize(article.area);
  if (area === "dev" || /(webkit|safari technology preview|chrome developers|mdn blog|css-tricks|frontend focus|css weekly|javascript weekly|syntax\.fm)/i.test(text)) return "DEV";
  if (area === "design" || /(figma|design system|design systems|adobe|canva|framer|webflow|디자인 시스템|프로토타입)/i.test(text)) return "Design";
  return "Service";
}

function categoryLabel(article) {
  const category = normalize(article.category);
  const known = new Set([
    "platform",
    "fintech",
    "fashion",
    "ecommerce",
    "department_store",
    "beauty",
    "book_content",
    "global_service_ux",
    "ai",
    "design_system",
    "html",
    "css",
    "javascript",
    "web_accessibility",
    "tool",
    "data_api",
  ]);
  if (known.has(category)) return category;

  const text = `${article.source || ""} ${article.title || ""} ${article.content || ""}`.toLowerCase();
  if (/(css|css weekly|css-tricks)/i.test(text)) return "css";
  if (/(javascript|frontend focus|javascript weekly|typescript)/i.test(text)) return "javascript";
  if (/(safari|webkit|chrome|browser|mdn)/i.test(text)) return "html";
  if (/(accessibility|a11y|wcag|aria|접근성)/i.test(text)) return "web_accessibility";
  if (/(design system|component|token|figma)/i.test(text)) return "design_system";
  if (/(ai|llm|agent|chatgpt|claude|gemini|firefly|sora|imagen|veo)/i.test(text)) return "ai";
  return areaLabel(article) === "Service" ? "global_service_ux" : "tool";
}

function roleTags(article) {
  const area = areaLabel(article);
  const category = categoryLabel(article);
  const text = `${article.title || ""} ${article.content || ""}`.toLowerCase();
  const tags = new Set();

  if (area === "Service") tags.add("웹서비스기획");
  if (area === "Design") tags.add("웹디자인");
  if (area === "DEV") tags.add("웹DEV");
  if (area !== "DEV" && /(ux|ui|design|브랜드|화면|디자인)/i.test(text)) tags.add("웹디자인");
  if (["platform", "fintech", "ecommerce", "fashion", "beauty", "department_store", "book_content", "global_service_ux"].includes(category)) tags.add("웹서비스기획");

  return [...tags];
}

function sourceType(article) {
  const source = `${article.source || ""}`.toLowerCase();
  const domain = linkDomain(article.link).toLowerCase();
  if (/(webkit|developer\.chrome|web\.dev|mdn|figma|openai|anthropic|adobe|spotify|google|github|nodejs|w3|whatwg)/i.test(`${source} ${domain}`)) return "official";
  if (/(weekly|frontend focus|css weekly|javascript weekly|newsletter)/i.test(source)) return "newsletter";
  if (/(smashing|css-tricks|dev\.to|yozm|digital insight|opensurvey|blog)/i.test(`${source} ${domain}`)) return "magazine_or_blog";
  if (/(youtube|youtu\.be)/i.test(domain)) return "youtube";
  return "media_or_unknown";
}

function sourceReviewNote(article) {
  const type = sourceType(article);
  if (type === "official") return "최종 기준 원문으로 사용할 수 있습니다. 원문 날짜, 기능명, 화면/릴리즈 범위를 확인하세요.";
  if (type === "newsletter") return "후보 발견 출처입니다. 뉴스레터 안의 원문 링크를 따라 최종 기준 원문을 분리하세요.";
  if (type === "magazine_or_blog") return "해석/맥락 보강 출처입니다. 공식 발표, 제품 문서, 릴리즈 노트로 역추적하세요.";
  if (type === "youtube") return "영상 후보입니다. 공식 채널 여부, 발표일, 데모 화면, 설명란 원문 링크를 확인하세요.";
  return "출처 신뢰도를 AI가 재확인해야 합니다.";
}

function targetFit(article) {
  const area = areaLabel(article);
  const category = categoryLabel(article);
  const text = `${article.source || ""} ${article.title || ""} ${article.content || ""}`.toLowerCase();
  const ecommerceSignal = /(이커머스|커머스|쇼핑|상품|상품상세|장바구니|결제|구매|주문|배송|리뷰|추천|검색|멤버십|쿠폰|포인트|재구매|crm|픽업|재고|commerce|ecommerce|marketplace|cart|checkout|product|review|recommendation|membership)/i.test(text);
  const weakPromo = /(카드|제휴카드|삼성카드|멤버스데이|할인전|기획전|프로모션|쿠폰|e쿠폰|콘텐츠 제휴|파트너십|campaign|promotion|partnership|coupon)/i.test(text);
  const aiIntegration = /(claude|chatgpt|gemini|외부 ai|연동|integration)/i.test(text);
  const screenSignal = /(홈|검색|상품상세|장바구니|결제|마이페이지|리뷰|추천|멤버십|알림|재구매|관리자|운영도구|dashboard|checkout|cart|product page|review|recommendation|screen|ui|ux|flow|workflow|mcp|accessibility|css|html|javascript|browser|design system)/i.test(text);
  const explicitScreenSignal = /(화면|스크린|플로우|진입|버튼|상태값|상품상세|장바구니|결제 화면|checkout|cart|product page|screen|flow|cta)/i.test(text);
  const serviceExpertSignal = /(탐색|검색|추천|비교|구매|결제|장바구니|리뷰|후기|재방문|crm|멤버십|포인트|쿠폰|알림|온보딩|신뢰|전환|운영자|관리자|대시보드|정책|혜택|상태값|정보구조|flow|journey|retention|conversion|checkout|review|recommendation)/i.test(text);
  const serviceApplicationSignal = /(적용|고려|점검|설계|화면|플로우|정책|조건|예외|검수|cta|상태값|근거|피드백|운영|재방문|전환|비교 기준|추천 근거)/i.test(text);

  if (area === "DEV" || area === "Design") {
    return {
      label: "design_dev_reference",
      priority: screenSignal ? "P1" : "P2",
      reason: "디자인/개발 제작 실무 연결 후보입니다. 디자인 시스템, 구현, 접근성 QA, 브라우저 영향이 원문에 있는지 확인합니다.",
    };
  }

  if (area === "Service" && (!serviceExpertSignal || !serviceApplicationSignal)) {
    return {
      label: "exclude",
      priority: "자동 제외",
      reason: "웹서비스 전문가가 왜 주목해야 하는지와 실제 서비스 적용 시 고려할 화면·정책·플로우 단서가 부족합니다.",
    };
  }

  if ((weakPromo || aiIntegration) && !explicitScreenSignal) {
    return {
      label: "weak_promo",
      priority: "제외 검토",
      reason: "제휴, 프로모션, 쿠폰, 콘텐츠/AI 연동 성격이 강합니다. 화면·플로우 근거가 없으면 shortlist에서 제외합니다.",
    };
  }

  if (["ecommerce", "fashion", "beauty", "department_store"].includes(category) && ecommerceSignal && screenSignal) {
    return {
      label: "core_ecommerce",
      priority: "P0",
      reason: "상품 탐색, 구매, 결제, 멤버십, 리뷰, 추천 등 이커머스 여정에 직접 연결되는 후보입니다.",
    };
  }

  if (area === "Service" && ecommerceSignal && screenSignal && !weakPromo) {
    return {
      label: "commerce_adjacent",
      priority: "P1",
      reason: "이커머스가 아니어도 신뢰, 결제, 추천, 운영 UX처럼 고객 여정에 대입 가능한 후보입니다.",
    };
  }

  if (weakPromo || aiIntegration) {
    return {
      label: "weak_promo",
      priority: "제외 검토",
      reason: "제휴, 프로모션, 쿠폰, 콘텐츠/AI 연동 성격이 강합니다. 화면·플로우 근거가 없으면 shortlist에서 제외합니다.",
    };
  }

  return {
    label: "exclude",
    priority: "P2/제외 검토",
    reason: "CTTD 이커머스 고객 회의에서 바로 쓸 화면·모듈·정책 질문이 남는지 추가 확인이 필요합니다.",
  };
}

function collectedArticle(article) {
  const image = usableImageUrl(article.image || article.imageUrl || article.ogImage || "", article.link);
  const fit = targetFit(article);
  const machineStatus = fit.label === "exclude" ? "auto_excluded" : "candidate";
  return {
    title: cleanDisplayText(article.title),
    link: article.link,
    domain: linkDomain(article.link),
    pubDate: isoDate(article.pubDate),
    source: article.source || "",
    sourceType: sourceType(article),
    sourceReviewNote: sourceReviewNote(article),
    area: areaLabel(article),
    category: categoryLabel(article),
    roleTags: roleTags(article),
    targetFit: fit.label,
    shortlistPriority: fit.priority,
    targetFitReason: fit.reason,
    image,
    summary: shortText(article.content || article.title, 360),
    machineStatus,
    machineReason: machineStatus === "auto_excluded"
      ? fit.reason
      : "AI 편집 단계에서 원문 확인 후 채택/보류/제외를 판단합니다.",
    editorialDecision: "ai_required",
    sourceBasis: {
      discoverySource: article.source || "",
      discoveryUrl: article.link,
      finalSourceRequired: sourceType(article) !== "official",
      finalSourceUrl: sourceType(article) === "official" ? article.link : "",
      relatedSources: [],
    },
  };
}

function uniqueArticles(articles) {
  const seen = new Set();
  return articles.filter((article) => {
    const key = article.link || `${article.source}|${article.title}`;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function sortArticles(a, b) {
  const areaOrder = { Service: 0, Design: 1, DEV: 2 };
  const fitOrder = { core_ecommerce: 0, commerce_adjacent: 1, design_dev_reference: 2, weak_promo: 8, exclude: 9 };
  const serviceCategoryOrder = { ecommerce: 0, fashion: 1, beauty: 2, department_store: 3, platform: 4, fintech: 5, book_content: 6, global_service_ux: 7, ai: 8 };
  return (areaOrder[a.area] ?? 9) - (areaOrder[b.area] ?? 9)
    || (fitOrder[a.targetFit] ?? 9) - (fitOrder[b.targetFit] ?? 9)
    || (serviceCategoryOrder[a.category] ?? 9) - (serviceCategoryOrder[b.category] ?? 9)
    || String(b.pubDate || "").localeCompare(String(a.pubDate || ""))
    || String(a.source || "").localeCompare(String(b.source || ""));
}

function markdownLink(label, filePath) {
  return `[${label}](${filePath.replaceAll("\\", "/")})`;
}

function articleBrief(article, index) {
  return [
    `### ${String(index + 1).padStart(2, "0")}. [${article.source || "출처 미상"}] ${article.title || "제목 없음"}`,
    "",
    `- 날짜: ${article.pubDate}`,
    `- 대분류: ${article.area}`,
    `- 카테고리: ${article.category}`,
    `- 타겟 적합성: ${article.targetFit}`,
    `- shortlist 우선순위: ${article.shortlistPriority}`,
    `- 적합성 메모: ${article.targetFitReason}`,
    `- 직무 태그: ${article.roleTags.join(", ") || "AI 확인 필요"}`,
    `- 출처 유형: ${article.sourceType}`,
    `- 후보 발견 출처: ${article.source || "확인 필요"}`,
    `- 후보 발견 URL: ${article.link}`,
    `- 최종 기준 원문 필요: ${article.sourceBasis.finalSourceRequired ? "yes" : "no"}`,
    `- 기계 상태: ${article.machineStatus}`,
    `- 기계 메모: ${article.machineReason}`,
    `- 출처 확인 메모: ${article.sourceReviewNote}`,
    article.image ? `- 이미지 후보: ${article.image}` : "- 이미지 후보: 없음",
    "",
    article.summary || "요약 없음",
    "",
  ].join("\n");
}

function editorialBriefMarkdown(data) {
  const candidates = data.articles.filter((article) => article.machineStatus === "candidate");
  const excluded = data.articles.filter((article) => article.machineStatus !== "candidate");
  const grouped = new Map();
  for (const article of candidates) {
    if (!grouped.has(article.area)) grouped.set(article.area, []);
    grouped.get(article.area).push(article);
  }

  const parts = [
    `# ${data.date} 수집/분류 브리프`,
    "",
    "이 파일은 자동 수집 결과입니다. 여기서는 채택/보류/제외, 제목 보정, 매거진 인사이트 작성을 하지 않습니다.",
    "",
    "## AI 편집 기준",
    "",
    ...EDITORIAL_GUIDES.map((guide) => `- ${markdownLink(guide, guide)}`),
    "",
    "AI 편집 단계에서 할 일:",
    "",
    "- `scripts/tracking/new_collection.py`의 카테고리별 관찰 포인트와 DEV 필수 수집 원칙을 읽습니다.",
    "- `docs/data-collection-strategy.md` 기준으로 후보 발견 출처와 최종 기준 원문을 분리합니다.",
    "- `docs/target-fit-classifier-agent.md` 기준으로 후보를 `core_ecommerce / commerce_adjacent / design_dev_reference / weak_promo / exclude`로 먼저 분류합니다.",
    "- `docs/editorial-style-guide.md` 기준으로 타겟이 궁금해할 정보만 남깁니다.",
    "- 각 후보를 `채택 / 보류 / 제외`로 판단하고 사유를 남깁니다.",
    "- 최종 원고 작성 기준 후보는 이커머스 core 후보를 최우선으로 20~30개 사이 `shortlist-20-30.md`에 정리합니다.",
    "- `shortlist-20-30.md`는 다시 4~7개로 줄이는 예비 목록이 아니라, 원문 검증 후 그대로 `magazine-report.md`로 작성할 기준 목록입니다.",
    "- 카드 제휴, 쿠폰/e쿠폰, 콘텐츠 제휴, 외부 AI 연동, 멤버십 프로모션은 원문에서 화면·플로우·정책 변화가 확인될 때만 채택합니다.",
    "- Service 후보는 `왜 웹서비스 전문가가 주목해야 하는지`와 `우리 서비스에 적용할 때 고려할 화면·정책·플로우 조건`이 둘 다 보일 때만 채택합니다.",
    "- `혜택 조건을 쉽게`, `결제 후 다음 거래`, `추천을 안전하게 연결`처럼 어느 서비스에도 붙는 일반론만 남는 후보는 제외합니다.",
    "- 같은 브랜드 후보가 많을 때는 AI 편집 단계에서 독자 가치가 큰 항목 최대 2개만 채택합니다.",
    "- shortlist 항목 중 원문 부족, 광고성, 화면·서비스·구현 변화 미확인 항목만 제외 메모로 옮기고, 통과 항목은 `magazine-report.md`로 작성한 뒤 Notion 업로드를 진행합니다.",
    "",
    "## 수집 요약",
    "",
    `- 전체 수집: ${data.articles.length}`,
    `- AI 검토 후보: ${candidates.length}`,
    `- 자동 제외: ${excluded.length}`,
    "",
  ];

  for (const area of ["Service", "Design", "DEV"]) {
    const articles = grouped.get(area) || [];
    if (!articles.length) continue;
    parts.push(`## ${area}`, "");
    articles.forEach((article, index) => parts.push(articleBrief(article, index)));
  }

  if (excluded.length) {
    parts.push("## 자동 제외된 항목", "");
    excluded.forEach((article, index) => parts.push(articleBrief(article, index)));
  }

  return parts.join("\n");
}

async function writeOutputs(articles, date) {
  await fs.mkdir(runDir(date), { recursive: true });

  const trackingDataPath = runFile(date, "tracking-data.json");
  const editorialBriefPath = runFile(date, "editorial-brief.md");
  const data = {
    date,
    purpose: "collection_classification_source_only",
    editorialGuides: EDITORIAL_GUIDES,
    nextStep: "AI가 editorialGuides와 editorial-brief.md를 읽고 타겟 적합성 분류를 먼저 수행한 뒤, 이커머스 core 후보를 최우선으로 shortlist-20-30.md를 만들고 magazine-report.md 작성을 수행합니다.",
    articles,
  };

  await fs.writeFile(trackingDataPath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  await fs.writeFile(editorialBriefPath, editorialBriefMarkdown(data), "utf8");
  return { trackingDataPath, editorialBriefPath };
}

async function main() {
  const date = outputDate();

  if (!hasArg("--no-fetch")) {
    await run(process.execPath, [path.join("scripts", "tracking", "fetch_tracking_news.mjs")]);
  }

  const trackingPath = runFile(date, "articles.json");
  const articlesPath = await fs.stat(trackingPath).then(() => trackingPath).catch(() => latestRunFile("articles.json"));
  const rawArticles = JSON.parse(await fs.readFile(articlesPath, "utf8"));
  const articles = uniqueArticles(rawArticles)
    .map(collectedArticle)
    .sort(sortArticles);
  const { trackingDataPath, editorialBriefPath } = await writeOutputs(articles, date);

  console.log(`Collected ${articles.length} classified articles`);
  console.log(`TRACKING_DATA_FILE=${trackingDataPath}`);
  console.log(`EDITORIAL_BRIEF_FILE=${editorialBriefPath}`);
  console.log("Notion upload is intentionally not part of collect_materials.mjs.");
}

main().catch((error) => {
  console.error("Failed to collect materials:", error.message);
  process.exit(1);
});
