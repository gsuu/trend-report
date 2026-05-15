// scripts/collect/store.mjs
// 주차별 파일 + manifest + report.json 갱신
// + Vue가 fetch하는 public/data/magazine.json, reports.json 동기화
// + 이미지 자동 fallback + service 카테고리 9슬러그 정규화
// + 같은 발행처×영역×카테고리 클러스터링 (2건 이상이면 묶음 카드로)

import fs from "node:fs/promises";
import path from "node:path";

const SITE_URL = process.env.MAIL_SITE_URL || "https://magazine.cttd.co.kr";

export function isoWeekSlug(date = new Date()) {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}

const SERVICE_CATEGORY_KEYS = ["platform", "fintech", "ecommerce", "fashion", "beauty", "book_content", "department_store", "ai", "etc"];
const SERVICE_CATEGORY_LABELS = {
  platform: "플랫폼", fintech: "핀테크", ecommerce: "이커머스",
  fashion: "패션", beauty: "뷰티", book_content: "도서·콘텐츠",
  department_store: "백화점", ai: "AI", etc: "기타",
};

function normalizeServiceCategory(issue) {
  if (issue.areaKey !== "service") return issue;
  const tags = (issue.tags || []).join(" ").toLowerCase();
  const platform = (issue.platform || "").toLowerCase();
  const haystack = `${platform} ${tags} ${(issue.takeawayHtml || "").toLowerCase()} ${(issue.deckHtml || "").toLowerCase()}`;

  let key = "etc";
  if (/패션|fashion|의류|무신사|29cm|w컨셉|지그재그|에이블리|자주|jaju|musinsa|wconcept|brandi|stylenanda|k-라이프스타일|k-패션/.test(haystack)) key = "fashion";
  else if (/뷰티|beauty|화장품|올리브영|cosmetic|skincare|메이크업/.test(haystack)) key = "beauty";
  else if (/백화점|department.?store|신세계백화점|롯데백화점|현대백화점|갤러리아/.test(haystack)) key = "department_store";
  else if (/토스(?!공)|카카오뱅크|카카오페이|네이버페이|삼성페이|핀테크|뱅킹|간편결제|\b결제\b|증권|보험사|fintech\b|\bbnpl\b/.test(haystack)) key = "fintech";
  else if (/넷플릭스|netflix|디즈니|disney|spotify|스포티파이|예스24|교보문고|알라딘|애플\s?뮤직|apple\s?music|webtoon|웹툰|팟캐스트|podcast|오디오북|audiobook|\b도서\b|book_content/.test(haystack)) key = "book_content";
  else if (/이커머스|ecommerce|쇼핑몰|쿠팡|컬리|오늘의집|배달의민족|배민|11번가|ssg|마켓컬리|라이브커머스|live[-\s]?commerce|live_commerce|\b배달\b|\b커머스\b|마켓플레이스|marketplace/.test(haystack)) key = "ecommerce";
  else if (/네이버|naver|카카오톡|kakao\s?talk|\bdaum\b|구글\s?검색|google\s?search|메신저|messenger|\bmessage\b|플랫폼|platform/.test(haystack)) key = "platform";
  else if (/ai\s?에이전트|\bagent\b|chatbot|챗봇|\bllm\b|\bgpt\b|claude|gemini|copilot|생성형\s?ai|ai\s?자동화/.test(haystack)) key = "ai";

  issue.categoryKey = key;
  issue.category = SERVICE_CATEGORY_LABELS[key];
  return issue;
}

export function enrichIssueForMagazine(issue, issueSlug) {
  normalizeServiceCategory(issue);
  const number = issue.number;
  const articleSlug = `${issueSlug}-${number}`;
  const route = `/articles/${articleSlug}`;
  const sourceType = inferSourceType(issue.sourceTitle);
  const image = ensureImage(issue);
  const platformDisplay = formatPlatform(issue);
  return {
    ...issue,
    platform: platformDisplay,
    originalPlatform: issue.platform,
    image,
    sourceType,
    sourceTypeLabel: SOURCE_TYPE_LABELS[sourceType] || "참고",
    publicationDate: issue.date,
    route,
    href: route,
    articleUrl: `${SITE_URL}${route}`,
    issueSlug,
    articleSlug,
    facts: buildFacts(issue),
    sections: (issue.sections || []).map(addItemsHtml),
  };
}

/**
 * 다루는 회사/주제(subject)를 컨텐츠에서 자동 감지
 * - 매체(NN/g, Smashing 등)가 자기 자료 발행 → subject = 매체 자체
 * - DIGITAL iNSIGHT가 ChatGPT 다룸 → subject = "openai"
 * - DIGITAL iNSIGHT가 네이버 다룸 → subject = "naver"
 */
function detectSubject(issue) {
  const text = `${issue.takeawayHtml || ""} ${issue.deckHtml || ""} ${(issue.tags || []).join(" ")}`.toLowerCase();
  const known = [
    ["naver",       /네이버|naver/],
    ["kakao",       /카카오톡|kakao\s?talk|카카오뱅크|카카오페이|kakao(?!\s?design)/],
    ["openai",      /chatgpt|openai|gpt[-\s]?[345]/],
    ["anthropic",   /claude|anthropic/],
    ["google",      /gemini|구글\s?(검색|클라우드)|google\s?(search|cloud)/],
    ["apple",       /vision\s?pro|apple\s?developer|webkit|safari|ios\s?\d+|아이폰/],
    ["microsoft",   /마이크로소프트|microsoft|copilot|github\s?copilot/],
    ["coupang",     /쿠팡|coupang/],
    ["kurly",       /컬리|kurly|마켓컬리/],
    ["ohouse",      /오늘의집|ohouse/],
    ["baemin",      /배달의민족|배민|baemin/],
    ["toss",        /토스|toss/],
    ["musinsa",     /무신사|musinsa/],
    ["29cm",        /29cm/],
    ["wconcept",    /w컨셉|wconcept/],
    ["zigzag",      /지그재그|zigzag/],
    ["ably",        /에이블리|a-?bly/],
    ["spotify",     /spotify|스포티파이/],
    ["dropbox",     /드롭박스|dropbox/],
    ["slack",       /slack|슬랙/],
    ["criteo",      /criteo/],
    ["jaju",        /자주|jaju/],
    ["shinsegae",   /신세계/],
    ["figma",       /figma|피그마/],
    ["adobe",       /adobe|어도비|photoshop|firefly/],
    ["squarespace", /squarespace/],
    ["astro",       /astro/],
    ["nngroup",     /nielsen\s?norman|nn\/g/],
    ["smashing",    /smashing\s?magazine/],
    ["css-tricks",  /css-?tricks/],
    ["webdev",      /web\.dev/],
    ["js-weekly",   /javascript\s?weekly/],
    ["devto",       /dev\.to/],
    ["opensurvey",  /오픈서베이|opensurvey/],
    ["eaa",         /european\s?accessibility\s?act|\beaa\b/],
    ["pnpm",        /pnpm/],
  ];
  for (const [domain, regex] of known) {
    if (regex.test(text)) return domain;
  }
  // fallback: 매체 자체가 주제 (가이드라인·기술글 등)
  return (issue.sourceTitle || issue.platform || "").toLowerCase().replace(/\s+/g, "-");
}

/**
 * 같은 (subject × areaKey × categoryKey) 그룹을 하나의 cluster 카드로 합침
 * - subject = 다루는 회사/주제 (예: 네이버, OpenAI, Anthropic). 발행처 X
 * - 브랜드 subject일 때만 클러스터링 (콘텐츠 플랫폼은 묶지 않음)
 * - 1건이면 그대로 유지
 * - 2건 이상이면 isCluster=true 인 메타 카드 생성
 */
const SUBJECT_LABELS = {
  naver: "네이버", kakao: "카카오", openai: "OpenAI", anthropic: "Anthropic",
  google: "Google", apple: "Apple", microsoft: "Microsoft",
  coupang: "쿠팡", kurly: "컬리", ohouse: "오늘의집", baemin: "배달의민족",
  toss: "토스", musinsa: "무신사", "29cm": "29CM", wconcept: "W컨셉",
  zigzag: "지그재그", ably: "에이블리", spotify: "Spotify", dropbox: "Dropbox",
  slack: "Slack", criteo: "Criteo", jaju: "자주(JAJU)", shinsegae: "신세계",
  figma: "Figma", adobe: "Adobe", squarespace: "Squarespace", astro: "Astro",
  nngroup: "NN/g", smashing: "Smashing Magazine", "css-tricks": "CSS-Tricks",
  webdev: "web.dev", "js-weekly": "JavaScript Weekly", devto: "Dev.to",
  opensurvey: "오픈서베이", eaa: "European Accessibility Act", pnpm: "pnpm",
};

// 클러스터링 제외 subject — 다양한 주제를 다루는 콘텐츠 플랫폼/미디어
// (각 아티클이 서로 다른 이야기이므로 묶지 않음)
const NO_CLUSTER_SUBJECTS = new Set([
  "devto", "smashing", "css-tricks", "webdev", "js-weekly",
  "nngroup", "eaa", "pnpm", "opensurvey",
]);

function clusterIssuesForMagazine(enriched) {
  const groups = new Map();
  for (const i of enriched) {
    const subject = detectSubject(i);
    i._clusterSubject = subject;  // 디버그용
    // 콘텐츠 플랫폼 subject는 클러스터링하지 않음 — 각자 별도 카드 유지
    if (NO_CLUSTER_SUBJECTS.has(subject)) {
      groups.set(`__no_cluster__${i.id}`, [i]);
      continue;
    }
    const key = `${subject}__${i.areaKey || ""}__${i.categoryKey || ""}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(i);
  }

  const result = [];
  for (const [key, members] of groups.entries()) {
    if (members.length === 1) {
      result.push(members[0]);
    } else {
      result.push(buildClusterCard(members, key));
    }
  }

  // number 재할당 (영역별 정렬 유지)
  const order = { design: 1, service: 2, dev: 3 };
  result.sort((a, b) => (order[a.areaKey] || 9) - (order[b.areaKey] || 9));
  result.forEach((it, idx) => {
    const n = String(idx + 1).padStart(2, "0");
    it.number = n;
    if (!it.isCluster) {
      it.route = `/articles/${it.issueSlug}-${n}`;
      it.href = it.route;
      it.articleSlug = `${it.issueSlug}-${n}`;
      it.articleUrl = `${SITE_URL}${it.route}`;
    } else {
      it.route = `/cluster/${it.issueSlug}-${n}`;
      it.href = it.route;
      it.articleSlug = `cluster-${it.issueSlug}-${n}`;
      it.articleUrl = `${SITE_URL}${it.route}`;
    }
  });
  return result;
}

function buildClusterCard(members, key) {
  const first = members[0];
  const sourceTitle = first.sourceTitle;
  const platform = first.platform;
  const areaKey = first.areaKey;
  const area = first.area;
  const categoryKey = first.categoryKey;
  const category = first.category;
  const issueSlug = first.issueSlug;
  const date = first.date;

  // 이미지: 멤버 중 실제 OG 이미지가 있으면 우선, 없으면 첫 멤버 picsum
  const realImage = members.find((m) => m.image && !m.image.includes("picsum"))?.image;
  const image = realImage || first.image;

  // 태그 머지 (중복 제거, 최대 8개)
  const tagSet = new Set();
  for (const m of members) for (const t of m.tags || []) tagSet.add(t);
  const tags = [...tagSet].slice(0, 8);

  // takeaway: subject 기반 - "네이버, 헤드라인1 / 헤드라인2 외 N건의 뉴스가 있어요"
  const cnt = members.length;
  const subject = first._clusterSubject || "";
  const subjectLabel = SUBJECT_LABELS[subject] || sourceTitle;
  const headlineSummary = members
    .slice(0, 2)
    .map((m) => stripTags(m.takeawayHtml))
    .join(" / ");
  const takeawayHtml = `${subjectLabel}, ${headlineSummary} 외 ${cnt}건의 뉴스가 있어요`;

  // deck: 멤버 핵심 내용을 자연스러운 문장으로 연결
  const memberSummaries = members.map((m) => stripTags(m.deckHtml || m.takeawayHtml)).join(" ");
  const deckHtml = memberSummaries;

  // sections: 멤버별로 작은 섹션 (제목 = 멤버 takeaway)
  const sections = members.map((m, idx) => ({
    title: `${idx + 1}편 — ${stripTags(m.takeawayHtml).slice(0, 30)}`,
    className: "article-section is-cluster-member",
    prose: false,
    blocks: [
      { kind: "list", html: stripTags(m.deckHtml).slice(0, 280) },
      { kind: "list", html: `원문: <a href="${m.sourceUrl}" target="_blank" rel="noopener">${m.sourceUrl}</a>` },
    ],
    itemsHtml: [stripTags(m.deckHtml).slice(0, 280), `원문: ${m.sourceUrl}`],
  }));

  // facts
  const facts = [
    { label: "발행처", valueHtml: sourceTitle },
    { label: "묶음", valueHtml: `${cnt}편` },
    { label: "발행날짜", valueHtml: date },
    { label: "카테고리", valueHtml: category || "" },
  ];

  return {
    id: `cluster-${(first._clusterSubject || sourceTitle.replace(/\s+/g, "-")).toLowerCase()}-${categoryKey}`,
    isCluster: true,
    clusterCount: cnt,
    clusterMembers: members.map((m) => ({
      id: m.id,
      number: m.number,
      takeawayHtml: m.takeawayHtml,
      deckHtml: m.deckHtml,
      route: m.route,
      image: m.image,
      sourceUrl: m.sourceUrl,
      sourceTitle: m.sourceTitle,
      tags: m.tags,
    })),
    platform,
    originalPlatform: sourceTitle,
    areaKey,
    area,
    categoryKey,
    category,
    date,
    publicationDate: date,
    image,
    imageCaption: `${subjectLabel} ${cnt}편 모음`,
    tags,
    takeawayHtml,
    deckHtml,
    sourceTitle,
    sourceUrl: members[0].sourceUrl,
    sourceType: first.sourceType,
    sourceTypeLabel: first.sourceTypeLabel,
    issueSlug,
    referenceLinks: [],
    facts,
    sections,
  };
}

function stripTags(s = "") {
  return String(s).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function formatPlatform(issue) {
  const src = (issue.sourceTitle || "").trim();
  return src || (issue.platform || "").trim();
}

const SOURCE_TYPE_LABELS = { official: "공식", reference: "레퍼런스/쇼케이스", newsletter: "뉴스레터" };

function inferSourceType(sourceTitle = "") {
  const s = sourceTitle.toLowerCase();
  if (/뉴스룸|newsroom|spotify|opensurvey|navercorp|figma|adobe|web\.dev|webflow/.test(s)) return "official";
  if (/weekly|focus/.test(s)) return "newsletter";
  return "reference";
}

function buildFacts(issue) {
  const facts = [];
  if (issue.sourceTitle) facts.push({ label: "발행처", valueHtml: issue.sourceTitle });
  if (issue.platform && issue.platform !== issue.sourceTitle) facts.push({ label: "다루는 대상", valueHtml: issue.platform });
  if (issue.date) facts.push({ label: "발행날짜", valueHtml: issue.date });
  if (issue.tags?.length) facts.push({ label: "태그", valueHtml: issue.tags.join(" / ") });
  if (issue.category) facts.push({ label: "카테고리", valueHtml: issue.category });
  return facts;
}

function addItemsHtml(section) {
  return { ...section, itemsHtml: (section.blocks || []).filter((b) => b.kind === "list" && b.html).map((b) => b.html) };
}

function ensureImage(issue) {
  if (issue.image && /^https?:\/\//i.test(issue.image)) return issue.image;
  const seed = encodeURIComponent(`${issue.id || issue.areaKey || "magazine"}-${issue.number || ""}`);
  return `https://picsum.photos/seed/${seed}/1200/630`;
}

export async function persistWeekly(weekly, dataDir, publicDir = null) {
  await fs.mkdir(path.join(dataDir, "weekly"), { recursive: true });
  // 원본 issues는 그대로 유지 (개별 deep-link용)
  await fs.writeFile(path.join(dataDir, "weekly", `${weekly.slug}.json`), JSON.stringify(weekly, null, 2), "utf8");

  const manifestPath = path.join(dataDir, "manifest.json");
  let manifest;
  try { manifest = JSON.parse(await fs.readFile(manifestPath, "utf8")); }
  catch { manifest = { generatedAt: "", weeks: [] }; }
  const entry = { slug: weekly.slug, weekLabel: weekly.weekLabel, publishedAt: weekly.publishedAt, issueCount: weekly.issues.length };
  const others = (manifest.weeks ?? []).filter((w) => w.slug !== weekly.slug);
  manifest.weeks = [entry, ...others].sort((a, b) => b.slug.localeCompare(a.slug));
  manifest.generatedAt = new Date().toISOString();
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), "utf8");

  const latestSlug = manifest.weeks[0].slug;
  if (latestSlug === weekly.slug) {
    await fs.writeFile(path.join(dataDir, "report.json"), JSON.stringify(weekly, null, 2), "utf8");
  }

  if (publicDir && latestSlug === weekly.slug) {
    await fs.mkdir(publicDir, { recursive: true });
    const issueSlug = weekly.publishedAt;
    const enrichedIssues = weekly.issues.map((i) => enrichIssueForMagazine(i, issueSlug));
    // ★ 클러스터링 적용
    const clusteredIssues = clusterIssuesForMagazine(enrichedIssues);
    const magazine = {
      generatedAt: new Date().toISOString(),
      report: { title: weekly.title, description: weekly.description, slug: issueSlug, issues: clusteredIssues, issueSlugs: [issueSlug] },
    };
    await fs.writeFile(path.join(publicDir, "magazine.json"), JSON.stringify(magazine, null, 2), "utf8");

    let reports;
    try { reports = JSON.parse(await fs.readFile(path.join(publicDir, "reports.json"), "utf8")); }
    catch { reports = { reports: [] }; }
    if (!Array.isArray(reports.reports)) reports.reports = [];
    const others2 = reports.reports.filter((r) => r.slug !== weekly.slug);
    reports.reports = [
      { slug: weekly.slug, title: weekly.title, weekLabel: weekly.weekLabel, publishedAt: weekly.publishedAt, issueCount: clusteredIssues.length },
      ...others2,
    ].sort((a, b) => b.slug.localeCompare(a.slug));
    reports.generatedAt = new Date().toISOString();
    await fs.writeFile(path.join(publicDir, "reports.json"), JSON.stringify(reports, null, 2), "utf8");
  }
}
    try { reports = JSON.parse(await fs.readFile(path.join(publicDir, "reports.json"), "utf8")); }
    catch { reports = { reports: [] }; }
    if (!Array.isArray(reports.reports)) reports.reports = [];
    const others2 = reports.reports.filter((r) => r.slug !== weekly.slug);
    reports.reports = [
      { slug: weekly.slug, title: weekly.title, weekLabel: weekly.weekLabel, publishedAt: weekly.publishedAt, issueCount: clusteredIssues.length },
      ...others2,
    ].sort((a, b) => b.slug.localeCompare(a.slug));
    reports.generatedAt = new Date().toISOString();
    await fs.writeFile(path.join(publicDir, "reports.json"), JSON.stringify(reports, null, 2), "utf8");
  }
}
