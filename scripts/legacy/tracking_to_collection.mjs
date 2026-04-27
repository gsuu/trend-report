import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..", "..");
const templatePath = path.join(root, "templates", "raw-collection.md");
const platformsPath = path.join(root, "data", "platforms.json");
const runsDir = path.join(root, "runs");

const categorySignalRules = {
  fashion: ["홈/카테고리/브랜드관 진입 구조", "룩북·스타일 추천·착장/코디 탐색", "찜·재입고·브랜드 팔로우·방문 보상"],
  ecommerce: ["홈·검색·상품상세·장바구니·결제 플로우", "멤버십·쿠폰·포인트·무료배송 조건", "AI 추천·리뷰 요약·상품 비교"],
  department_store: ["VIP/멤버십·혜택 이해 UX", "온라인 혜택·픽업·재고·예약 연계", "선물하기·프리미엄 큐레이션"],
  beauty: ["성분·피부진단·리뷰 기반 비교 UX", "AI 추천·듀프·개인화 루틴", "랭킹·리뷰 신뢰 장치"],
  book_content: ["추천 홈·이어보기·책갈피·동기화", "로그인/복귀/재설치 후 이어 읽기", "구독·캐시·소장/대여 결제 구조"],
};

const devSignalRules = {
  ai: ["UIUX 개발자가 화면 구현, 코드 리뷰, 접근성 QA에 바로 쓸 수 있는 AI 개발 도구", "Figma, Storybook, Playwright, 브라우저 MCP처럼 디자인-코드 연동과 UI 검증 방식이 바뀌는 도구"],
  web_platform: ["접근성, CSS, JavaScript, HTML 속성·API·브라우저 동작 변경", "Chrome, Firefox, Safari/WebKit, iOS/iPadOS 릴리즈와 호환성 변화"],
  frontend_system: ["디자인 시스템, 컴포넌트, 토큰, 접근성 QA, 시각 회귀 테스트 사례", "Astro, React, Next.js, Vue, Svelte, Web Components처럼 화면 구현 방식에 영향이 있는 프레임워크"],
};

const expandedSourceChecklist = [
  ["국내 Service·Design 매거진", ["요즘IT", "DIGITAL iNSIGHT", "pxd / pxd UX Lab", "토스 테크 Design", "디자인 스펙트럼", "오픈서베이 블로그", "PUBLY"]],
  ["공식 제품/컨퍼런스 YouTube", ["OpenAI", "Anthropic", "Figma", "Adobe Creative Cloud", "Google Design", "Google for Developers", "토스 메이커스 컨퍼런스"]],
  ["AI·디자인 도구 필수 추적", ["OpenAI", "Anthropic / Claude", "Figma AI / Dev Mode / MCP", "Adobe Firefly", "Google Gemini", "Canva / Framer / Webflow"]],
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

function sourceName() {
  return argValue("--source", "selected").trim().toLowerCase();
}

function normalize(value = "") {
  return String(value || "").trim().toLowerCase();
}

function cleanText(value = "") {
  return String(value || "")
    .replace(/&amp;/g, "&")
    .replace(/&#039;|&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function shortText(value = "", limit = 320) {
  const text = cleanText(value);
  return text.length > limit ? `${text.slice(0, limit - 1).trimEnd()}…` : text;
}

function isoDate(value = "") {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return outputDate();
  return date.toISOString().slice(0, 10);
}

function fileNameForSource(source) {
  if (source === "articles") return "articles.json";
  return "tracking-data.json";
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
  return "";
}

async function inputPathFor(date) {
  const configured = argValue("--input", "").trim();
  if (configured) return path.isAbsolute(configured) ? configured : path.join(root, configured);

  const fileName = fileNameForSource(sourceName());
  const datedPath = runFile(date, fileName);
  try {
    await fs.stat(datedPath);
    return datedPath;
  } catch {
    const latest = await latestRunFile(fileName);
    if (latest) return latest;
  }
  throw new Error(`자동 수집 JSON을 찾지 못했습니다: runs/*/${fileName}`);
}

function buildPlatformChecklist(data) {
  const priority = data.contentPriority || data.collectionPriority || [];
  const grouped = new Map();
  for (const platform of data.domestic || []) {
    const category = platform.category || "uncategorized";
    if (!grouped.has(category)) grouped.set(category, []);
    grouped.get(category).push(platform);
  }
  const categories = [...priority, ...[...grouped.keys()].filter((category) => !priority.includes(category))];
  const lines = [];
  for (const category of categories) {
    const items = grouped.get(category) || [];
    if (!items.length) continue;
    lines.push(`  - ${category}`);
    for (const item of items) {
      lines.push(`    - [ ] ${item.name || "이름 없음"} | sources: ${(item.sources || []).join(", ")}`);
    }
  }
  return lines.join("\n");
}

function buildCategorySignalChecklist(data) {
  const priority = data.contentPriority || data.collectionPriority || [];
  const lines = [];
  for (const category of priority) {
    const signals = categorySignalRules[category] || [];
    if (!signals.length) continue;
    lines.push(`  - ${category}`);
    for (const signal of signals) lines.push(`    - [ ] ${signal}`);
  }
  return lines.join("\n");
}

function buildDevSignalChecklist() {
  const lines = [
    "  - DEV 필수 수집 원칙",
    "    - [ ] UIUX 개발자가 화면 구현, 디자인 시스템, 접근성 QA, 브라우저 호환성 판단에 바로 쓸 수 있는가?",
    "    - [ ] AI 관련 변화가 있으면 최우선 후보로 올렸는가?",
    "    - [ ] 접근성, CSS, JavaScript, HTML, Safari/WebKit, Chrome 업데이트를 각각 확인했는가?",
  ];
  for (const [category, signals] of Object.entries(devSignalRules)) {
    lines.push(`  - ${category}`);
    for (const signal of signals) lines.push(`    - [ ] ${signal}`);
  }
  return lines.join("\n");
}

function buildExpandedSourceChecklist() {
  return expandedSourceChecklist
    .flatMap(([group, sources]) => [`  - ${group}`, ...sources.map((source) => `    - [ ] ${source}`)])
    .join("\n");
}

function buildExpandedSourceCandidates() {
  return expandedSourceChecklist
    .flatMap(([group, sources], groupIndex) => [
      `### E${groupIndex + 1}. [${group}] 확장 수집 후보`,
      "",
      ...sources.map((source) => `- [ ] ${source}: 새 글/영상/릴리즈 확인 후 후보 카드로 승격 또는 제외 사유 기록`),
      "",
    ])
    .join("\n")
    .trimEnd();
}

function areaLabel(article) {
  const area = normalize(article.area);
  if (area === "dev") return "DEV";
  if (area === "design") return "Design";
  return "Service";
}

function roleTags(article) {
  if (Array.isArray(article.roleTags) && article.roleTags.length) return article.roleTags.join(" / ");
  const area = areaLabel(article);
  if (area === "DEV") return "웹DEV";
  if (area === "Design") return "웹디자인";
  return "웹서비스기획";
}

function platformName(article) {
  const source = cleanText(article.source || "CTTD");
  const text = `${source} ${article.title || ""}`.toLowerCase();
  if (/olive\s?young|올리브영/.test(text)) return "올리브영";
  if (/musinsa|무신사|29cm/.test(text)) return "무신사";
  if (/figma/.test(text)) return "Figma";
  if (/webkit|safari/.test(text)) return "WebKit/Safari";
  if (/chrome/.test(text)) return "Chrome Developers";
  if (/astro/.test(text)) return "Astro";
  if (/spotify/.test(text)) return "Spotify";
  return source;
}

function country(article) {
  const text = `${article.source || ""} ${article.title || ""} ${article.content || ""}`;
  return /[가-힣]/.test(text) && !/(Figma|Spotify|Chrome|WebKit|Safari|Astro|CSS-Tricks|Dev\.to|Frontend Focus|JavaScript Weekly)/i.test(text)
    ? "KR"
    : "GLOBAL";
}

function meetingUsefulness(article) {
  const score = Number(article.uploadScore || 0);
  if (score >= 120) return "High";
  if (score >= 80) return "Medium";
  return "Low";
}

function registrationStatus(article) {
  const content = cleanText(article.content || "");
  if (!content || content === cleanText(article.title || "") || content.length < 80) return "보류";
  return article.uploadStatus === "selected" ? "채택" : "보류";
}

function imageMemo(article) {
  return article.image ? "" : "자동 수집 단계에서 공식 대표 이미지를 찾지 못했습니다. 최종 기준 원문에서 이미지 재확인이 필요합니다.";
}

function issueCard(article, index) {
  const title = cleanText(article.title || "제목 없음");
  const source = cleanText(article.source || "");
  const link = cleanText(article.link || "");
  const content = shortText(article.content || article.summary || title);
  const area = areaLabel(article);
  const category = cleanText(article.category || "");
  const image = cleanText(article.image || article.imageUrl || article.ogImage || "");
  const tags = roleTags(article)
    .split("/")
    .map((tag) => `#${tag.trim().replace(/\s+/g, "")}`)
    .join(" ");

  return [
    `### ${index}. [${platformName(article)}] ${tags}`,
    "",
    `- 날짜: ${isoDate(article.pubDate)}`,
    `- 국가: ${country(article)}`,
    `- 대분류: ${area}`,
    `- 직무 태그: ${roleTags(article)}`,
    `- 카테고리: ${category}`,
    `- 출처: ${source}`,
    `- 출처 URL: ${link}`,
    `- 후보 발견 출처: ${source}`,
    `- 후보 발견 URL: ${link}`,
    `- 최종 기준 원문: ${source}`,
    `- 최종 기준 원문 URL: ${link}`,
    "- 관련 글:",
    "- 관련 글 URL:",
    "- YouTube 채널:",
    "- YouTube 영상 URL:",
    "- YouTube 게시일:",
    "- 발표자/소속:",
    "- 핵심 타임스탬프:",
    "- 설명란 원문 링크:",
    "- transcript 확인: 없음",
    "- 원문 확인 결과: 원문 확인 필요",
    "- 원문 조직 기준: 검수 필요",
    "- 글 등록 가능 여부: 검수 필요",
    `- 이미지: ${image}`,
    `- 이미지 설명: ${image ? `${source || platformName(article)} 원문 대표 이미지` : ""}`,
    `- 이미지 출처: ${image ? "최종 기준 원문" : ""}`,
    `- 이미지 확보 메모: ${imageMemo(article)}`,
    "- 확인 화면: 기타",
    "- 확인 기기: Web",
    "- 검증 상태: 자동 수집 / 원문 확인 필요",
    "- 전략 축: 검수 필요",
    `- 미팅 활용도: ${meetingUsefulness(article)}`,
    `- 채택 점수: 자동 ${article.uploadScore || 0}점 / 수동 검수 필요`,
    `- 채택 여부: ${registrationStatus(article)}`,
    "- 채택 기준:",
    "  - 실제 변화: 원문 확인 후 작성",
    "  - 사용자 행동 변화: 원문 확인 후 작성",
    "  - 수치·팩트: 원문 확인 후 작성",
    "  - 크로스보더/시장 전략: 해당 시 작성",
    "  - 체크 질문: 원문 확인 후 작성",
    "",
    "#### 출처 원문 메모",
    "",
    `- 후보군 인사이트 요약: ${content}`,
    `- 최종 기준 원문에서 확인한 사실: ${content}`,
    "- 외국어 원문 한국어 패치 메모:",
    `- 공식/스토어 원문: ${link}`,
    "- 원문 미확인 시 관련 글:",
    "- 미디어 보도 핵심:",
    "- 서로 다른 출처에서 일치한 내용:",
    "- 아직 확인이 필요한 내용: 원문 본문, 이미지, 실제 화면 변화, 수치의 기간과 기준",
    "",
    "#### 업데이트 상세",
    "",
    `- 기능/정책/화면 변화 1: ${content}`,
    "- 기능/정책/화면 변화 2:",
    "- 기능/정책/화면 변화 3:",
    "",
    "#### 화면·플로우 관찰",
    "",
    "- 진입 위치:",
    "- 화면에서 강조되는 문구:",
    "- 버튼/CTA:",
    "- 기존 플로우 대비 줄어든 단계:",
    "- 이미지가 보여주는 변화:",
    "",
    "#### 변경 전/후",
    "",
    "- 변경 전:",
    "- 변경 후:",
    "",
    "#### 사용자 행동 변화",
    "",
    "- 사용자가 덜 하게 되는 일:",
    "- 사용자가 새로 하게 되는 일:",
    "- 탐색/비교/구매/재방문 중 영향받는 여정:",
    "- 실패하거나 헷갈릴 수 있는 지점:",
    "",
    "#### 수치·팩트",
    "",
    "- 수치:",
    "- 기간:",
    "- 비교 기준:",
    "- 출처:",
    "",
    "#### 비즈니스·서비스 맥락",
    "",
    "- 왜 지금 이 업데이트가 나왔는지:",
    "- 카테고리/시장 변화와 연결되는 지점:",
    "- 매출/거래액/멤버십/재방문과 연결되는 지점:",
    "",
    "#### 인사이트 재료",
    "",
    "- 핵심 해석:",
    "- 우리 클라이언트에 적용할 수 있는 점:",
    "- 클라이언트에게 던질 질문:",
    "",
    "#### 크로스보더/시장 전략",
    "",
    "- 해외 진출:",
    "- 현지 온라인 판매/배송:",
    "- 역직구/매출 변화:",
    "- UX·서비스 시사점:",
    "",
    "#### 체크 질문",
    "",
    "- ",
    "",
    "#### 매거진 인사이트 확장 메모",
    "",
    "- 한 문장 리드:",
    "- 장면/문제의식:",
    "- 사용자 여정 해석:",
    "- 클라이언트 적용 포인트:",
    "- 마무리 관점:",
    "- 매거진 문장 초안:",
    "",
    "#### 제외/주의 사유",
    "",
    "- 자동 수집 후보입니다. 원문 사실 확인 후 최종 리포트 승격 여부를 결정합니다.",
    "- 리포트 제외 메모:",
    "- 다시 볼 조건:",
    "",
    "---",
    "",
  ].join("\n");
}

function insertCandidateCards(content, cards) {
  const marker = "\n## 확장 수집 후보";
  if (!content.includes(marker)) return `${content.trimEnd()}\n\n${cards}\n`;
  return content.replace(marker, `\n${cards}\n## 확장 수집 후보`);
}

async function main() {
  const date = outputDate();
  const inputPath = await inputPathFor(date);
  const outputPath = runFile(date, "raw-collection.md");
  const overwrite = hasArg("--overwrite");
  const limit = Number.parseInt(argValue("--limit", "20"), 10) || 20;

  try {
    await fs.stat(outputPath);
    if (!overwrite) {
      throw new Error(`이미 raw collection이 있습니다. 덮어쓰려면 --overwrite를 사용하세요: ${outputPath}`);
    }
  } catch (error) {
    if (error.code !== "ENOENT" && !String(error.message || "").includes("이미 raw collection")) throw error;
    if (String(error.message || "").includes("이미 raw collection")) throw error;
  }

  const [template, platforms, inputData] = await Promise.all([
    fs.readFile(templatePath, "utf8"),
    fs.readFile(platformsPath, "utf8").then(JSON.parse),
    fs.readFile(inputPath, "utf8").then(JSON.parse),
  ]);
  const articles = Array.isArray(inputData)
    ? inputData
    : sourceName() === "candidates"
      ? inputData.candidates || []
      : inputData.selected || [];

  const selectedArticles = articles
    .filter((article) => article && article.title && article.link)
    .slice(0, limit);
  const cards = selectedArticles.map((article, index) => issueCard(article, index + 1)).join("\n");
  const content = insertCandidateCards(
    template
      .replaceAll("{{date}}", date)
      .replaceAll("{{platform_checklist}}", buildPlatformChecklist(platforms))
      .replaceAll("{{category_signal_checklist}}", buildCategorySignalChecklist(platforms))
      .replaceAll("{{expanded_source_checklist}}", buildExpandedSourceChecklist())
      .replaceAll("{{expanded_source_candidates}}", buildExpandedSourceCandidates())
      .replaceAll("{{dev_signal_checklist}}", buildDevSignalChecklist()),
    cards,
  );

  await fs.mkdir(runDir(date), { recursive: true });
  await fs.writeFile(outputPath, content, "utf8");
  console.log(`INPUT_FILE=${inputPath}`);
  console.log(`COLLECTION_FILE=${outputPath}`);
  console.log(`Wrote ${selectedArticles.length} candidates`);
}

main().catch((error) => {
  console.error(`Failed to build raw collection: ${error.message}`);
  process.exit(1);
});
