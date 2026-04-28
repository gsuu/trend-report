<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
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

onMounted(() => {
  loadMagazineReport();
  syncDocumentState();
  window.addEventListener("popstate", syncRoute);
  window.addEventListener("resize", syncViewportWidth);
});
onBeforeUnmount(() => {
  document.body.classList.remove("is-story-open");
  document.body.classList.remove("is-subscribe-open");
  window.removeEventListener("popstate", syncRoute);
  window.removeEventListener("resize", syncViewportWidth);
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

const issues = computed(() => report.value.issues || []);
const recentWeekRange = computed(() => recentDaysRange(7));
const filteredIssues = computed(() => {
  if (!showCurrentWeekOnly.value || !recentWeekRange.value) return issues.value;
  return issues.value.filter((issue) => isDateInRange(issuePublicationDate(issue), recentWeekRange.value));
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

const categories = computed(() => {
  const categoryMap = new Map();
  for (const issue of issues.value) {
    const key = issue.areaKey || issue.area || "uncategorized";
    if (!categoryMap.has(key)) {
      categoryMap.set(key, {
        key,
        label: issue.area || "분류 없음",
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

const visibleIssues = computed(() => {
  if (!activeCategory.value) return filteredIssues.value;
  if (!activeSubcategory.value) return categoryIssues.value;
  return categoryIssues.value.filter((issue) => issue.categoryKey === activeSubcategory.value);
});

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

  return mergedBlocks.reduce((result, block) => {
    if (block.kind !== "list") {
      result.push(block);
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

function isSummaryFact(item) {
  const text = String(item);
  const match = text.match(/^([^:：]{2,18})[:：]\s*(.+)$/);
  return !match || !["업데이트", "핵심 업데이트", "핵심 내용", "주요 항목", "서비스 맥락", "디자인 맥락", "기술 맥락", "변경 전", "변경 후"].includes(match[1]);
}

function summaryLabelValue(item) {
  const match = String(item).match(/^([^:：]{2,18})[:：]\s*(.+)$/);
  return match ? { label: match[1], value: match[2] } : null;
}

function normalizeSummaryText(text) {
  return plainText(text).replace(/\s+/g, " ").trim();
}

function isDuplicateHeadlineSummary(item, issue) {
  const parsed = summaryLabelValue(item);
  if (!parsed || !["업데이트", "핵심 업데이트", "핵심 내용", "주요 항목"].includes(parsed.label)) return false;
  return normalizeSummaryText(parsed.value) === normalizeSummaryText(issue?.takeawayHtml);
}

function summaryCoreItems(items = [], issue = null) {
  return items.filter((item) => !isSummaryFact(item) && !isDuplicateHeadlineSummary(item, issue));
}

function summaryFactItems(items = []) {
  return items.filter((item) => isSummaryFact(item));
}

function formatSummaryItem(item) {
  const text = String(item);
  const match = text.match(/^([^:：]{2,18})[:：]\s*(.+)$/);
  if (!match) return `<span class="summary-value summary-note">${text}</span>`;
  return `<span class="summary-key">${match[1]}</span><span class="summary-value">${match[2]}</span>`;
}

function summaryItemClass(item) {
  const text = String(item);
  return /^([^:：]{2,18})[:：]\s*(.+)$/.test(text) ? "" : "summary-note-row";
}
function isBulletSummary(section) {
  return section?.title === "기술 변화 요약" || section?.title === "요약" || String(section?.className || "").includes("is-bullet-summary");
}

function isTermExplanation(section) {
  return section?.title === "용어 설명" || String(section?.className || "").includes("is-term-explanation");
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
      <a :href="withBasePath(withListFilter('/'))" data-category-nav="" :class="{ 'is-active': !activeCategoryKey && !activeIssue }">전체</a>
      <a
        v-for="category in categories"
        :key="category.key"
        :href="categoryPath(category.key)"
        :data-category-nav="category.key"
        :class="{ 'is-active': activeCategoryKey === category.key }"
        :aria-current="activeCategoryKey === category.key ? 'page' : undefined"
      >
        {{ category.label }}
      </a>
    </nav>
    <div class="header-actions">
      <button class="subscribe-link" type="button" @click="openSubscribe">
        <span>Subscribe</span>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 6h16v12H4z" />
          <path d="m4 7 8 6 8-6" />
        </svg>
      </button>
    </div>
  </header>

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
              <span>Service</span>
            </label>
            <label>
              <input type="checkbox" :checked="subscribeAudiences.includes('Design')" @change="toggleSubscribeAudience('Design')">
              <span>Design</span>
            </label>
            <label>
              <input type="checkbox" :checked="subscribeAudiences.includes('DEV')" @change="toggleSubscribeAudience('DEV')">
              <span>DEV</span>
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

  <main :class="{ 'article-main': activeIssue }">
    <article v-if="activeIssue" :key="'story-' + (activeIssue.route || activeIssue.number)" class="article-layout">
        <header class="article-hero">
          <p class="article-brand" v-text="activeIssue.platform"></p>
          <h1 v-html="activeIssue.takeawayHtml"></h1>
          <p class="article-deck" v-html="activeIssue.deckHtml"></p>
          <div class="article-meta-row">
            <div class="article-meta">
              <time v-text="activeIssue.date"></time>
              <span aria-hidden="true">|</span>
              <span class="category-label" v-text="activeIssue.category"></span>
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
        </header>

        <div class="article-body">
          <figure v-if="activeIssue.image" class="article-image">
            <img
              :src="optimizedImageUrl(activeIssue.image, 1400)"
              :alt="activeIssue.imageCaption || activeIssue.platform"
              decoding="async"
              fetchpriority="high"
              @error="hideBrokenImage"
            >
            <figcaption v-text="activeIssue.imageCaption"></figcaption>
          </figure>

          <section v-for="section in activeIssue.sections" :key="section.title" :class="section.className || ['article-section', { 'is-deep-dive': section.prose }]">
            <h2 v-text="section.title"></h2>
            <div v-if="section.prose" class="section-prose">
              <template v-for="(block, index) in proseBlocks(section.blocks)" :key="block.kind + (block.html || block.items?.join('')) + index">
                <p v-if="block.kind === 'quote'" class="insight-lead" v-html="block.html"></p>
                <h3 v-else-if="block.kind === 'subhead'" v-html="block.html"></h3>
                <p v-else-if="block.kind === 'paragraph'" v-html="block.html"></p>
                <ul v-else class="prose-list">
                  <li v-for="item in block.items" :key="item" v-html="item"></li>
                </ul>
              </template>
            </div>
            <template v-else>
              <ul v-if="isTermExplanation(section)" class="term-explanation-list">
                <li v-for="item in section.itemsHtml" :key="item" :class="summaryItemClass(item)" v-html="formatSummaryItem(item)"></li>
              </ul>
              <ul v-else-if="isBulletSummary(section)" class="bullet-summary-list">
                <li v-for="item in section.itemsHtml" :key="item" v-html="item"></li>
              </ul>
              <template v-else>
                <ul class="summary-list">
                  <li v-for="item in summaryCoreItems(section.itemsHtml, activeIssue)" :key="item" :class="summaryItemClass(item)" v-html="formatSummaryItem(item)"></li>
                </ul>
                <div v-if="summaryFactItems(section.itemsHtml).length" class="summary-facts">
                  <ul class="summary-fact-list">
                    <li v-for="item in summaryFactItems(section.itemsHtml)" :key="item" :class="summaryItemClass(item)" v-html="formatSummaryItem(item)"></li>
                  </ul>
                </div>
              </template>
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
            <span>최근 1주일 업데이트만 보기</span>
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
                <h2 v-html="issue.takeawayHtml"></h2>
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
                <h2 v-html="issue.takeawayHtml"></h2>
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
