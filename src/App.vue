<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import fallbackReport from "./data/report.example.json";

const basePath = detectBasePath();
const route = ref(currentRoute());
const report = ref(fallbackReport);
const magazineLoading = ref(!hasMagazineIssues(report.value));
const showCurrentWeekOnly = ref(initialCurrentWeekFilter());
const listViewMode = ref(initialListViewMode());
const listRoute = ref(validListRoute(route.value) ? route.value : "/");
const shareStatus = ref("");
const viewportWidth = ref(typeof window === "undefined" ? 1440 : window.innerWidth);
const isSubscribeOpen = ref(false);
const subscribeEmail = ref("");
const subscribeAudiences = ref(["Service"]);
const subscribeStatus = ref("idle");
const subscribeMessage = ref("");
const visitedKey = "cttd-magazine-visited";
const visitedArticles = ref(loadVisitedArticles());

function loadVisitedArticles() {
  try {
    const raw = window.localStorage?.getItem(visitedKey);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

function persistVisitedArticles() {
  try {
    window.localStorage?.setItem(visitedKey, JSON.stringify([...visitedArticles.value]));
  } catch {
    // ignore quota or privacy-mode errors
  }
}

function articleVisitId(issue) {
  return issue?.id || issue?.route || issue?.number || "";
}

function markIssueVisited(issue) {
  const id = articleVisitId(issue);
  if (!id || visitedArticles.value.has(id)) return;
  visitedArticles.value = new Set([...visitedArticles.value, id]);
  persistVisitedArticles();
}

function isIssueVisited(issue) {
  const id = articleVisitId(issue);
  return id ? visitedArticles.value.has(id) : false;
}

function detectBasePath() {
  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  if (path === "/magazine" || path.startsWith("/magazine/")) return "/magazine";
  return "";
}

function stripBasePath(pathname) {
  if (basePath && (pathname === basePath || pathname.startsWith(`${basePath}/`))) {
    return pathname.slice(basePath.length) || "/";
  }
  return pathname || "/";
}

function currentRoute() {
  return `${stripBasePath(window.location.pathname)}${window.location.search || ""}` || "/";
}

function hasMagazineIssues(value) {
  return Array.isArray(value?.issues) && value.issues.length > 0;
}

function routePath(value) {
  return String(value || "").split("?")[0] || "/";
}

function routeSearchParams(value) {
  const query = String(value || "").split("?")[1] || "";
  return new URLSearchParams(query);
}

function hasCurrentWeekFilter(value) {
  return routeSearchParams(value).get("week") === "1";
}

function initialCurrentWeekFilter() {
  return hasCurrentWeekFilter(routeReturnParam() || route.value);
}

function routeListViewMode(value) {
  return routeSearchParams(value).get("view") === "list" ? "list" : "gallery";
}

function initialListViewMode() {
  return routeListViewMode(routeReturnParam() || route.value);
}

function homePath() {
  return basePath || "/";
}

function withBasePath(path) {
  if (!path || path === "/") return homePath();
  return `${basePath}${path}`;
}

function withListFilter(path, enabled = showCurrentWeekOnly.value) {
  const params = new URLSearchParams();
  if (enabled) params.set("week", "1");
  if (listViewMode.value === "list") params.set("view", "list");
  const query = params.toString();
  return query ? `${path}?${query}` : path;
}

function syncRoute() {
  route.value = currentRoute();
  const returnRoute = routeReturnParam();
  showCurrentWeekOnly.value = hasCurrentWeekFilter(returnRoute || route.value);
  if (validListRoute(route.value)) {
    listRoute.value = route.value;
    listViewMode.value = routeListViewMode(route.value);
  } else if (returnRoute) {
    listRoute.value = returnRoute;
    listViewMode.value = routeListViewMode(returnRoute);
  }
  syncDocumentState();
  window.scrollTo({ top: 0, left: 0, behavior: "instant" });
}

function syncDocumentState() {
  document.body.classList.toggle("is-story-open", Boolean(activeIssue.value));
}

function syncViewportWidth() {
  viewportWidth.value = window.innerWidth;
}

function placeGlossaryTooltip(term) {
  const tooltip = term.querySelector(":scope > .glossary-tooltip");
  if (!tooltip) return;
  if (tooltip.parentElement !== document.body) {
    tooltip.dataset.glossaryHost = term.dataset.glossaryId || (term.dataset.glossaryId = String(Math.random()).slice(2));
    document.body.appendChild(tooltip);
  }
  tooltip.style.position = "fixed";
  tooltip.style.left = "0";
  tooltip.style.top = "0";
  tooltip.style.right = "auto";
  tooltip.style.bottom = "auto";
  tooltip.style.transform = "none";
  tooltip.style.maxWidth = "min(320px, calc(100vw - 16px))";
  tooltip.style.visibility = "visible";
  tooltip.style.opacity = "1";
  const termRect = term.getBoundingClientRect();
  const tipRect = tooltip.getBoundingClientRect();
  const margin = 8;
  let left = termRect.left + termRect.width / 2 - tipRect.width / 2;
  left = Math.max(margin, Math.min(window.innerWidth - tipRect.width - margin, left));
  let top = termRect.top - tipRect.height - 10;
  let placeBelow = false;
  if (top < margin) {
    top = termRect.bottom + 10;
    placeBelow = true;
  }
  tooltip.style.left = `${Math.round(left)}px`;
  tooltip.style.top = `${Math.round(top)}px`;
  tooltip.dataset.placement = placeBelow ? "below" : "above";
  tooltip.style.setProperty("--glossary-arrow-offset", `${Math.round(termRect.left + termRect.width / 2 - left)}px`);
}

function clearGlossaryTooltip(term) {
  const hostId = term.dataset.glossaryId;
  let tooltip = term.querySelector(":scope > .glossary-tooltip");
  if (!tooltip && hostId) {
    tooltip = document.querySelector(`.glossary-tooltip[data-glossary-host="${hostId}"]`);
  }
  if (!tooltip) return;
  tooltip.style.position = "";
  tooltip.style.left = "";
  tooltip.style.top = "";
  tooltip.style.right = "";
  tooltip.style.bottom = "";
  tooltip.style.transform = "";
  tooltip.style.maxWidth = "";
  tooltip.style.visibility = "";
  tooltip.style.opacity = "";
  delete tooltip.dataset.placement;
  tooltip.style.removeProperty("--glossary-arrow-offset");
  if (tooltip.parentElement === document.body) {
    delete tooltip.dataset.glossaryHost;
    term.appendChild(tooltip);
  }
}

function onGlossaryEnter(event) {
  const term = event.target?.closest?.(".glossary-term");
  if (!term) return;
  placeGlossaryTooltip(term);
}

function onGlossaryLeave(event) {
  const term = event.target?.closest?.(".glossary-term");
  if (!term) return;
  if (event.relatedTarget && term.contains(event.relatedTarget)) return;
  clearGlossaryTooltip(term);
}

const isSignalsPage = computed(() => {
  const path = (route.value.split("?")[0] || "").replace(/\/$/, "");
  return path.endsWith("/signals") || path === "/signals";
});

onMounted(() => {
  loadMagazineReport();
  loadSignalsData();
  syncDocumentState();
  watch(activeIssue, (issue) => {
    document.body.querySelectorAll(":scope > .glossary-tooltip[data-glossary-host]").forEach((tooltip) => tooltip.remove());
    if (issue) markIssueVisited(issue);
  }, { immediate: true });
  window.addEventListener("popstate", syncRoute);
  window.addEventListener("resize", syncViewportWidth);
  document.addEventListener("mouseover", onGlossaryEnter);
  document.addEventListener("focusin", onGlossaryEnter);
  document.addEventListener("mouseout", onGlossaryLeave);
  document.addEventListener("focusout", onGlossaryLeave);
});
onBeforeUnmount(() => {
  document.body.classList.remove("is-story-open");
  document.body.classList.remove("is-subscribe-open");
  window.removeEventListener("popstate", syncRoute);
  window.removeEventListener("resize", syncViewportWidth);
  document.removeEventListener("mouseover", onGlossaryEnter);
  document.removeEventListener("focusin", onGlossaryEnter);
  document.removeEventListener("mouseout", onGlossaryLeave);
  document.removeEventListener("focusout", onGlossaryLeave);
});

async function loadMagazineReport() {
  await loadStaticMagazineReport();
  if (!issues.value.length) report.value = fallbackReport;
  magazineLoading.value = false;
}

async function loadStaticMagazineReport() {
  try {
    const response = await fetch(withBasePath("/data/magazine.json"), {
      headers: { Accept: "application/json" },
      cache: "no-cache",
    });
    if (!response.ok) return;

    const data = await response.json();
    const nextReport = data.report || data;
    if (!Array.isArray(nextReport?.issues)) return;

    report.value = nextReport;
    magazineLoading.value = false;
  } catch {
    // Static JSON is the source of truth. The bundled fallback keeps the page usable.
  }
}

const signalsData = ref(null);

async function loadSignalsData() {
  if (signalsData.value) return;
  try {
    const response = await fetch(withBasePath("/data/signals.json"), {
      headers: { Accept: "application/json" },
      cache: "no-cache",
    });
    if (!response.ok) return;
    signalsData.value = await response.json();
  } catch {
    // Signals data is optional.
  }
}

function isWeeklySummaryIssue(issue) {
  if (!issue) return false;
  if (issue.number === "00") return true;
  if (issue.platform === "CTTD 매거진 편집부") return true;
  return false;
}

const issues = computed(() => report.value.issues || []);
const listIssues = computed(() => issues.value.filter((issue) => !isWeeklySummaryIssue(issue)));
const recentWeekRange = computed(() => recentDaysRange(7));
const filteredIssues = computed(() => {
  if (!showCurrentWeekOnly.value || !recentWeekRange.value) return listIssues.value;
  return listIssues.value.filter((issue) => isDateInRange(issuePublicationDate(issue), recentWeekRange.value));
});
const activeIssue = computed(() => {
  const path = routePath(route.value);
  const exactMatch = issues.value.find((issue) => issue.route === path || issue.href === path);
  if (exactMatch) return exactMatch;

  const datedMatch = path.match(/^\/articles\/([^/]+)\/([^/]+)$/);
  if (datedMatch) {
    return issues.value.find((issue) => issue.issueSlug === datedMatch[1] && issue.number === datedMatch[2]) || null;
  }

  const match = path.match(/^\/articles\/([^/?]+)/);
  if (!match) return null;
  const articleSlug = decodeURIComponent(match[1]);
  const slugMatch = articleSlug.match(/^(\d{4}-\d{2}-\d{2})-(\d{2,})$/);
  if (slugMatch) {
    return issues.value.find((issue) => issue.issueSlug === slugMatch[1] && issue.number === slugMatch[2]) || null;
  }
  return issues.value.find((issue) => issue.number === articleSlug || issue.articleSlug === articleSlug || issue.id === articleSlug) || null;
});

const primaryHeroImage = computed(() => {
  const issue = activeIssue.value;
  if (!issue) return null;
  if (Array.isArray(issue.images) && issue.images.length > 0) {
    return issue.images[0];
  }
  if (issue.image) {
    return { url: issue.image, caption: issue.imageCaption || "" };
  }
  return null;
});

const sameBrandIssues = computed(() => {
  const issue = activeIssue.value;
  if (!issue?.brandNormalized) return [];
  return issues.value
    .filter((other) => other.id !== issue.id && other.brandNormalized === issue.brandNormalized)
    .slice(0, 3);
});

const sameFlowIssues = computed(() => {
  const issue = activeIssue.value;
  if (!issue?.flow?.length) return [];
  const issueFlows = new Set(issue.flow);
  return issues.value
    .filter((other) => {
      if (other.id === issue.id) return false;
      if (!Array.isArray(other.flow)) return false;
      return other.flow.some((flow) => issueFlows.has(flow));
    })
    .slice(0, 5);
});

const showArticleSidebar = computed(() => Boolean(
  activeIssue.value?.meetingQuestion
  || sameBrandIssues.value.length
  || sameFlowIssues.value.length
));

const articleSections = computed(() => {
  const issue = activeIssue.value;
  if (!issue || !Array.isArray(issue.sections)) return [];
  const termSection = issue.sections.find((section) => isTermExplanation(section));
  const glossary = buildGlossary(termSection);
  const used = new Set();
  return issue.sections
    .filter((section) => !isTermExplanation(section))
    .map((section) => {
      if (!glossary.length) return section;
      const next = { ...section };
      if (section.prose) {
        next.blocks = (section.blocks || []).map((block) => {
          if (typeof block.html === "string") {
            return { ...block, html: applyGlossaryToHtml(block.html, glossary, used) };
          }
          return { ...block };
        });
      } else {
        next.itemsHtml = (section.itemsHtml || []).map((item) => applyGlossaryToHtml(item, glossary, used));
      }
      return next;
    });
});

const activeCategoryKey = computed(() => {
  const sourceRoute = activeIssue.value ? detailReturnRoute.value : route.value;
  const match = sourceRoute.match(/^\/category\/([^/?]+)/);
  if (match) return decodeURIComponent(match[1]);
  return "";
});

const activeSubcategory = computed(() => {
  const sourceRoute = activeIssue.value ? detailReturnRoute.value : route.value;
  const match = sourceRoute.match(/^\/category\/[^/]+\/([^/?]+)/);
  return match ? decodeURIComponent(match[1]) : "";
});

const AREA_JOB_LABELS = {
  service: { role: "기획자", roleEn: "PM", subscribeHint: "이커머스 기획·서비스" },
  design: { role: "디자이너", roleEn: "Designer", subscribeHint: "UIUX 비주얼·브랜드" },
  dev: { role: "퍼블리셔", roleEn: "Publisher", subscribeHint: "마크업·CSS·인터랙션·정적 빌드" },
};

function areaJobLabel(key) {
  return AREA_JOB_LABELS[key] || null;
}

const categories = computed(() => {
  const categoryMap = new Map();
  for (const issue of issues.value) {
    const key = issue.areaKey || issue.area || "uncategorized";
    if (!categoryMap.has(key)) {
      categoryMap.set(key, {
        key,
        label: issue.area || "분류 없음",
        jobLabel: AREA_JOB_LABELS[key]?.role || "",
        jobLabelEn: AREA_JOB_LABELS[key]?.roleEn || "",
        count: 0,
      });
    }
  }
  for (const issue of filteredIssues.value) {
    const key = issue.areaKey || issue.area || "uncategorized";
    if (categoryMap.has(key)) {
      categoryMap.get(key).count += 1;
    }
  }
  const order = { service: 0, design: 1, dev: 2 };
  return [...categoryMap.values()].sort((a, b) => (order[a.key] ?? 99) - (order[b.key] ?? 99));
});

const activeCategory = computed(() => categories.value.find((category) => category.key === activeCategoryKey.value));
const categoryIssues = computed(() => activeCategoryKey.value
  ? filteredIssues.value.filter((issue) => issue.areaKey === activeCategoryKey.value)
  : filteredIssues.value);

const subcategories = computed(() => {
  const counts = new Map();
  const serviceOrder = { platform: 0, fintech: 1, ecommerce: 2, fashion: 3, beauty: 4, book_content: 5, department_store: 6, ai: 7, service: 8 };
  const serviceLabels = { platform: "platform", fintech: "fintech", ecommerce: "ecommerce", fashion: "fashion", beauty: "beauty", book_content: "book", department_store: "department", ai: "AI", service: "service" };
  const designOrder = { ai: 0, global: 1 };
  const designLabels = { ai: "AI", global: "global" };
  if (activeCategoryKey.value === "service") {
    for (const [key, order] of Object.entries(serviceOrder)) {
      counts.set(key, {
        key,
        order,
        label: serviceLabels[key] || key,
        count: 0,
      });
    }
  }
  if (activeCategoryKey.value === "design") {
    for (const [key, order] of Object.entries(designOrder)) {
      counts.set(key, {
        key,
        order,
        label: designLabels[key] || key,
        count: 0,
      });
    }
  }
  for (const issue of categoryIssues.value) {
    const key = issue.categoryKey || "other";
    counts.set(key, {
      key,
      order: counts.get(key)?.order ?? 99,
      label: counts.get(key)?.label || issue.category || key,
      count: (counts.get(key)?.count || 0) + 1,
    });
  }
  return [...counts.values()].sort((a, b) => a.order - b.order);
});

const isExploreOpen = ref(false);
const exploreBrand = ref("");
const exploreFlow = ref("");
const exploreChangeType = ref("");

const baseCategoryIssues = computed(() => {
  if (!activeCategory.value) return filteredIssues.value;
  if (!activeSubcategory.value) return categoryIssues.value;
  return categoryIssues.value.filter((issue) => issue.categoryKey === activeSubcategory.value);
});

const availableBrands = computed(() => {
  const counts = new Map();
  for (const issue of baseCategoryIssues.value) {
    const brand = (issue.brandNormalized || "").trim();
    if (!brand) continue;
    counts.set(brand, (counts.get(brand) || 0) + 1);
  }
  return [...counts.entries()]
    .map(([key, count]) => ({ key, label: key, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
});

const availableFlows = computed(() => {
  const counts = new Map();
  for (const issue of baseCategoryIssues.value) {
    for (const flow of issue.flow || []) {
      counts.set(flow, (counts.get(flow) || 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([key, count]) => ({ key, label: key, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
});

const availableChangeTypes = computed(() => {
  const counts = new Map();
  for (const issue of baseCategoryIssues.value) {
    for (const ctype of issue.changeType || []) {
      counts.set(ctype, (counts.get(ctype) || 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([key, count]) => ({ key, label: key, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
});

const hasExploreFilters = computed(() => Boolean(
  exploreBrand.value || exploreFlow.value || exploreChangeType.value
));

const visibleIssues = computed(() => {
  let pool = baseCategoryIssues.value;
  if (exploreBrand.value) {
    pool = pool.filter((issue) => (issue.brandNormalized || "") === exploreBrand.value);
  }
  if (exploreFlow.value) {
    pool = pool.filter((issue) => (issue.flow || []).includes(exploreFlow.value));
  }
  if (exploreChangeType.value) {
    pool = pool.filter((issue) => (issue.changeType || []).includes(exploreChangeType.value));
  }
  return pool;
});

function toggleExplore() {
  isExploreOpen.value = !isExploreOpen.value;
  if (!isExploreOpen.value) {
    exploreBrand.value = "";
    exploreFlow.value = "";
    exploreChangeType.value = "";
  }
}

function selectExplore(kind, value) {
  if (kind === "brand") {
    exploreBrand.value = exploreBrand.value === value ? "" : value;
  } else if (kind === "flow") {
    exploreFlow.value = exploreFlow.value === value ? "" : value;
  } else if (kind === "changeType") {
    exploreChangeType.value = exploreChangeType.value === value ? "" : value;
  }
}

function resetExplore() {
  exploreBrand.value = "";
  exploreFlow.value = "";
  exploreChangeType.value = "";
}

const masonryColumnCount = computed(() => {
  if (viewportWidth.value <= 640) return 1;
  if (viewportWidth.value <= 980) return 2;
  if (viewportWidth.value <= 1180) return 3;
  return 4;
});

const masonryColumns = computed(() => {
  const columns = Array.from({ length: masonryColumnCount.value }, () => []);
  const heights = Array.from({ length: masonryColumnCount.value }, () => 0);

  for (const issue of visibleIssues.value) {
    const targetIndex = heights.indexOf(Math.min(...heights));
    columns[targetIndex].push(issue);
    heights[targetIndex] += estimateCardHeight(issue);
  }

  return columns;
});

const currentListRoute = computed(() => listRoute.value);
const emptyStateDescription = computed(() => (
  showCurrentWeekOnly.value
    ? "오늘 기준 최근 7일 안에 등록된 업데이트가 없습니다."
    : "잠시 후 다시 확인해주세요."
));

const detailReturnRoute = computed(() => {
  const routeParam = routeReturnParam();
  if (routeParam) return routeParam;
  if (activeIssue.value?.areaKey) return withListFilter(`/category/${activeIssue.value.areaKey}`);
  return withListFilter("/");
});

function categoryPath(key) {
  return withBasePath(withListFilter(`/category/${key}`));
}

function subcategoryPath(categoryKey, subcategoryKey) {
  return withBasePath(withListFilter(`/category/${categoryKey}/${subcategoryKey}`));
}

function storyRoute(issue) {
  const articlePath = issue.route || `/articles/${issue.number}`;
  return `${withBasePath(articlePath)}?from=${encodeURIComponent(currentListRoute.value)}`;
}

function validListRoute(value) {
  const path = routePath(value);
  return path === "/" || path === "" || /^\/category\/(service|design|dev|uiux)(?:\/[^?&]+)?$/.test(path);
}

function routeReturnParam() {
  const match = route.value.match(/[?&]from=([^&]+)/);
  if (!match) return "";
  const value = decodeURIComponent(match[1]);
  return validListRoute(value) ? value : "";
}

function goToList() {
  window.location.href = withBasePath(detailReturnRoute.value);
}

function toggleCurrentWeekOnly(event) {
  const enabled = Boolean(event.target.checked);
  const nextRoute = withListFilter(routePath(currentListRoute.value), enabled);
  window.history.pushState({}, "", withBasePath(nextRoute));
  route.value = nextRoute;
  listRoute.value = nextRoute;
  showCurrentWeekOnly.value = enabled;
}

function setListViewMode(mode) {
  const nextMode = mode === "list" ? "list" : "gallery";
  listViewMode.value = nextMode;
  const nextRoute = withListFilter(routePath(currentListRoute.value));
  window.history.replaceState({}, "", withBasePath(nextRoute));
  route.value = nextRoute;
  listRoute.value = nextRoute;
}

function openSubscribe() {
  isSubscribeOpen.value = true;
  subscribeStatus.value = "idle";
  subscribeMessage.value = "";
  document.body.classList.add("is-subscribe-open");
}

function closeSubscribe() {
  isSubscribeOpen.value = false;
  document.body.classList.remove("is-subscribe-open");
}

function toggleSubscribeAudience(value) {
  if (subscribeAudiences.value.includes(value)) {
    subscribeAudiences.value = subscribeAudiences.value.filter((item) => item !== value);
    return;
  }
  subscribeAudiences.value = [...subscribeAudiences.value, value];
}

function subscribeApiUrl() {
  const configuredBase = import.meta.env.VITE_NEWSLETTER_API_BASE_URL || "";
  return `${configuredBase.replace(/\/$/, "")}/api/subscribe`;
}

async function readSubscribeResponse(response) {
  const responseText = await response.text();
  if (!responseText) return {};

  try {
    return JSON.parse(responseText);
  } catch {
    throw new Error("구독 API 응답을 확인하지 못했습니다. API 주소 설정을 확인해주세요.");
  }
}

async function submitSubscribe() {
  subscribeStatus.value = "submitting";
  subscribeMessage.value = "";

  try {
    const response = await fetch(subscribeApiUrl(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: subscribeEmail.value,
        audiences: subscribeAudiences.value,
      }),
    });
    const data = await readSubscribeResponse(response);
    if (!response.ok || !data.ok) throw new Error(data.error || "구독 신청을 처리하지 못했습니다.");

    subscribeStatus.value = "success";
    subscribeMessage.value = "구독신청이 완료 되었습니다 감사합니다 :)";
  } catch (error) {
    subscribeStatus.value = "error";
    subscribeMessage.value = error.message || "구독 신청을 처리하지 못했습니다.";
  }
}

function plainText(htmlText) {
  const node = document.createElement("span");
  node.innerHTML = htmlText || "";
  return node.textContent || node.innerText || "";
}

function splitChecklistSentences(html) {
  const text = String(html).trim();
  if (!text) return [];
  const parts = text.split(/(?<=[.?!])\s+(?=[가-힣A-Za-z])/);
  return parts.map((part) => part.trim()).filter(Boolean);
}

const EMPHASIZED_SUBHEAD_PATTERN = /(점검 질문|짚을 점|관점)/;
function isEmphasizedSubhead(html) {
  if (!html) return false;
  return EMPHASIZED_SUBHEAD_PATTERN.test(html);
}

const SOURCE_TYPE_BADGES = {
  release_note: { label: "공식 릴리즈", variant: "primary", description: "공식 제품 업데이트·릴리즈 노트" },
  news: { label: "공식 뉴스", variant: "primary", description: "공식 뉴스룸·보도자료" },
  research: { label: "리서치", variant: "secondary", description: "리서치·리포트" },
  guide: { label: "가이드", variant: "secondary", description: "표준·방법론 가이드" },
  reference: { label: "사례 참고", variant: "muted", description: "서비스·디자인 사례 참고 글" },
  blog_opinion: { label: "블로그", variant: "muted", description: "관점 중심 블로그·오피니언" },
};
function sourceTypeBadge(issue) {
  if (!issue) return null;
  const key = issue.sourceType || "";
  return SOURCE_TYPE_BADGES[key] || null;
}

function proseBlocks(blocks = []) {
  const mergedBlocks = blocks.reduce((result, block) => {
    if (block.kind !== "highlight") {
      result.push({ ...block });
      return result;
    }

    const previous = result[result.length - 1];
    if (previous?.kind === "paragraph") {
      previous.html = `${previous.html} ${block.html}`;
      return result;
    }

    result.push({ kind: "paragraph", html: block.html });
    return result;
  }, []);

  let lastSubheadIsChecklist = false;
  let justAfterSubhead = false;
  const checklistConverted = mergedBlocks.map((block) => {
    if (block.kind === "subhead") {
      lastSubheadIsChecklist = /점검\s*질문/.test(plainText(block.html));
      justAfterSubhead = true;
      return block;
    }
    if (justAfterSubhead && block.kind === "quote") {
      justAfterSubhead = false;
      return { ...block, kind: "hint" };
    }
    if (block.kind !== "subhead") {
      justAfterSubhead = false;
    }
    if (lastSubheadIsChecklist && block.kind === "paragraph") {
      const items = splitChecklistSentences(block.html);
      if (items.length > 1) {
        lastSubheadIsChecklist = false;
        return { kind: "list", html: items[0], items };
      }
    }
    if (block.kind === "list") lastSubheadIsChecklist = false;
    return block;
  });

  return checklistConverted.reduce((result, block) => {
    if (block.kind !== "list") {
      result.push(block);
      return result;
    }

    if (Array.isArray(block.items) && block.items.length > 1) {
      result.push({ kind: "list", html: block.html, items: [...block.items] });
      return result;
    }

    const previous = result[result.length - 1];
    if (previous?.kind === "list") {
      previous.items.push(block.html);
      return result;
    }

    result.push({ kind: "list", html: block.html, items: [block.html] });
    return result;
  }, []);
}

function estimateCardHeight(issue) {
  const titleLength = plainText(issue.takeawayHtml).length;
  const deckLength = plainText(issue.deckHtml).length;
  const imageHeight = issue.image ? 320 / imageAspectRatio(issue) : 0;
  return imageHeight + 120 + titleLength * 2.4 + deckLength * 1.15;
}

function imageAspectRatio(issue) {
  const seed = Number.parseInt(String(issue.number || "1"), 10) || 1;
  const ratios = [0.72, 0.82, 0.92, 1.05, 1.16, 1.28];
  if (/app store|앱 화면|screenshot|screen/i.test(issue.imageCaption || "")) {
    return seed % 2 === 0 ? 0.74 : 0.82;
  }
  if (/logo|icon|아이콘/i.test(issue.imageCaption || issue.image || "")) {
    return 1;
  }
  return ratios[seed % ratios.length];
}

function optimizedImageUrl(value = "", width = 900) {
  if (!value) return "";
  try {
    const url = new URL(value);
    const host = url.hostname;
    if (host === "cdn.sanity.io") {
      url.searchParams.set("w", String(width));
      url.searchParams.set("q", "72");
      url.searchParams.set("fit", "max");
      url.searchParams.set("auto", "format");
      return url.href;
    }
    if (host === "images.ctfassets.net") {
      url.searchParams.set("w", String(width));
      url.searchParams.set("q", "80");
      url.searchParams.set("fm", "webp");
      return url.href;
    }
    return value;
  } catch {
    return value;
  }
}

function capTallThumbnail(event) {
  const image = event.currentTarget;
  const thumb = image.closest(".guide-thumb, .guide-list-thumb");
  if (!thumb || !image.naturalWidth || !image.naturalHeight) return;
  thumb.classList.toggle("is-ratio-capped", image.naturalWidth / image.naturalHeight < 0.75);
}

function hideBrokenImage(event) {
  const image = event.currentTarget;
  const frame = image.closest(".article-image, .guide-thumb, .guide-list-thumb");
  const listLink = image.closest(".guide-list-card a");
  if (listLink) listLink.classList.remove("has-thumb");
  if (frame) {
    frame.remove();
    return;
  }
  image.remove();
}

async function shareIssue(issue) {
  const url = issue.articleUrl || `${window.location.origin}${storyRoute(issue)}`;
  const title = `${issue.platform} | Magazine`;
  if (navigator.share) {
    try {
      await navigator.share({ title, text: plainText(issue.takeawayHtml), url });
      return;
    } catch (error) {
      if (error?.name === "AbortError") return;
    }
  }
  await navigator.clipboard.writeText(url);
  shareStatus.value = "링크 복사됨";
  window.setTimeout(() => {
    shareStatus.value = "";
  }, 1500);
}

const TABLE_LABELS = ["업데이트", "핵심 업데이트", "핵심 내용", "주요 항목", "서비스 맥락", "디자인 맥락", "기술 맥락", "변경 전", "변경 후", "수치·팩트", "수치/팩트"];

function splitLabelValue(text) {
  const colonMatch = String(text).match(/^([^:：]{2,18})[:：]\s*(.+)$/);
  if (colonMatch) return { label: colonMatch[1].trim(), value: colonMatch[2] };
  const dashMatch = String(text).match(/^(.{2,18}?)\s+[—–]\s+(.+)$/);
  if (dashMatch) return { label: dashMatch[1].trim(), value: dashMatch[2] };
  return null;
}

function formatSummaryItem(item) {
  const parsed = splitLabelValue(item);
  if (!parsed) return String(item);
  return `<span class="summary-key">${parsed.label}</span><span class="summary-value">${parsed.value}</span>`;
}

function isTableSection(section) {
  if (!section || section.prose) return false;
  if (isBulletSummary(section) || isTermExplanation(section)) return false;
  const items = section.itemsHtml || [];
  if (!items.length) return false;
  return items.every((item) => {
    const parsed = splitLabelValue(item);
    return Boolean(parsed) && TABLE_LABELS.includes(parsed.label);
  });
}

function isBulletSummary(section) {
  return section?.title === "기술 변화 요약" || section?.title === "요약" || String(section?.className || "").includes("is-bullet-summary");
}

function isTermExplanation(section) {
  return section?.title === "용어 설명" || String(section?.className || "").includes("is-term-explanation");
}

function findFirstColonOutsideTags(text) {
  let inTag = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inTag) {
      if (ch === ">") inTag = false;
      continue;
    }
    if (ch === "<") {
      inTag = true;
      continue;
    }
    if (ch === ":" || ch === "：") return i;
  }
  return -1;
}

function stripTags(value) {
  return String(value).replace(/<[^>]+>/g, "");
}

function buildGlossary(section) {
  if (!section || !Array.isArray(section.itemsHtml)) return [];
  return section.itemsHtml
    .map((raw) => {
      const text = String(raw);
      const cut = findFirstColonOutsideTags(text);
      if (cut < 0) return null;
      const rawLabel = text.slice(0, cut).trim();
      const explanation = text.slice(cut + 1).trim();
      const term = stripTags(rawLabel).trim();
      if (!term || !explanation) return null;
      return { term, explanation };
    })
    .filter(Boolean)
    .sort((a, b) => b.term.length - a.term.length);
}

const ASCII_WORD = /[A-Za-z0-9_]/;

function applyGlossaryToHtml(html, glossary, used) {
  if (!html || !glossary.length) return html || "";
  const parts = String(html).split(/(<[^>]+>)/g);
  for (let i = 0; i < parts.length; i++) {
    const segment = parts[i];
    if (!segment || segment.startsWith("<")) continue;
    let result = "";
    let pending = segment;
    while (pending.length) {
      let chosen = null;
      let chosenIdx = -1;
      for (const entry of glossary) {
        if (used.has(entry.term)) continue;
        const idx = pending.indexOf(entry.term);
        if (idx === -1) continue;
        const startsAlnum = ASCII_WORD.test(entry.term[0]);
        const endsAlnum = ASCII_WORD.test(entry.term[entry.term.length - 1]);
        const charBefore = idx > 0 ? pending[idx - 1] : "";
        const charAfter = pending[idx + entry.term.length] || "";
        if (startsAlnum && ASCII_WORD.test(charBefore)) continue;
        if (endsAlnum && ASCII_WORD.test(charAfter)) continue;
        if (chosenIdx === -1 || idx < chosenIdx || (idx === chosenIdx && entry.term.length > chosen.term.length)) {
          chosenIdx = idx;
          chosen = entry;
        }
      }
      if (!chosen) {
        result += pending;
        break;
      }
      const before = pending.slice(0, chosenIdx);
      const after = pending.slice(chosenIdx + chosen.term.length);
      const wrapped = `<span class="glossary-term" tabindex="0"><span class="glossary-term-label">${chosen.term}</span><span class="glossary-tooltip" role="tooltip">${chosen.explanation}</span></span>`;
      result += before + wrapped;
      used.add(chosen.term);
      pending = after;
    }
    parts[i] = result;
  }
  return parts.join("");
}

function kstTodayStart() {
  const now = new Date();
  const kstNow = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return new Date(Date.UTC(
    kstNow.getUTCFullYear(),
    kstNow.getUTCMonth(),
    kstNow.getUTCDate(),
  ));
}

function recentDaysRange(days) {
  const safeDays = Math.max(1, Number(days) || 1);
  const end = kstTodayStart();
  end.setUTCDate(end.getUTCDate() + 1);
  const start = new Date(end);
  start.setUTCDate(end.getUTCDate() - safeDays);
  return { start, end };
}

function dateFromIsoDay(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ""))) return null;
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function isDateInRange(value, range) {
  const date = dateFromIsoDay(value);
  if (!date || !range) return false;
  return date >= range.start && date < range.end;
}

function issuePublicationDate(issue) {
  return issue?.publicationDate || issue?.issueSlug || issue?.date || "";
}
</script>

<template>
  <header class="site-header">
    <a class="header-back-link" :href="withBasePath(detailReturnRoute)" aria-label="목록으로 돌아가기">
      <span aria-hidden="true">←</span>
    </a>
    <a class="brand" :href="withBasePath(withListFilter('/'))" aria-label="CTTD Trend Magazine home">
      <img src="/assets/cttd-logo.svg" alt="CTTD" width="92" height="24" decoding="async">
      <span>Magazine</span>
    </a>
    <nav class="header-category-nav" aria-label="매거진 카테고리">
      <a :href="withBasePath(withListFilter('/'))" data-category-nav="" :class="{ 'is-active': !activeCategoryKey && !activeIssue && !isSignalsPage }">전체</a>
      <a
        v-for="category in categories"
        :key="category.key"
        :href="categoryPath(category.key)"
        :data-category-nav="category.key"
        :class="{ 'is-active': activeCategoryKey === category.key && !isSignalsPage }"
        :aria-current="activeCategoryKey === category.key && !isSignalsPage ? 'page' : undefined"
      >
        <span class="category-nav-label">{{ category.label }}</span>
        <span v-if="category.jobLabel" class="category-nav-job" aria-hidden="true">{{ category.jobLabel }}</span>
        <span v-if="category.jobLabel" class="sr-only">독자 직무 {{ category.jobLabel }}</span>
      </a>
      <a
        :href="withBasePath('/signals')"
        data-category-nav="signals"
        :class="{ 'is-active': isSignalsPage }"
        :aria-current="isSignalsPage ? 'page' : undefined"
      >
        <span class="category-nav-label">Signals</span>
        <span class="category-nav-job" aria-hidden="true">채용 신호</span>
      </a>
    </nav>
    <div class="header-actions">
      <button
        class="explore-toggle"
        type="button"
        :aria-pressed="isExploreOpen"
        :class="{ 'is-active': isExploreOpen }"
        @click="toggleExplore"
      >
        <span>Explore</span>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M3 6h18" />
          <path d="M6 12h12" />
          <path d="M10 18h4" />
        </svg>
      </button>
      <button class="subscribe-link" type="button" @click="openSubscribe">
        <span>Subscribe</span>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 6h16v12H4z" />
          <path d="m4 7 8 6 8-6" />
        </svg>
      </button>
    </div>
  </header>

  <section v-if="isExploreOpen && !activeIssue" class="explore-panel" aria-label="다중 필터 탐색">
    <div class="explore-panel-inner">
      <div v-if="availableBrands.length" class="explore-group">
        <span class="explore-group-label">브랜드</span>
        <div class="explore-chips">
          <button
            v-for="brand in availableBrands"
            :key="'brand-' + brand.key"
            type="button"
            class="explore-chip"
            :class="{ 'is-active': exploreBrand === brand.key }"
            @click="selectExplore('brand', brand.key)"
          >{{ brand.label }}<small>{{ brand.count }}</small></button>
        </div>
      </div>
      <div v-if="availableFlows.length" class="explore-group">
        <span class="explore-group-label">플로우/패턴</span>
        <div class="explore-chips">
          <button
            v-for="flow in availableFlows"
            :key="'flow-' + flow.key"
            type="button"
            class="explore-chip"
            :class="{ 'is-active': exploreFlow === flow.key }"
            @click="selectExplore('flow', flow.key)"
          >{{ flow.label }}<small>{{ flow.count }}</small></button>
        </div>
      </div>
      <div v-if="availableChangeTypes.length" class="explore-group">
        <span class="explore-group-label">변화 유형</span>
        <div class="explore-chips">
          <button
            v-for="ctype in availableChangeTypes"
            :key="'ctype-' + ctype.key"
            type="button"
            class="explore-chip"
            :class="{ 'is-active': exploreChangeType === ctype.key }"
            @click="selectExplore('changeType', ctype.key)"
          >{{ ctype.label }}<small>{{ ctype.count }}</small></button>
        </div>
      </div>
      <button v-if="hasExploreFilters" type="button" class="explore-reset" @click="resetExplore">필터 초기화</button>
    </div>
  </section>

  <Teleport to="body">
    <div v-if="isSubscribeOpen" class="subscribe-modal" role="dialog" aria-modal="true" aria-labelledby="subscribe-title">
      <button class="subscribe-backdrop" type="button" aria-label="구독 창 닫기" @click="closeSubscribe"></button>
      <form class="subscribe-panel" :class="{ 'is-complete': subscribeStatus === 'success' }" @submit.prevent="submitSubscribe">
        <div class="subscribe-panel-head">
          <h2 v-if="subscribeStatus !== 'success'" id="subscribe-title">Subscribe</h2>
          <button class="subscribe-close-button" type="button" aria-label="구독 창 닫기" @click="closeSubscribe">×</button>
        </div>
        <div v-if="subscribeStatus !== 'success'" class="subscribe-form-grid">
          <div class="subscribe-options" role="group" aria-labelledby="subscribe-category-label">
            <span id="subscribe-category-label" class="subscribe-category-label">구독 카테고리<span aria-hidden="true">*</span></span>
            <label>
              <input type="checkbox" :checked="subscribeAudiences.includes('Service')" @change="toggleSubscribeAudience('Service')">
              <span>Service<small class="subscribe-job-hint">기획자 · 이커머스 서비스</small></span>
            </label>
            <label>
              <input type="checkbox" :checked="subscribeAudiences.includes('Design')" @change="toggleSubscribeAudience('Design')">
              <span>Design<small class="subscribe-job-hint">디자이너 · UIUX 비주얼</small></span>
            </label>
            <label>
              <input type="checkbox" :checked="subscribeAudiences.includes('DEV')" @change="toggleSubscribeAudience('DEV')">
              <span>DEV<small class="subscribe-job-hint">퍼블리셔 · 마크업·CSS·인터랙션·정적 빌드</small></span>
            </label>
          </div>
          <label class="subscribe-field">
            <input v-model.trim="subscribeEmail" type="email" required autocomplete="email" placeholder=" ">
            <span>이메일<strong aria-hidden="true">*</strong></span>
          </label>
        </div>
        <p v-if="subscribeMessage" class="subscribe-message" :class="'is-' + subscribeStatus" role="status">{{ subscribeMessage }}</p>
        <button v-if="subscribeStatus === 'success'" class="subscribe-complete-button" type="button" @click="closeSubscribe">
          닫기
        </button>
        <button v-if="subscribeStatus !== 'success'" class="subscribe-submit-button" type="submit" :disabled="subscribeStatus === 'submitting'">
          {{ subscribeStatus === 'submitting' ? '신청 중' : '구독 신청 하기' }}
        </button>
      </form>
    </div>
  </Teleport>

  <main v-if="isSignalsPage" class="signals-page" aria-label="채용 신호 모니터링">
    <header class="signals-header">
      <p class="signals-eyebrow">discovery signals</p>
      <h1>채용 공고 키워드 신호</h1>
      <p class="signals-deck">메인 매거진 글은 아니지만 다음 분기 제품 방향을 가리키는 보조 지표. 모니터링 대상 회사들의 공개 채용 페이지를 키워드 기준으로 집계합니다.</p>
    </header>
    <section v-if="!signalsData || !signalsData.signals?.length" class="signals-empty">
      <p>아직 집계된 채용 신호가 없습니다.</p>
      <p class="signals-empty-hint">로컬에서 <code>npm run fetch:signals</code>를 실행하면 <code>public/data/signals.json</code>이 생성됩니다.</p>
    </section>
    <section v-else class="signals-grid">
      <article v-for="signal in signalsData.signals" :key="signal.key" class="signals-card">
        <header>
          <h2>{{ signal.label }}</h2>
          <strong>{{ signal.total }}</strong>
        </header>
        <ul v-if="signal.breakdown.length">
          <li v-for="entry in signal.breakdown" :key="entry.company + signal.key">
            <span>{{ entry.company }}</span>
            <em>{{ entry.count }}</em>
          </li>
        </ul>
        <p v-else class="signals-empty-row">언급 회사 없음</p>
      </article>
    </section>
    <footer v-if="signalsData?.generatedAt" class="signals-footer">
      <p>마지막 집계: {{ signalsData.generatedAt.slice(0, 10) }}</p>
      <p v-if="signalsData.note" class="signals-note">{{ signalsData.note }}</p>
    </footer>
  </main>
  <main v-else :class="{ 'article-main': activeIssue }">
    <article v-if="activeIssue" :key="'story-' + (activeIssue.route || activeIssue.number)" class="article-layout">
        <header class="article-hero">
          <div class="article-hero-text">
            <p class="article-brand" v-text="activeIssue.platform"></p>
            <h1 v-html="activeIssue.takeawayHtml"></h1>
            <aside
              v-if="activeIssue.meetingQuestion"
              class="meeting-question"
              role="note"
              aria-label="클라이언트에게 묻기"
            >
              <span class="meeting-question-label" aria-hidden="true">💬 클라이언트에게 묻기</span>
              <p class="meeting-question-body" v-text="activeIssue.meetingQuestion"></p>
            </aside>
            <p class="article-deck" v-html="activeIssue.deckHtml"></p>
            <div class="article-meta-row">
              <div class="article-meta">
                <time v-text="activeIssue.date"></time>
                <span aria-hidden="true">|</span>
                <span class="category-label" v-text="activeIssue.category"></span>
                <span v-if="sourceTypeBadge(activeIssue)" aria-hidden="true">|</span>
                <span
                  v-if="sourceTypeBadge(activeIssue)"
                  :class="['source-type-badge', 'is-' + sourceTypeBadge(activeIssue).variant]"
                  :title="sourceTypeBadge(activeIssue).description"
                >{{ sourceTypeBadge(activeIssue).label }}</span>
                <span v-if="activeIssue.readingMinutes" aria-hidden="true">|</span>
                <span v-if="activeIssue.readingMinutes" class="reading-minutes">약 {{ activeIssue.readingMinutes }}분</span>
                <span v-if="isIssueVisited(activeIssue)" aria-hidden="true">|</span>
                <span v-if="isIssueVisited(activeIssue)" class="visited-badge" aria-label="이미 본 글">이미 본 글</span>
              </div>
              <button class="article-share-button" type="button" :aria-label="shareStatus || '공유하기'" :title="shareStatus || '공유하기'" @click="shareIssue(activeIssue)">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <path d="M8.6 10.7 15.4 6.3" />
                  <path d="M8.6 13.3 15.4 17.7" />
                </svg>
              </button>
            </div>
          </div>
          <figure
            v-if="primaryHeroImage"
            class="article-hero-image"
          >
            <img
              :src="optimizedImageUrl(primaryHeroImage.url, 780)"
              :alt="primaryHeroImage.caption || activeIssue.platform"
              decoding="async"
              fetchpriority="high"
              @error="hideBrokenImage"
            >
            <figcaption v-if="primaryHeroImage.caption" v-text="primaryHeroImage.caption"></figcaption>
          </figure>
        </header>

        <div class="article-body">
          <div class="article-body-main">
          <aside
            v-if="activeIssue.codeArtifacts && activeIssue.codeArtifacts.length"
            class="code-artifacts"
            aria-label="코드 산출물"
          >
            <span class="code-artifacts-label" aria-hidden="true">🛠️ 코드 산출물</span>
            <ul>
              <li v-for="artifact in activeIssue.codeArtifacts" :key="artifact.label + artifact.url">
                <a v-if="artifact.url" :href="artifact.url" target="_blank" rel="noreferrer" :class="['code-artifact-chip', 'is-' + artifact.type]">
                  <span class="code-artifact-type">{{ artifact.label }}</span>
                  <span class="code-artifact-title">{{ artifact.title }}</span>
                </a>
                <span v-else :class="['code-artifact-chip', 'is-' + artifact.type, 'is-static']">
                  <span class="code-artifact-type">{{ artifact.label }}</span>
                  <span class="code-artifact-title">{{ artifact.title }}</span>
                </span>
              </li>
            </ul>
          </aside>
          <div
            v-if="activeIssue.images && activeIssue.images.length > 1"
            class="article-gallery"
            role="region"
            aria-label="스크린샷 갤러리"
          >
            <figure
              v-for="(image, index) in activeIssue.images"
              :key="image.url + index"
              class="article-image article-image-gallery-item"
            >
              <img
                :src="optimizedImageUrl(image.url, 1200)"
                :alt="image.caption || activeIssue.platform"
                decoding="async"
                :fetchpriority="index === 0 ? 'high' : 'auto'"
                :loading="index === 0 ? 'eager' : 'lazy'"
                @error="hideBrokenImage"
              >
              <figcaption v-if="image.caption" v-text="image.caption"></figcaption>
            </figure>
          </div>
          <figure v-else-if="activeIssue.image" class="article-image">
            <img
              :src="optimizedImageUrl(activeIssue.image, 1400)"
              :alt="activeIssue.imageCaption || activeIssue.platform"
              decoding="async"
              fetchpriority="high"
              @error="hideBrokenImage"
            >
            <figcaption v-text="activeIssue.imageCaption"></figcaption>
          </figure>

          <section v-for="section in articleSections" :key="section.title" :class="section.className || ['article-section', { 'is-deep-dive': section.prose }]">
            <h2 v-text="section.title"></h2>
            <div v-if="section.prose" class="section-prose">
              <template v-for="(block, index) in proseBlocks(section.blocks)" :key="block.kind + (block.html || block.items?.join('')) + index">
                <p v-if="block.kind === 'quote'" class="insight-lead" v-html="block.html"></p>
                <p v-else-if="block.kind === 'hint'" class="prose-hint" v-html="block.html"></p>
                <h3
                  v-else-if="block.kind === 'subhead'"
                  :class="{ 'is-emphasized': isEmphasizedSubhead(block.html) }"
                  :data-subhead="block.html"
                  v-html="block.html"
                ></h3>
                <p v-else-if="block.kind === 'paragraph'" v-html="block.html"></p>
                <ul v-else class="prose-list">
                  <li v-for="item in block.items" :key="item" v-html="item"></li>
                </ul>
              </template>
            </div>
            <template v-else>
              <ul v-if="isTableSection(section)" class="summary-list">
                <li v-for="item in section.itemsHtml" :key="item" v-html="formatSummaryItem(item)"></li>
              </ul>
              <ul v-else class="bullet-summary-list">
                <li v-for="item in section.itemsHtml" :key="item" v-html="item"></li>
              </ul>
            </template>
          </section>

          <footer class="article-footer">
            <div class="tag-row">
              <span v-for="tag in activeIssue.tags" :key="tag" v-text="'#' + tag"></span>
            </div>
            <div v-if="activeIssue.sourceUrl || activeIssue.referenceLinks?.length" class="source-link-list">
              <a v-if="activeIssue.sourceUrl" class="source-url" :href="activeIssue.sourceUrl" target="_blank" rel="noreferrer">
                <span class="source-label">출처:</span>
                <span v-text="activeIssue.sourceTitle"></span>
              </a>
              <a v-for="link in activeIssue.referenceLinks || []" :key="link.label + link.url" class="source-url" :href="link.url" target="_blank" rel="noreferrer">
                <span class="source-label" v-text="link.label + ':'"></span>
                <span v-text="link.title"></span>
              </a>
            </div>
          </footer>
          <div class="article-list-actions">
            <a class="article-list-link" :href="withBasePath(detailReturnRoute)" @click.prevent="goToList">목록보기</a>
          </div>
          </div>
          <aside v-if="showArticleSidebar" class="article-sidebar" aria-label="연관 정보">
            <div v-if="activeIssue.meetingQuestion" class="sidebar-card sidebar-meeting-question">
              <span class="sidebar-card-label">💬 클라이언트에게 묻기</span>
              <p v-text="activeIssue.meetingQuestion"></p>
            </div>
            <div v-if="sameBrandIssues.length" class="sidebar-card">
              <span class="sidebar-card-label">같은 브랜드 다른 글</span>
              <ul class="sidebar-card-list">
                <li v-for="issue in sameBrandIssues" :key="'brand-' + issue.id">
                  <a :href="storyRoute(issue)" v-html="issue.takeawayHtml"></a>
                </li>
              </ul>
            </div>
            <div v-if="sameFlowIssues.length" class="sidebar-card">
              <span class="sidebar-card-label">같은 플로우 다른 사례</span>
              <ul class="sidebar-card-list">
                <li v-for="issue in sameFlowIssues" :key="'flow-' + issue.id">
                  <a :href="storyRoute(issue)">
                    <strong v-text="issue.brandNormalized || issue.platform"></strong>
                    <span v-html="issue.takeawayHtml"></span>
                  </a>
                </li>
              </ul>
            </div>
          </aside>
        </div>
    </article>

    <section v-else key="home" id="magazine" class="magazine-home">
        <section v-if="activeCategory" class="subcategory-panel" aria-label="소 카테고리">
          <div class="subcategory-list">
            <a class="subcategory-link" :class="{ 'is-active': !activeSubcategory }" :href="categoryPath(activeCategory.key)">
              <span>전체</span>
              <em v-text="categoryIssues.length"></em>
            </a>
            <a v-for="subcategory in subcategories" :key="subcategory.key" class="subcategory-link" :class="{ 'is-active': activeSubcategory === subcategory.key }" :href="subcategoryPath(activeCategory.key, subcategory.key)">
              <span v-text="subcategory.label"></span>
              <em v-text="subcategory.count"></em>
            </a>
          </div>
        </section>

        <section class="list-toolbar" aria-label="목록 필터">
          <div class="view-mode-toggle" role="group" aria-label="목록 보기 방식">
            <button
              type="button"
              class="view-mode-button"
              :class="{ 'is-active': listViewMode === 'gallery' }"
              :aria-pressed="listViewMode === 'gallery'"
              aria-label="갤러리 모드"
              @click="setListViewMode('gallery')"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect x="4" y="4" width="6" height="6"></rect>
                <rect x="14" y="4" width="6" height="6"></rect>
                <rect x="4" y="14" width="6" height="6"></rect>
                <rect x="14" y="14" width="6" height="6"></rect>
              </svg>
            </button>
            <button
              type="button"
              class="view-mode-button"
              :class="{ 'is-active': listViewMode === 'list' }"
              :aria-pressed="listViewMode === 'list'"
              aria-label="리스트 모드"
              @click="setListViewMode('list')"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect x="4" y="5" width="5" height="5"></rect>
                <path d="M13 7.5h7"></path>
                <rect x="4" y="14" width="5" height="5"></rect>
                <path d="M13 16.5h7"></path>
              </svg>
            </button>
          </div>
          <label class="week-filter-toggle">
            <input type="checkbox" :checked="showCurrentWeekOnly" @change="toggleCurrentWeekOnly">
            <span>최근 <span class="week-filter-period">1주일 </span>업데이트만 보기</span>
          </label>
        </section>

        <section
          v-if="visibleIssues.length && listViewMode === 'gallery'"
          class="guide-grid"
          :style="{ '--masonry-columns': masonryColumns.length }"
          :aria-label="activeCategory ? activeCategory.label + ' 아티클 목록' : '아티클 목록'"
        >
          <div v-for="(column, columnIndex) in masonryColumns" :key="'column-' + columnIndex" class="masonry-column">
            <article v-for="issue in column" :key="issue.id || issue.route || issue.number" class="guide-card">
              <a :href="storyRoute(issue)">
                <div v-if="issue.image" class="guide-thumb">
                  <img
                    :src="optimizedImageUrl(issue.image, 720)"
                    :alt="issue.imageCaption || issue.platform"
                    loading="lazy"
                    decoding="async"
                    @load="capTallThumbnail"
                    @error="hideBrokenImage"
                  >
                </div>
                <p class="guide-brand" v-text="issue.platform"></p>
                <h2 :class="{ 'is-visited': isIssueVisited(issue) }" v-html="issue.takeawayHtml"></h2>
                <strong v-html="issue.deckHtml"></strong>
                <div class="guide-card-foot">
                  <time v-text="issuePublicationDate(issue)"></time>
                  <span aria-hidden="true">|</span>
                  <span class="category-label" v-text="issue.category"></span>
                </div>
              </a>
            </article>
          </div>
        </section>

        <section
          v-else-if="visibleIssues.length"
          class="guide-list"
          :aria-label="activeCategory ? activeCategory.label + ' 리스트 목록' : '리스트 목록'"
        >
          <article v-for="issue in visibleIssues" :key="issue.id || issue.route || issue.number" class="guide-list-card">
            <a :href="storyRoute(issue)" :class="{ 'has-thumb': issue.image }">
              <div v-if="issue.image" class="guide-list-thumb">
                <img
                  :src="optimizedImageUrl(issue.image, 320)"
                  :alt="issue.imageCaption || issue.platform"
                  loading="lazy"
                  decoding="async"
                  @load="capTallThumbnail"
                  @error="hideBrokenImage"
                >
              </div>
              <div class="guide-list-body">
                <p class="guide-brand" v-text="issue.platform"></p>
                <h2 :class="{ 'is-visited': isIssueVisited(issue) }" v-html="issue.takeawayHtml"></h2>
                <strong v-html="issue.deckHtml"></strong>
                <div class="guide-card-foot">
                  <time v-text="issuePublicationDate(issue)"></time>
                  <span aria-hidden="true">|</span>
                  <span class="category-label" v-text="issue.category"></span>
                </div>
              </div>
            </a>
          </article>
        </section>

        <section v-else-if="magazineLoading" class="magazine-loading" aria-live="polite" aria-label="매거진 데이터 불러오는 중">
          <svg viewBox="0 0 48 48" role="img" aria-hidden="true">
            <circle cx="24" cy="24" r="18"></circle>
          </svg>
        </section>

        <section v-else class="empty-state">
          <p>{{ emptyStateDescription }}</p>
        </section>
    </section>
  </main>

  <footer class="site-footer">
    <p>Copyright &copy; 2026 CTTD. All rights reserved.</p>
    <a class="footer-site-link" href="https://www.cttd.co.kr/" target="_blank" rel="noreferrer" aria-label="CTTD 웹사이트 바로가기">
      <span>CTTD 웹사이트 바로가기</span>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7 17 17 7" />
        <path d="M9 7h8v8" />
      </svg>
    </a>
  </footer>
</template>
