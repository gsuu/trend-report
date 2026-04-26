<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import report from "./data/report.json";

const route = ref(window.location.hash || "#magazine");
const listRoute = ref(validListRoute(route.value) ? route.value : "#magazine");
const shareStatus = ref("");
const viewportWidth = ref(typeof window === "undefined" ? 1440 : window.innerWidth);

function syncRoute() {
  route.value = window.location.hash || "#magazine";
  if (validListRoute(route.value)) {
    listRoute.value = route.value;
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
  syncDocumentState();
  window.addEventListener("hashchange", syncRoute);
  window.addEventListener("resize", syncViewportWidth);
});
onBeforeUnmount(() => {
  document.body.classList.remove("is-story-open");
  window.removeEventListener("hashchange", syncRoute);
  window.removeEventListener("resize", syncViewportWidth);
});

const issues = computed(() => report.issues || []);
const activeIssue = computed(() => {
  const match = route.value.match(/^#\/story\/([^/?]+)/);
  if (!match) return null;
  return issues.value.find((issue) => issue.number === match[1]) || null;
});

const activeCategoryKey = computed(() => {
  const sourceRoute = activeIssue.value ? detailReturnRoute.value : route.value;
  const match = sourceRoute.match(/^#\/category\/([^/?]+)/);
  if (match) return decodeURIComponent(match[1]);
  return "";
});

const activeSubcategory = computed(() => {
  const sourceRoute = activeIssue.value ? detailReturnRoute.value : route.value;
  const match = sourceRoute.match(/^#\/category\/[^/]+\/([^/?]+)/);
  return match?.[1] || "";
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
    categoryMap.get(key).count += 1;
  }
  const order = { uiux: 0, dev: 1 };
  return [...categoryMap.values()].sort((a, b) => (order[a.key] ?? 99) - (order[b.key] ?? 99));
});

const activeCategory = computed(() => categories.value.find((category) => category.key === activeCategoryKey.value));
const categoryIssues = computed(() => activeCategoryKey.value
  ? issues.value.filter((issue) => issue.areaKey === activeCategoryKey.value)
  : issues.value);

const subcategories = computed(() => {
  const counts = new Map();
  for (const issue of categoryIssues.value) {
    const key = issue.categoryKey || "other";
    counts.set(key, {
      key,
      label: issue.category || key,
      count: (counts.get(key)?.count || 0) + 1,
    });
  }
  return [...counts.values()];
});

const visibleIssues = computed(() => {
  if (!activeCategory.value) return issues.value;
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

const detailReturnRoute = computed(() => {
  const routeParam = routeReturnParam();
  if (routeParam) return routeParam;
  if (activeIssue.value?.areaKey) return categoryPath(activeIssue.value.areaKey);
  return "#magazine";
});

function categoryPath(key) {
  return `#/category/${key}`;
}

function subcategoryPath(categoryKey, subcategoryKey) {
  return `#/category/${categoryKey}/${subcategoryKey}`;
}

function storyRoute(issue) {
  return `${issue.route || `#/story/${issue.number}`}?from=${encodeURIComponent(currentListRoute.value)}`;
}

function validListRoute(value) {
  return value === "#magazine" || /^#\/category\/(uiux|dev)(?:\/[^?&]+)?$/.test(value || "");
}

function routeReturnParam() {
  const match = route.value.match(/[?&]from=([^&]+)/);
  if (!match) return "";
  const value = decodeURIComponent(match[1]);
  return validListRoute(value) ? value : "";
}

function goToList() {
  window.location.hash = detailReturnRoute.value;
}

function plainText(htmlText) {
  const node = document.createElement("span");
  node.innerHTML = htmlText || "";
  return node.textContent || node.innerText || "";
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

function capTallThumbnail(event) {
  const image = event.currentTarget;
  const thumb = image.closest(".guide-thumb");
  if (!thumb || !image.naturalWidth || !image.naturalHeight) return;
  const ratio = image.naturalWidth / image.naturalHeight;
  thumb.classList.toggle("is-ratio-capped", ratio < 0.75);
}

async function shareIssue(issue) {
  const url = issue.articleUrl || `${window.location.origin}${window.location.pathname}${storyRoute(issue)}`;
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
  return !match || !["업데이트", "서비스 맥락", "기술 맥락", "변경 전", "변경 후"].includes(match[1]);
}

function summaryCoreItems(items = []) {
  return items.filter((item) => !isSummaryFact(item));
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
</script>

<template>
  <header class="site-header">
    <a class="header-back-link" :href="detailReturnRoute" aria-label="목록으로 돌아가기">
      <span aria-hidden="true">←</span>
    </a>
    <a class="brand" href="#magazine" aria-label="CTTD Trend Magazine home">
      <img src="/assets/cttd-logo.svg" alt="CTTD">
      <span>Magazine</span>
    </a>
    <nav class="header-category-nav" aria-label="매거진 카테고리">
      <a href="#magazine" data-category-nav="" :class="{ 'is-active': !activeCategoryKey && !activeIssue }">전체</a>
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
  </header>

  <main :class="{ 'article-main': activeIssue }">
    <article v-if="activeIssue" :key="'story-' + activeIssue.number" class="article-layout">
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
            <img :src="activeIssue.image" :alt="activeIssue.imageCaption || activeIssue.platform">
            <figcaption v-text="activeIssue.imageCaption"></figcaption>
          </figure>

          <section v-for="section in activeIssue.sections" :key="section.title" :class="section.className || ['article-section', { 'is-deep-dive': section.prose }]">
            <h2 v-text="section.title"></h2>
            <div v-if="section.prose" class="section-prose">
              <template v-for="block in section.blocks" :key="block.kind + block.html">
                <blockquote v-if="block.kind === 'quote'" v-html="block.html"></blockquote>
                <h3 v-else-if="block.kind === 'subhead'" v-html="block.html"></h3>
                <p v-else-if="block.kind === 'paragraph'" v-html="block.html"></p>
                <ul v-else class="prose-list"><li v-html="block.html"></li></ul>
              </template>
            </div>
            <template v-else>
              <ul class="summary-list">
                <li v-for="item in summaryCoreItems(section.itemsHtml)" :key="item" :class="summaryItemClass(item)" v-html="formatSummaryItem(item)"></li>
              </ul>
              <div v-if="summaryFactItems(section.itemsHtml).length" class="summary-facts">
                <ul class="summary-fact-list">
                  <li v-for="item in summaryFactItems(section.itemsHtml)" :key="item" :class="summaryItemClass(item)" v-html="formatSummaryItem(item)"></li>
                </ul>
              </div>
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
            <a class="article-list-link" :href="detailReturnRoute" @click.prevent="goToList">목록보기</a>
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

        <section
          v-if="visibleIssues.length"
          class="guide-grid"
          :style="{ '--masonry-columns': masonryColumns.length }"
          :aria-label="activeCategory ? activeCategory.label + ' 아티클 목록' : '아티클 목록'"
        >
          <div v-for="(column, columnIndex) in masonryColumns" :key="'column-' + columnIndex" class="masonry-column">
            <article v-for="issue in column" :key="issue.id || issue.number" class="guide-card">
              <a :href="storyRoute(issue)">
                <div v-if="issue.image" class="guide-thumb">
                  <img :src="issue.image" :alt="issue.imageCaption || issue.platform" @load="capTallThumbnail">
                </div>
                <p class="guide-brand" v-text="issue.platform"></p>
                <h2 v-html="issue.takeawayHtml"></h2>
                <strong v-html="issue.deckHtml"></strong>
                <div class="guide-card-foot">
                  <time v-text="issue.date"></time>
                  <span aria-hidden="true">|</span>
                  <span class="category-label" v-text="issue.category"></span>
                </div>
              </a>
            </article>
          </div>
        </section>

        <section v-else class="empty-state">
          <h1>{{ report.title }}</h1>
          <p>{{ report.description }}</p>
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
