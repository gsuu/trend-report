import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");
const trackingDir = path.join(root, "news-tracking", "articles");
const candidatesDir = path.join(root, "news-tracking", "candidates");
const selectedDir = path.join(root, "news-tracking", "selected");
const reportsDir = path.join(root, "reports");
const maxDefault = 20;

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

function isoDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return outputDate();
  return date.toISOString().slice(0, 10);
}

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd: root, stdio: "inherit", shell: process.platform === "win32" });
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} ${args.join(" ")} exited with ${code}`));
    });
  });
}

async function pythonCommands(args) {
  const commands = [];
  const pythonBin = process.env.PYTHON_BIN || process.env.PYTHON;
  if (pythonBin) commands.push([pythonBin, args]);

  if (process.platform === "win32") {
    const userProfile = process.env.USERPROFILE || "";
    const bundledPython = userProfile
      ? path.join(userProfile, ".cache", "codex-runtimes", "codex-primary-runtime", "dependencies", "python", "python.exe")
      : "";
    if (bundledPython) {
      try {
        await fs.stat(bundledPython);
        commands.push([bundledPython, args]);
      } catch {
        // bundled runtime is optional outside Codex desktop
      }
    }
    commands.push(["py", ["-3", ...args]], ["python", args], ["python3", args]);
  } else {
    commands.push(["python3", args], ["python", args]);
  }

  return commands;
}

async function latestJsonFile(directory) {
  const files = (await fs.readdir(directory)).filter((name) => name.endsWith(".json")).sort().reverse();
  if (!files.length) throw new Error(`tracking JSON이 없습니다: ${directory}`);
  return path.join(directory, files[0]);
}

function normalize(value = "") {
  return String(value).trim().toLowerCase();
}

function sendable(article) {
  if (!article?.title || !article?.link) return false;
  if (article.sendTarget === false) return false;
  if (isHardExcludedArticle(article)) return false;
  const trackingStatus = normalize(article.trackingStatus || "candidate");
  const publishStatus = normalize(article.publishStatus || "pending");
  return !["excluded", "exclude", "rejected", "보류", "제외"].includes(trackingStatus)
    && !["sent", "archived", "hidden", "제외"].includes(publishStatus);
}

function isHardExcludedArticle(article) {
  const text = `${article.source || ""} ${article.title || ""} ${article.content || ""}`.toLowerCase();
  const title = `${article.title || ""}`.trim().toLowerCase();
  if (/^(소개|about|company|뉴스|news|공지|press|보도자료|운영 정책|개인정보처리방침|privacy policy|terms|terms of service|이용약관)$/.test(title)) return true;
  if (/(개인정보처리방침|운영 정책|이용약관|privacy policy|terms of service)/i.test(text)) return true;
  if (/(flutter|dart|ios native|android native|swiftui|jetpack compose|플러터|다트)/i.test(text)) return true;
  if (/(product launch|new product|capsule|exclusive drop|ambassador|lookbook|campaign|photo shoot|celebrity|collection visual|teaser|model|브랜드 앰배서더|앰배서더|화보|룩북|캠페인|여름 캠페인|홀리데이 컬렉션|상품 출시|제품 출시|퍼퓸 출시|향수 출시|캡슐|단독 기획 발매|기획 발매|모델|티저|배우|감독 발탁|영상 선공개)/i.test(text)) return true;
  if (/(브랜드\s+.+출시|.+퍼퓸.+출시|.+향수.+출시|.+컬렉션.+출시|자체\s+뷰티\s+상품\s+거래액)/i.test(text)
    && !/(앱|웹|온라인|커머스|카테고리|검색|추천|개인화|멤버십|결제|탐색|화면|사용자 경험|서비스|배송|교환|환불|풀필먼트|리뉴얼|개편)/i.test(text)) {
    return true;
  }
  if (/(store open|flagship|offline store|매장.+오픈|상하이|항저우|오프라인|플래그십|그랜드 오픈|신\(新\)\s*1선 도시)/i.test(text)
    && !/(앱|웹|온라인|예약|재고|픽업|쿠폰|crm|멤버십|방문 후|서비스 연동)/i.test(text)) {
    return true;
  }
  if (/(브랜딩 룸|홈 구장|스카이박스|팝업|성수동|장학생 브랜드|next in brand|넥스트 인 브랜드|루키)/i.test(text)
    && !/(직매입|풀필먼트|배송|교환|환불|앱|웹|온라인|카테고리|검색|추천|개인화|멤버십|결제|탐색|화면|사용자 경험|서비스)/i.test(text)) {
    return true;
  }
  if (/(family day|패밀리 데이|어린이날 3연전|홈 구장|스포츠|구단|야구장|스타디움|브랜딩 룸)/i.test(text)
    && !/(앱|웹|온라인|예약|재고|픽업|쿠폰|crm|멤버십|방문 후|서비스 연동)/i.test(text)) {
    return true;
  }
  if (/(알뜰폰|유심|통신비|단독 판매|편의점 판매|판매)/i.test(text)
    && !/(앱|웹|온라인|커머스|카테고리|검색|추천|개인화|멤버십|결제|탐색|화면|사용자 경험|서비스|배송|교환|환불|리뉴얼|개편)/i.test(text)) {
    return true;
  }
  if (/(brand documentary|magazine b|acquisition|acquires|인수|매거진 b|브랜드 다큐멘터리 매거진)/i.test(text)
    && !/(app|web|online|commerce|category|search|recommend|personal|membership|checkout|payment|ux|ui|앱|웹|온라인|커머스|카테고리|검색|추천|개인화|멤버십|결제|탐색|화면|사용자 경험|서비스)/i.test(text)) {
    return true;
  }
  return false;
}

function roleTags(article) {
  const area = normalize(article.area);
  const category = normalize(article.category);
  const text = `${article.title || ""} ${article.content || ""}`.toLowerCase();
  const tags = new Set();
  const publisherOnly = area === "dev" || ["css", "html", "javascript"].includes(category);

  if (area === "service" || ["ecommerce", "fashion", "beauty", "department_store", "global_service_ux"].includes(category)) {
    tags.add("웹서비스기획");
  }
  if (!publisherOnly && (area === "design" || category === "design_system" || text.includes("design") || text.includes("ux") || text.includes("ui"))) {
    tags.add("웹디자인");
  }
  if (area === "dev" || text.includes("css") || text.includes("html") || text.includes("javascript") || text.includes("accessibility")) {
    tags.add("웹DEV");
  }

  return [...tags];
}

function normalizeRoleTag(value = "") {
  const tag = String(value || "").trim().replace(/^#/, "");
  const key = tag.replace(/\s+/g, "").toLowerCase();
  const aliases = {
    "uiux디자이너": "웹디자인",
    "uiux웹디자이너": "웹디자인",
    "uiux 웹디자이너": "웹디자인",
    "웹기획자": "웹서비스기획",
    "웹서비스기획자": "웹서비스기획",
    "웹dev": "웹DEV",
    "webdev": "웹DEV",
  };
  return aliases[key] || tag;
}

function normalizedRoleTags(article) {
  const seen = new Set();
  return (article.roleTags || roleTags(article))
    .map(normalizeRoleTag)
    .filter((tag) => {
      const key = tag.replace(/\s+/g, "").toLowerCase();
      if (!tag || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function categoryLabel(article) {
  const labels = {
    fashion: "fashion",
    ecommerce: "ecommerce",
    department_store: "department",
    beauty: "beauty",
    book_content: "book",
    global_service_ux: "global_service_ux",
    ai: "ai",
    design_system: "design_system",
    html: "html",
    css: "css",
    javascript: "javascript",
    web_accessibility: "web_accessibility",
    tool: "tool",
    data_api: "data_api",
  };
  return labels[normalize(article.category)] || normalize(article.category || "global_service_ux");
}

function areaLabel(article) {
  const text = `${article.source || ""} ${article.title || ""} ${article.content || ""}`.toLowerCase();
  if (/(webkit|safari technology preview|release notes for safari|chrome developers|mdn blog|css-tricks|frontend focus|css weekly|javascript weekly)/i.test(text)) return "DEV";
  const area = normalize(article.area);
  if (area === "dev") return "DEV";
  if (area === "design") return "Design";
  return "Service";
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

function titleKey(title = "") {
  return cleanTitle(title).toLowerCase();
}

function isDevAiArticle(article) {
  const text = `${article.source || ""} ${article.title || ""} ${article.content || ""}`.toLowerCase();
  return areaLabel(article) === "DEV"
    && /(ai|llm|agent|agentic|mcp|claude code|codex|copilot|chatgpt|openai|gemini|automation|workflow|vibe coding|ai coding|browser-side scan|에이전트|코덱스|코파일럿|자동화|워크플로)/i.test(text)
    && /(html|css|javascript|typescript|component|web component|react|vue|svelte|astro|browser|dom|aria|accessibility|chrome|safari|figma|frontend|publishing|퍼블리싱|컴포넌트|브라우저|프론트)/i.test(text)
    && !/(ai sdk|responses api|server api|backend|database|node api|rest api|graphql|sdk|백엔드|서버 api|데이터베이스)/i.test(text);
}

function isDevAiHeadline(article) {
  const text = `${article.source || ""} ${article.title || ""}`.toLowerCase();
  return areaLabel(article) === "DEV"
    && /(ai|llm|agent|agentic|mcp|claude code|codex|copilot|chatgpt|openai|gemini|automation|workflow|vibe coding|ai coding|browser-side scan|에이전트|코덱스|코파일럿|자동화|워크플로)/i.test(text)
    && !/(ai sdk|responses api|server api|backend|database|node api|rest api|graphql|sdk|백엔드|서버 api|데이터베이스)/i.test(text);
}

function isDesignerFriendlyArticle(article) {
  if (areaLabel(article) !== "Design") return true;
  const text = `${article.source || ""} ${article.title || ""} ${article.content || ""}`.toLowerCase();
  if (/(mcp|model context protocol|codex|workspace agents|plugin|settings|repository|github|developer|backend|server|database|sdk|api|hackathon|conference|recordings|agenda|컨퍼런스|해커톤|녹화|아젠다)/i.test(text)) {
    return false;
  }
  return /(design system|component system|component library|ui component|design token|ui kit|pattern library|prompt|prompting|workflow|checklist|template|practical|how to|guide|figma|canva|adobe|firefly|prototype|ux|ui|디자인 시스템|컴포넌트 시스템|컴포넌트 라이브러리|ui 컴포넌트|디자인 토큰|프롬프트|워크플로|체크리스트|템플릿|실무|가이드|피그마|캔바|어도비|프로토타입)/i.test(text);
}

function onlineServiceInterest(text) {
  let value = 0;
  if (/(online|app|web|platform|service|commerce|e-commerce|marketplace|subscription|checkout|payment|search|recommend|personal|data|온라인|앱|웹|플랫폼|서비스|커머스|이커머스|마켓플레이스|구독|결제|검색|추천|개인화|데이터)/i.test(text)) value += 12;
  if (/(user experience|ux|redesign|renewal|revamp|navigation|onboarding|personalization|recommendation|information architecture|design system|customer journey|flow|사용자 경험|유저 경험|고객 경험|리뉴얼|개편|탐색|내비게이션|온보딩|개인화|추천|정보 구조|디자인 시스템|고객 여정|사용자 흐름|경험 개선|편의성)/i.test(text)) value += 36;
  if (/(ai|artificial intelligence|llm|agent|chatgpt|claude|gemini|recommendation ai|ai 추천|인공지능|생성형 ai|에이전트|챗봇|개인화 ai)/i.test(text)) value += 28;
  if (/(beauty|cosmetic|skincare|olive young|hwahae|@cosme|amazon beauty|뷰티|화장품|스킨케어|올리브영|화해|앳코스메|온앤더뷰티)/i.test(text)) value += 22;
  if (/(app|mobile app|new feature|feature update|launched feature|앱|모바일 앱|신기능|새 기능|기능 추가|기능 업데이트)/i.test(text)) value += 14;
  if (/(fashion|style|brand|musinsa|29cm|kream|fulfillment|transaction|패션|스타일|브랜드|무신사|크림|온라인몰|쇼핑|풀필먼트|거래액|직매입|단독 기획|멤버스데이)/i.test(text)) value += 12;
  if (/(benefit|discount|coupon|promotion|partnership|card|reward|event|sale|혜택|할인|쿠폰|프로모션|제휴|카드|리워드|이벤트|세일|기획전)/i.test(text)) value -= 12;
  if (/(campaign|ambassador|lookbook|editorial|photo shoot|model|celebrity|collection visual|product launch|capsule|exclusive drop|캠페인|앰배서더|화보|룩북|모델|셀러브리티|비주얼|여름 캠페인|홀리데이 컬렉션|상품 출시|제품 출시|캡슐|단독 기획 발매|기획 발매)/i.test(text)) value -= 34;
  if (/(offline|store|popup|pop-up|flagship|festival|stadium|celebrate.+city|in mexico city|grand open|매장|오프라인|팝업|플래그십|페스티벌|랜드마크|홈 구장|브랜딩 룸|그랜드 오픈|상하이|항저우|성수)/i.test(text)) value -= 18;
  return value;
}

function servicePlatformInterest(text) {
  let value = 0;
  if (/(올리브영|화해|쿠팡|ssg\.com|ssg|롯데on|롯데온|당근마켓|당근|무신사|네이버 플러스 스토어|네이버플러스스토어|g마켓|gmarket)/i.test(text)) value += 52;
  if (/(rakuten|rakuten ichiba|amazon japan|yahoo! shopping|yahoo shopping|@cosme|cosme|zozotown|amazon beauty japan|라쿠텐|아마존 재팬|야후 쇼핑|앳코스메|조조타운|아마존 뷰티 재팬)/i.test(text)) value += 26;
  if (/(olive young|hwahae|coupang|daangn|musinsa|naver plus store|gmarket|oliveyoung)/i.test(text)) value += 52;
  if (/(benefit|discount|coupon|promotion|card|reward|event|sale|model|teaser|family day|campaign|ambassador|lookbook|editorial|photo shoot|celebrity|collection visual|product launch|capsule|exclusive drop|brand documentary|magazine b|acquisition|혜택|할인|쿠폰|프로모션|카드|리워드|이벤트|세일|기획전|모델|티저|패밀리 데이|캠페인|앰배서더|화보|룩북|셀러브리티|비주얼|여름 캠페인|홀리데이 컬렉션|상품 출시|제품 출시|캡슐|단독 기획 발매|기획 발매|브랜드 다큐멘터리|매거진 b|인수)/i.test(text)) value -= 80;
  if (/(offline|popup|pop-up|flagship|festival|stadium|grand open|오프라인|팝업|플래그십|페스티벌|홈 구장|브랜딩 룸|그랜드 오픈)/i.test(text)) value -= 24;
  if (/(spotify|openai|google|adobe)/i.test(text)) value -= 16;
  return value;
}

function clientCompanyInterest(text) {
  const clientPattern = /(ssg\.com|ssg|신세계|s\.i\.village|sivillage|시마을|신세계인터내셔날|g마켓|gmarket|auction|옥션|ebay|이베이|ebay japan|qoo10|큐텐|롯데on|롯데온|on and the beauty|온앤더뷰티|ssf shop|ssf샵|hazzys|헤지스|lf mall|lf몰|kolon mall|코오롱몰|boribori|보리보리|hiver|하이버|the cart golf|더카트골프|goodwear|굿웨어|samsung|삼성|lg전자|lg|lx z:in|lx하우시스|amorepacific|아모레퍼시픽|apmall|아리따움|aritaum|설화수|sulwhasoo|hera|헤라|primera|프리메라|laneige|라네즈|missha|미샤|beauty net|뷰티넷|hourglass|swiss perfection|kb증권)/i;
  if (!clientPattern.test(text)) return 0;

  const hasCriteria = /(online|app|web|platform|commerce|e-commerce|mall|store|ux|ui|renewal|redesign|service|digital|experience|beauty|fashion|brand|data|personal|recommend|온라인|앱|웹|플랫폼|커머스|이커머스|몰|스토어|사용자 경험|고객 경험|리뉴얼|개편|서비스|디지털|경험|뷰티|패션|브랜드|데이터|개인화|추천)/i.test(text);
  let value = hasCriteria ? 64 : 10;
  if (/(benefit|discount|coupon|promotion|card|reward|event|sale|model|teaser|family day|campaign|ambassador|lookbook|editorial|photo shoot|celebrity|collection visual|product launch|capsule|exclusive drop|혜택|할인|쿠폰|프로모션|카드|리워드|이벤트|세일|기획전|모델|티저|패밀리 데이|캠페인|앰배서더|화보|룩북|셀러브리티|비주얼|여름 캠페인|홀리데이 컬렉션|상품 출시|제품 출시|캡슐|단독 기획 발매|기획 발매)/i.test(text)) value -= 28;
  if (/(offline|popup|pop-up|flagship|festival|stadium|grand open|오프라인|팝업|플래그십|페스티벌|홈 구장|브랜딩 룸|그랜드 오픈)/i.test(text)) value -= 16;
  return value;
}

function designInterest(text) {
  let value = 0;
  if (/(prompt|prompting|prompt library|prompt template|prompt guide|prompt example|프롬프트|프롬프팅|프롬프트 템플릿|프롬프트 예시|프롬프트 가이드)/i.test(text)) value += 34;
  if (/(workflow|checklist|template|example|practical|hands-on|how to|guide|tutorial|playbook|use case|실무|적용|워크플로|체크리스트|템플릿|예시|가이드|튜토리얼|활용법)/i.test(text)) value += 24;
  if (/(component system|ui component|component library|design token|token|ui kit|pattern library|variant|component governance|컴포넌트 시스템|ui 컴포넌트|컴포넌트 라이브러리|디자인 토큰|토큰|ui 키트|패턴 라이브러리|베리언트|컴포넌트 운영)/i.test(text)) value += 30;
  if (/(design system|accessibility guideline|interaction pattern|toss design|toss design system|tds|디자인 시스템|접근성 가이드|인터랙션 패턴|토스 디자인|토스 디자인 시스템)/i.test(text)) value += 24;
  if (/(ai design|design ai|generative design|image generation|prototype|figma|framer|adobe|firefly|canva|midjourney|sora|veo|imagen|디자인 ai|ai 디자인|생성형 디자인|이미지 생성|프로토타입|프로토타이핑|피그마|어도비|파이어플라이|캔바)/i.test(text)) value += 18;
  if (/(easy|beginner|no-code|low-code|for designers|designer friendly|non developer|쉬운|입문|초보|노코드|로우코드|디자이너용|비개발자)/i.test(text)) value += 18;
  if (/(product design|product designer|design ops|design operations|case study|redesign|renewal|brand system|visual system|motion|microinteraction|프로덕트 디자인|프로덕트 디자이너|디자인 조직|디자인옵스|사례|리디자인|리뉴얼|브랜드 시스템|비주얼 시스템|모션|마이크로인터랙션)/i.test(text)) value += 10;
  if (/(mcp|model context protocol|server|database|backend|resource group|encryption|api|websocket|sdk|codex|claude code|plugin|settings|repository|github|developer|engineering|서버|데이터베이스|백엔드|암호|암호화|플러그인|설정|레포지토리|개발자|엔지니어링)/i.test(text)) value -= 34;
  if (/(conference|recordings|agenda|keynote|podcast|interview|컨퍼런스|녹화|아젠다|키노트|팟캐스트|인터뷰)/i.test(text)) value -= 18;
  return value;
}

function publisherInterest(text) {
  let value = 0;
  if (/(css|html|javascript|typescript|astro|web component|custom element|browser|chrome|safari|firefox|webkit|mdn|vite|vue|react|svelte|dom|form|accessibility|aria|wcag|layout|animation|font|container quer|media quer|anchor positioning|view transition|popover|dialog|canvas|svg|web api|performance|core web vital|lcp|cls|fcp)/i.test(text)) value += 18;
  if (/(css|html|javascript|astro|baseline|new in chrome|chrome \d+|safari technology preview|mdn blog|web platform|browser support|release notes|developer.chrome|web.dev|css-tricks)/i.test(text)) value += 18;
  if (/(how to|guide|tutorial|practical|fix|debug|implementation|example|snippet|checklist|best practice|update|release notes|shipping|build|use|바로|실무|적용|가이드|튜토리얼|수정|디버그|구현|예제|체크리스트|업데이트|릴리즈|사용법)/i.test(text)) value += 16;
  if (/(ai|llm|agent|agentic|mcp|claude code|codex|copilot|chatgpt|openai|gemini|browser-side scan|automation|workflow|vibe coding|ai coding|에이전트|코덱스|코파일럿|자동화|워크플로)/i.test(text)) value += 10;
  if (/(ai sdk|responses api|server api|backend|database|node api|rest api|graphql|sdk|백엔드|서버 api|데이터베이스)/i.test(text)) value -= 28;
  if (/(syntax\.fm|shoptalk|changelog|lawsuit|compliance|business owner|interview|podcast|opinion|strategy|ux nightmare|accessibility lawsuit|shopify store|showit|eaa|소송|컴플라이언스|인터뷰|팟캐스트|전략|담론)/i.test(text)) value -= 18;
  return value;
}

function score(article) {
  const text = `${article.source || ""} ${article.title || ""} ${article.content || ""}`.toLowerCase();
  let value = 0;
  value += roleTags(article).length * 20;
  if (article.scraped) value += 8;
  if (["ai", "design_system", "web_accessibility", "global_service_ux", "fashion", "ecommerce", "beauty"].includes(normalize(article.category))) value += 8;
  if (/(launch|release|공개|출시|오픈|업데이트|신설|개편|도입)/i.test(text)) value += 8;
  if (/(ux|ui|accessibility|a11y|wcag|css|html|javascript|performance|core web vital|figma|openai|gemini)/i.test(text)) value += 6;
  value += onlineServiceInterest(text);
  value += servicePlatformInterest(text);
  value += clientCompanyInterest(text);
  value += designInterest(text);
  value += publisherInterest(text);
  if (String(article.content || "").length > 800) value += 4;
  return value;
}

function uploadCandidates(articles) {
  const seen = new Set();
  return articles
    .filter(sendable)
    .filter((article) => {
      if (seen.has(article.link)) return false;
      seen.add(article.link);
      return true;
    })
    .map((article) => ({
      ...article,
      uploadScore: score(article),
      roleTags: roleTags(article),
      uploadStatus: "selected",
    }))
    .filter((article) => article.roleTags.length)
    .filter(isDesignerFriendlyArticle)
    .filter((article) => areaLabel(article) !== "Design" || article.uploadScore >= 80)
    .sort((a, b) => b.uploadScore - a.uploadScore || new Date(b.pubDate) - new Date(a.pubDate));
}

function selectUploadItems(candidates, limit) {
  const selected = [];
  const areaCounts = new Map();
  const categoryCounts = new Map();
  const domainCounts = new Map();
  const titleCounts = new Map();
  const skipped = [];
  const areaLimits = new Map([
    ["Service", Math.ceil(limit * 0.3)],
    ["Design", Math.ceil(limit * 0.35)],
    ["DEV", Math.ceil(limit * 0.35)],
  ]);

  function canPick(article, allowOverflow = false) {
    const area = areaLabel(article);
    const category = categoryLabel(article);
    const domain = linkDomain(article.link);
    const title = titleKey(article.title);
    if (domain && (domainCounts.get(domain) || 0) >= 2) return false;
    if (title && (titleCounts.get(title) || 0) >= 1) return false;
    if (!allowOverflow && (areaCounts.get(area) || 0) >= (areaLimits.get(area) || limit)) return false;
    if (area === "DEV" && category === "web_accessibility" && (categoryCounts.get("DEV:web_accessibility") || 0) >= 2) return false;
    if (area === "DEV" && ["Syntax.fm", "ShopTalk Show", "The Changelog"].includes(article.source)) return false;
    return true;
  }

  function pick(article) {
    const area = areaLabel(article);
    const category = categoryLabel(article);
    selected.push(article);
    areaCounts.set(area, (areaCounts.get(area) || 0) + 1);
    categoryCounts.set(`${area}:${category}`, (categoryCounts.get(`${area}:${category}`) || 0) + 1);
    const domain = linkDomain(article.link);
    if (domain) domainCounts.set(domain, (domainCounts.get(domain) || 0) + 1);
    const title = titleKey(article.title);
    if (title) titleCounts.set(title, (titleCounts.get(title) || 0) + 1);
  }

  for (const article of candidates) {
    if (!canPick(article)) {
      skipped.push(article);
      continue;
    }
    pick(article);
    if (selected.length >= limit) break;
  }

  for (const article of skipped) {
    if (selected.length >= limit) break;
    if (!canPick(article, true)) continue;
    pick(article);
  }

  const hasDevAi = selected.some(isDevAiHeadline);
  const devAiCandidate = candidates.find((article) => isDevAiHeadline(article) && !selected.includes(article));
  if (!hasDevAi && devAiCandidate) {
    const candidateDomain = linkDomain(devAiCandidate.link);
    const replaceIndex = [...selected]
      .map((article, index) => ({ article, index }))
      .filter(({ article }) => areaLabel(article) === "DEV" && !isDevAiArticle(article))
      .sort((a, b) => {
        const aSameDomain = linkDomain(a.article.link) === candidateDomain ? 0 : 1;
        const bSameDomain = linkDomain(b.article.link) === candidateDomain ? 0 : 1;
        return aSameDomain - bSameDomain || (a.article.uploadScore || 0) - (b.article.uploadScore || 0);
      })[0]?.index;
    if (replaceIndex !== undefined) selected.splice(replaceIndex, 1, devAiCandidate);
  }

  return selected;
}

function minimalArticle(article) {
  return {
    title: article.title,
    link: article.link,
    pubDate: isoDate(article.pubDate),
    source: article.source,
    audience: article.audience,
    area: normalize(article.area),
    category: categoryLabel(article),
    trackingStatus: article.trackingStatus || "candidate",
    publishStatus: article.publishStatus || "pending",
    sendTarget: article.sendTarget !== false,
    uploadStatus: article.uploadStatus || "candidate",
    roleTags: normalizedRoleTags(article),
    uploadScore: article.uploadScore || score(article),
    image: usableImageUrl(article.image || article.imageUrl || article.ogImage || "", article.link),
    summary: shortText(article.content || article.title, 220),
  };
}

function shortText(value = "", limit = 260) {
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
    .replace(/\s+/g, " ")
    .trim();
}

function hasKorean(value = "") {
  return /[가-힣]/.test(String(value || ""));
}

function englishTitlePatch(title = "") {
  const clean = cleanTitle(title);
  const rules = [
    [/release notes for safari technology preview\s*(\d+)/i, (_, version) => `Safari Technology Preview ${version} 릴리즈 노트`],
    [/font-family doesn't fall back/i, () => "font-family fallback 동작 정리"],
    [/enhancing astro with a markdown component/i, () => "Astro에서 Markdown 컴포넌트 활용하기"],
    [/create videos with html and javascript via hyperframes/i, () => "HTML과 JavaScript로 영상 제작하기: HyperFrames"],
    [/design systems.*everything you need to know/i, () => "AI 시대의 디자인 시스템 구축과 확장"],
    [/design system 102/i, () => "디자인 시스템 구축 기본 가이드"],
    [/your design system is not ready for ai agents/i, () => "AI 시대에 디자인 시스템을 점검하는 방법"],
    [/how spotify.*design system.*ai-ready/i, () => "Spotify 디자인 시스템의 AI 준비 사례"],
    [/how to streamline your design system workflow in figma/i, () => "Figma에서 디자인 시스템 워크플로 정리하기"],
    [/do not miss this in 2026.*ai design systems/i, () => "2026년에 디자이너가 봐야 할 AI 디자인 시스템 역량"],
    [/what i learned from design teams/i, () => "WhatsApp, Miro, Atlassian 디자인팀의 AI 활용 사례"],
    [/claude code designs for me in figma/i, () => "Claude Code로 Figma 디자인 만들기: MCP 없이 가능한 워크플로"],
    [/design systems and ai.*mcp servers/i, () => "디자인 시스템과 AI: MCP 서버가 연결고리가 되는 이유"],
    [/codex settings/i, () => "Codex 설정 정리"],
    [/plugins and skills/i, () => "플러그인과 스킬 활용 정리"],
    [/gemini app.*april.*gemini drop/i, () => "4월 Gemini Drop: Gemini 앱 신규 기능"],
    [/showit has two documents/i, () => "Showit의 데스크톱/모바일 분리 구조가 접근성 수정에 미치는 영향"],
    [/scaling agentic a11y with browser-side scans/i, () => "브라우저 스캔으로 agentic 접근성 점검 확장하기"],
    [/nintendo and spotify bring nostalgia/i, () => "Spotify, Nintendo 플레이리스트로 게임 음악 경험 확장"],
    [/spotify brings music and podcast recommendations to claude/i, () => "Spotify 추천 기능을 Claude 안으로 확장"],
    [/recreating apple.*vision pro animation in css/i, () => "CSS로 Apple Vision Pro 애니메이션 재현하기"],
    [/markdown.*astro/i, () => "Astro에서 Markdown 활용 방식 개선하기"],
    [/session timeouts.*accessibility barrier/i, () => "세션 타임아웃이 접근성에 만드는 장벽"],
    [/audit wcag.*pull request/i, () => "PR마다 WCAG 접근성 점검 자동화하기"],
    [/browser-side scans/i, () => "브라우저 기반 접근성 스캔 워크플로"],
    [/ux.*accessibility audit/i, () => "UX와 접근성 점검 자동화 도구"],
  ];

  for (const [pattern, replacer] of rules) {
    const match = clean.match(pattern);
    if (match) return replacer(...match);
  }
  return clean;
}

function localizedTitle(article) {
  const title = cleanDisplayText(article.title);
  if (!title) return "트렌드 업데이트";
  if (hasKorean(title)) return title;

  const patched = englishTitlePatch(title);
  if (patched && patched !== title) return patched;

  const area = areaLabel(article);
  const platform = notionPlatform(article);
  const category = categoryLabel(article);
  if (area === "DEV") return `${platform} 기술 업데이트: ${category}`;
  if (area === "Design") return `${platform} 디자인 업데이트: ${category}`;
  return `${platform} 서비스 업데이트: ${category}`;
}

function localizedSummary(article, title) {
  const raw = shortText(cleanDisplayText(article.content || article.title || ""), 360);
  if (hasKorean(raw)) return raw;

  const area = areaLabel(article);
  if (area === "DEV") {
    return `${title} 관련 기술 업데이트입니다. HTML, CSS, JavaScript 기반 컴포넌트 구현과 브라우저 호환성, 접근성, 성능 체크리스트에 반영할 만한 내용인지 확인합니다.`;
  }
  if (area === "Design") {
    return `${title} 관련 디자인 업데이트입니다. 디자인 시스템, AI 도구 활용, 프로토타이핑, 협업/핸드오프 방식에 어떤 영향을 주는지 확인합니다.`;
  }
  return `${title} 관련 서비스 업데이트입니다. 온라인 서비스의 사용자 흐름, 탐색 경험, 추천/개인화, 뷰티·패션 커머스 운영 관점에서 확인할 만한 변화인지 봅니다.`;
}

function localizedImpact(article) {
  const area = areaLabel(article);
  if (area === "DEV") return "웹퍼블리셔 관점에서 실제 화면 구현, 접근성, 성능, 브라우저 대응 범위에 줄 영향을 확인합니다.";
  if (area === "Design") return "웹디자인 관점에서 디자인 시스템, 컴포넌트 운영, AI 기반 제작 흐름에 줄 영향을 확인합니다.";
  return "웹기획자 관점에서 서비스 구조, 사용자 흐름, 카테고리 운영, 전환 경험에 줄 영향을 확인합니다.";
}

function beforeState(article) {
  const area = areaLabel(article);
  const category = categoryLabel(article);
  if (area === "DEV") {
    if (category === "web_accessibility") return "접근성 점검은 배포 이후 수동 확인이나 단일 페이지 스캔에 의존하는 경우가 많았습니다.";
    if (category === "css") return "CSS 변화는 브라우저 릴리즈 노트를 따로 확인하고 실제 프로젝트 적용 가능성을 개발자가 직접 판단해야 했습니다.";
    if (category === "html") return "마크업과 콘텐츠 구조 개선은 프레임워크 구현 뒤 별도 검수 항목으로 밀리는 경우가 많았습니다.";
    return "프론트엔드 구현과 검증은 원문, 브라우저 지원 범위, 프로젝트 코드 적용 가능성을 사람이 따로 연결해야 했습니다.";
  }
  if (area === "Design") {
    if (category === "design_system") return "디자인 시스템은 사람이 문서, 컴포넌트, 토큰, 예외 케이스를 직접 찾아 적용하는 운영 방식에 가까웠습니다.";
    return "AI 디자인 도구는 빠른 시안 생성이나 이미지 제작 도구로 이해되는 경우가 많았습니다.";
  }
  if (category === "beauty") return "뷰티 커머스에서는 상품 발견과 구매 이후 신뢰 요소가 화면 안에서 분리되어 보이는 경우가 많았습니다.";
  if (category === "fashion") return "패션 서비스에서는 브랜드, 상품, 콘텐츠를 사용자가 직접 탐색하고 비교해야 하는 흐름이 중심이었습니다.";
  return "온라인 서비스 변화는 기능, 혜택, 콘텐츠가 개별 공지로 흩어져 사용자 경험 관점에서 해석하기 어려웠습니다.";
}

function afterState(article, title) {
  const area = areaLabel(article);
  const category = categoryLabel(article);
  if (area === "DEV") {
    if (category === "web_accessibility") return "렌더링된 화면, 브라우저 동작, 보조기술 대응을 기준으로 실무 체크리스트에 바로 반영할 수 있는 신호가 늘었습니다.";
    if (category === "css") return "레이아웃, 폰트, 애니메이션, 브라우저 지원 범위를 실제 화면 구현 기준으로 다시 점검할 수 있습니다.";
    if (category === "html") return "콘텐츠 구조와 마크업을 컴포넌트 구현 단계에서 함께 검토해야 할 근거가 생겼습니다.";
    return "원문에서 확인한 변화가 컴포넌트 구현, QA, 접근성, 브라우저 호환성 기준으로 이어질 수 있습니다.";
  }
  if (area === "Design") {
    if (category === "design_system") return "AI 활용 흐름이 조직의 디자인 시스템, 컴포넌트 규칙, 핸드오프 방식과 직접 연결되는 방향으로 이동하고 있습니다.";
    return "디자인 산출물을 만드는 속도보다 팀의 기준, 검수, 전달 방식까지 포함해 도구를 판단해야 합니다.";
  }
  if (category === "beauty") return "사용자는 상품 정보뿐 아니라 배송, 교환, 추천, 카테고리 신뢰까지 함께 판단하는 흐름으로 이동합니다.";
  if (category === "fashion") return "브랜드 경험, 탐색 구조, 콘텐츠 맥락이 구매 판단을 돕는 서비스 장면으로 묶입니다.";
  return `${title}를 통해 사용자 경험, 탐색 구조, 추천/개인화, 운영 방식의 변화를 함께 확인할 수 있습니다.`;
}

function sourceBasis(article) {
  const source = article.source || "원문";
  return `후보 발견 및 최종 기준은 ${source} 원문과 출처 URL 기준으로 정리했습니다.`;
}

function insightQuote(article, title) {
  const area = areaLabel(article);
  if (area === "DEV") return `${title}은 단순 뉴스보다 실제 화면 구현과 QA 체크리스트에 반영할 수 있는지 보는 것이 중요합니다.`;
  if (area === "Design") return `${title}은 AI와 디자인 시스템을 결과물 생성이 아니라 팀의 작업 기준 변화로 읽어야 합니다.`;
  return `${title}은 기능 자체보다 사용자가 탐색, 판단, 구매를 덜 복잡하게 할 수 있는지로 봐야 합니다.`;
}

function whyNowText(article, title) {
  const area = areaLabel(article);
  if (area === "DEV") {
    return `${title}은 웹퍼블리싱 실무에서 브라우저 지원, 접근성, 성능, 컴포넌트 품질을 다시 확인하게 만드는 업데이트입니다. 특히 HTML, CSS, JavaScript 중심의 화면 구현 조직에서는 원문을 읽고 실제 프로젝트 체크리스트로 옮길 수 있는지가 중요합니다.`;
  }
  if (area === "Design") {
    return `${title}은 디자인 작업이 단발성 산출물 제작에서 디자인 시스템, AI 도구, 협업 규칙을 함께 다루는 방향으로 이동하고 있음을 보여줍니다. 지금 봐야 하는 이유는 예쁜 결과물보다 팀이 같은 기준으로 만들고 검수할 수 있는지가 더 중요해지고 있기 때문입니다.`;
  }
  return `${title}은 온라인 서비스의 사용자 경험을 기능 공지나 캠페인으로만 보지 말고, 사용자가 어떤 판단을 덜 해도 되는지 확인하게 만드는 신호입니다. 특히 국내 서비스, 뷰티·패션 커머스, 앱 기능 변화는 실제 화면 설계와 운영 기준으로 이어질 가능성이 큽니다.`;
}

function perspectiveText(article, title) {
  const area = areaLabel(article);
  if (area === "DEV") {
    return `${title}를 볼 때는 원문 내용이 현재 컴포넌트 구조, 접근성 속성, 브라우저 대응표, QA 시나리오 중 어디에 영향을 주는지 먼저 나눠야 합니다. 단순히 새 기술로 받아들이기보다 지금 코드에서 바로 확인할 수 있는 지점을 작게 잡는 것이 좋습니다.`;
  }
  if (area === "Design") {
    return `${title} 같은 흐름은 도구 도입보다 운영 기준이 먼저입니다. 디자인 의도, 브랜드 가이드, 컴포넌트 규칙, 승인 책임을 정하지 않으면 AI 도구는 빠른 초안 생성기에 머물 가능성이 큽니다.`;
  }
  return `${title}를 서비스 설계에 반영할 때는 화면에서 사용자의 판단 기준을 얼마나 줄여주는지 봐야 합니다. 카테고리, 추천, 검색, 상세 정보, CTA가 같은 맥락으로 이어질 때 변화가 실제 경험 개선으로 연결됩니다.`;
}

function lessWorkText(article, title) {
  const area = areaLabel(article);
  if (area === "DEV") {
    return `개발자는 ${title}의 내용을 원문 확인으로 끝내지 않고, 브라우저 지원표와 테스트 항목으로 옮기면 반복 확인을 줄일 수 있습니다.`;
  }
  if (area === "Design") {
    return "팀은 반복되는 시안 설명, 컴포넌트 규칙 검색, 핸드오프 설명을 일부 줄일 수 있습니다. 대신 AI가 만든 결과를 승인할 기준은 더 명확해야 합니다.";
  }
  return "사용자는 여러 화면을 오가며 정보를 직접 비교하거나 혜택, 조건, 신뢰 요소를 따로 계산하는 일을 줄일 수 있습니다.";
}

function checkQuestion(article) {
  const area = areaLabel(article);
  if (area === "DEV") return "이 업데이트를 우리 컴포넌트, 접근성 QA, 브라우저 테스트 기준 중 어디에 반영해야 하는가?";
  if (area === "Design") return "이 도구나 흐름을 도입할 때 디자인 의도, 브랜드 가이드, 컴포넌트 규칙, 최종 승인 책임은 누가 갖는가?";
  return "이 변화가 사용자에게 더 많은 선택지를 보여주는 데서 끝나는가, 아니면 실제 판단 부담을 줄여주는가?";
}

function relatedTechItems(article) {
  const category = categoryLabel(article);
  if (category === "css") {
    return [
      "CSS Baseline: 실제 사용 가능한 브라우저 지원 범위를 확인합니다.",
      "MDN Compatibility Data: 속성별 지원 차이를 QA 기준으로 옮깁니다.",
      "Visual Regression Test: 레이아웃과 폰트 변화가 화면에 미치는 영향을 확인합니다.",
    ];
  }
  if (category === "web_accessibility") {
    return [
      "ARIA Authoring Practices: 역할, 상태, 키보드 동작 기준을 확인합니다.",
      "axe-core: 자동 점검 가능한 접근성 오류를 먼저 걸러냅니다.",
      "Screen Reader QA: 자동 도구가 놓치는 포커스와 안내 문구를 확인합니다.",
    ];
  }
  return [
    "브라우저 릴리즈 노트: 실제 지원 시점과 변경 범위를 확인합니다.",
    "컴포넌트 테스트: 화면 단위 회귀를 작게 검증합니다.",
    "접근성 체크리스트: 키보드, 포커스, 라벨, 대체 텍스트를 함께 확인합니다.",
  ];
}

function notionPlatform(article) {
  const text = `${article.source || ""} ${article.title || ""} ${article.content || ""}`.toLowerCase();
  if (/무신사|musinsa|29cm/.test(text)) return "무신사";
  if (/올리브영|olive young|oliveyoung/.test(text)) return "올리브영";
  if (/g마켓|gmarket/.test(text)) return "G마켓";
  if (/화해|hwahae/.test(text)) return "화해";
  if (/@cosme|앳코스메/.test(text)) return "@cosme";
  if (/spotify/.test(text)) return "Spotify";
  if (/openai|codex/.test(text)) return "OpenAI";
  if (/webkit|safari/.test(text)) return "WebKit/Safari";
  if (/astro/.test(text)) return "Astro";
  return article.source || "CTTD";
}

function issueMarkdown(article, index) {
  const area = areaLabel(article);
  const summarySection = area === "DEV" ? "기술 변화 요약" : area === "Design" ? "디자인 변화 요약" : "서비스 변화 요약";
  const contextLabel = area === "DEV" ? "기술 맥락" : area === "Design" ? "디자인 맥락" : "서비스 맥락";
  const roleTags = normalizedRoleTags(article);
  const roleTagText = roleTags.join(" / ");
  const title = localizedTitle(article);
  const summary = localizedSummary(article, title);
  const image = usableImageUrl(article.image || article.imageUrl || article.ogImage || "", article.link);
  const imageCaption = image ? `${article.source || notionPlatform(article)} 공식 원문 이미지` : "";
  const detailExtra = area === "DEV"
    ? [
        "",
        "###### 구현 관점",
        "",
        perspectiveText(article, title),
        "",
        "###### 실무에 어떻게 적용할 수 있을까",
        "",
        "- 원문에서 언급한 변화가 실제 화면 구현, 접근성, 성능, QA 체크리스트에 영향을 주는지 확인합니다.",
        "- 관련 컴포넌트나 배포 플로우가 있다면 테스트 케이스와 문서에 반영합니다.",
        "- 브라우저/보조기술/프레임워크 버전 차이가 있는 내용은 공식 문서로 한 번 더 검증합니다.",
        "",
        "###### 같이 보면 좋은 기술",
        "",
        ...relatedTechItems(article).map((item) => `- ${item}`),
        "",
        "###### 점검 질문",
        "",
        checkQuestion(article),
      ]
    : [
        "",
        "###### 설계 관점",
        "",
        perspectiveText(article, title),
        "",
        "###### 사용자는 무엇을 덜 해도 될까",
        "",
        lessWorkText(article, title),
        "",
        "###### 점검 질문",
        "",
        checkQuestion(article),
      ];

  return [
    `#### ${String(index).padStart(2, "0")}. [${notionPlatform(article)}] ${title}`,
    "",
    `- 날짜: ${isoDate(article.pubDate)}`,
    "- 국가: GLOBAL",
    `- 직무 태그: ${roleTagText}`,
    `- 카테고리: ${categoryLabel(article)}`,
    `- 출처: ${article.source}`,
    `- 출처 URL: ${article.link}`,
    ...(image ? [`- 이미지: ${image}`, `- 이미지 설명: ${imageCaption}`] : []),
    "",
    `##### ${summarySection}`,
    "",
    `- 업데이트: ${title}`,
    `- ${contextLabel}: ${summary}`,
    `- 변경 전: ${beforeState(article)}`,
    `- 변경 후: ${afterState(article, title)}`,
    `- 원문 기준: ${sourceBasis(article)}`,
    `- 확인할 영향: ${localizedImpact(article)}`,
    "",
    "##### 매거진 인사이트",
    "",
    `> ${insightQuote(article, title)}`,
    "",
    "###### 왜 지금 볼만한가",
    "",
    whyNowText(article, title),
    ...detailExtra,
    "",
    "---",
    "",
  ].join("\n");
}

function reportMarkdown(selected, date) {
  const groups = new Map();
  for (const article of selected) {
    const area = areaLabel(article);
    const category = categoryLabel(article);
    const key = `${area}|||${category}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(article);
  }

  function averageScore(articles) {
    if (!articles.length) return 0;
    return articles.reduce((sum, article) => sum + (article.uploadScore || 0), 0) / articles.length;
  }

  const parts = [
    `# [${date}] Service/Design/DEV Weekly Trend Report`,
    "",
    `${date} 자료 수집 | tracking 기반 후보 선별 및 Notion 업로드`,
    "",
    "## 이번 주 요약",
    "",
    `- 업로드 대상: 전체 카테고리 합산 ${selected.length}개를 선별했습니다.`,
    "- 선별 기준: 웹서비스기획, 웹디자인, 웹DEV 담당자가 흥미로워할 변화와 꼭 알아야 할 실무 영향도를 우선했습니다.",
    "",
  ];

  let index = 1;
  for (const area of ["Service", "Design", "DEV"]) {
    const areaEntries = [...groups.entries()]
      .filter(([key]) => key.startsWith(`${area}|||`))
      .sort(([, aArticles], [, bArticles]) => averageScore(bArticles) - averageScore(aArticles));
    if (!areaEntries.length) continue;
    parts.push(`## ${area}`, "");

    if (area === "Service") {
      const serviceArticles = areaEntries.flatMap(([, articles]) => articles).sort((a, b) => (b.uploadScore || 0) - (a.uploadScore || 0));
      for (const article of serviceArticles) {
        parts.push(issueMarkdown(article, index));
        index += 1;
      }
      continue;
    }

    for (const [key, articles] of areaEntries) {
      parts.push(`### ${key.split("|||")[1]}`, "");
      for (const article of [...articles].sort((a, b) => (b.uploadScore || 0) - (a.uploadScore || 0))) {
        parts.push(issueMarkdown(article, index));
        index += 1;
      }
    }
  }

  return parts.join("\n");
}

async function writeOutputs(candidates, selected, date) {
  await fs.mkdir(candidatesDir, { recursive: true });
  await fs.mkdir(selectedDir, { recursive: true });
  await fs.mkdir(reportsDir, { recursive: true });

  const candidatesPath = path.join(candidatesDir, `${date}.json`);
  const selectedPath = path.join(selectedDir, `${date}.json`);
  const reportPath = path.join(reportsDir, `${date}-tracking-upload-report.md`);
  await fs.writeFile(candidatesPath, `${JSON.stringify(candidates.map(minimalArticle), null, 2)}\n`, "utf8");
  await fs.writeFile(selectedPath, `${JSON.stringify(selected.map(minimalArticle), null, 2)}\n`, "utf8");
  await fs.writeFile(reportPath, reportMarkdown(selected, date), "utf8");
  return { candidatesPath, selectedPath, reportPath };
}

async function uploadToNotion(reportPath, dryRun) {
  const args = ["scripts/push_notion.py", reportPath];
  if (dryRun) args.push("--dry-run");
  const candidates = await pythonCommands(args);

  let lastError;
  for (const [command, commandArgs] of candidates) {
    try {
      await run(command, commandArgs);
      return;
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

async function fillMissingImages(reportPath) {
  const args = ["scripts/fill_missing_images.py", reportPath];
  const candidates = await pythonCommands(args);

  let lastError;
  for (const [command, commandArgs] of candidates) {
    try {
      await run(command, commandArgs);
      return;
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

async function main() {
  const date = outputDate();
  const limit = Number.parseInt(argValue("--limit", String(maxDefault)), 10) || maxDefault;
  const dryRun = hasArg("--dry-run");
  const noUpload = hasArg("--no-upload");

  if (!hasArg("--no-fetch")) {
    await run(process.execPath, [path.join("scripts", "fetch_tracking_news.mjs")]);
  }

  const trackingPath = path.join(trackingDir, `${date}.json`);
  const articlesPath = await fs.stat(trackingPath).then(() => trackingPath).catch(() => latestJsonFile(trackingDir));
  const articles = JSON.parse(await fs.readFile(articlesPath, "utf8"));
  const candidates = uploadCandidates(articles);
  const selected = selectUploadItems(candidates, Math.min(limit, maxDefault));
  const { candidatesPath, selectedPath, reportPath } = await writeOutputs(candidates, selected, date);
  await fillMissingImages(reportPath);

  console.log(`Built ${candidates.length} candidates`);
  console.log(`Selected ${selected.length} upload candidates`);
  console.log(`CANDIDATES_FILE=${candidatesPath}`);
  console.log(`SELECTED_FILE=${selectedPath}`);
  console.log(`REPORT_FILE=${reportPath}`);

  if (!noUpload) {
    await uploadToNotion(reportPath, dryRun);
  }
}

main().catch((error) => {
  console.error("Failed to collect materials:", error.message);
  process.exit(1);
});
