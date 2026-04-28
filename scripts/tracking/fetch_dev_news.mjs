import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Parser from "rss-parser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..", "..");
const sourcesPath = path.join(root, "news-tracking", "dev-sources.json");
const runsDir = path.join(root, "runs");
const parser = new Parser();
const FEED_TIMEOUT_MS = 15000;

const DEV_CATEGORIES = [
  "AI Tools",
  "HTML/CSS",
  "JavaScript",
  "Accessibility",
  "Performance",
  "Design Systems",
  "Others",
];

function outputDate() {
  return (process.env.TRACKING_OUTPUT_DATE || new Date().toISOString().slice(0, 10)).trim();
}

function sinceDate() {
  const configured = (process.env.TRACKING_SINCE_DATE || "").trim();
  if (configured) return new Date(`${configured}T00:00:00Z`);
  const date = new Date();
  date.setDate(date.getDate() - 7);
  return date;
}

function runDir(date = outputDate()) {
  return path.join(runsDir, date);
}

function stripTags(value = "") {
  return String(value)
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function articleContent(item) {
  return stripTags(item.contentSnippet || item["content:encoded"] || item.content || "");
}

function normalizeCategory(value = "") {
  const category = DEV_CATEGORIES.find((item) => item.toLowerCase() === String(value).trim().toLowerCase());
  return category || "Others";
}

function fallbackCategory(article) {
  const source = String(article.source || "").toLowerCase();
  const text = `${article.source || ""} ${article.title || ""} ${article.content || ""}`.toLowerCase();
  if (source.includes("javascript weekly") || source.includes("syntax.fm") || source.includes("shoptalk")) return "JavaScript";
  if (source.includes("css weekly") || source.includes("frontend focus") || source.includes("css-tricks")) return "HTML/CSS";
  if (/accessibility|a11y|wcag|screen reader|keyboard|aria/.test(text)) return "Accessibility";
  if (/performance|core web vitals|lcp|cls|inp|lazy loading|layout shift/.test(text)) return "Performance";
  if (/design system|component|token/.test(text)) return "Design Systems";
  if (/ai|agent|copilot|claude|openai|llm|tool/.test(text)) return "AI Tools";
  return "Others";
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).format(date);
}

async function fetchRssFeed(url, source, since) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FEED_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "CTTD Trend Report DEV RSS Tracker",
      },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const feed = await parser.parseString(await response.text());
    return feed.items
      .filter((item) => {
        if (!item.pubDate) return false;
        const pubDate = new Date(item.pubDate);
        return !Number.isNaN(pubDate.getTime()) && pubDate >= since;
      })
      .map((item) => ({
        title: item.title || "",
        link: item.link || "",
        pubDate: item.pubDate || "",
        source,
        content: articleContent(item),
      }));
  } catch (error) {
    console.error(`Error fetching ${source}: ${error.message}`);
    return [];
  } finally {
    clearTimeout(timeoutId);
  }
}

async function collectArticles(sources) {
  const since = sinceDate();
  const groups = [
    ["newsletters", sources.newsletters || []],
    ["blogs", sources.blogs || []],
    ["podcasts", sources.podcasts || []],
  ];
  const articles = [];

  for (const [groupName, sourceList] of groups) {
    console.log(`Fetching ${groupName}...`);
    for (const source of sourceList) {
      if (!source.rss) continue;
      articles.push(...await fetchRssFeed(source.rss, source.name, since));
    }
  }

  const seenLinks = new Set();
  return articles
    .filter((article) => article.title && article.link)
    .filter((article) => {
      if (seenLinks.has(article.link)) return false;
      seenLinks.add(article.link);
      return true;
    })
    .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
}

async function summarizeArticle(article) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return {
      summary: article.content || article.title,
      category: fallbackCategory(article),
    };
  }

  const prompt = `다음 기사를 웹 퍼블리셔 관점에서 요약해주세요.
웹 퍼블리셔는 HTML, CSS, JavaScript를 사용하여 디자인을 구현하는 직군입니다.
접근성, 성능, 시맨틱 마크업, UI 구현과 관련된 내용을 중점적으로 다뤄주세요.

제목: ${article.title}
출처: ${article.source}
내용: ${String(article.content || "내용 없음").slice(0, 2000)}

다음 형식으로 응답해주세요:
1. 요약 (2-4줄로 핵심 내용만)
2. 카테고리 (다음 중 하나만 선택): AI Tools, HTML/CSS, JavaScript, Accessibility, Performance, Design Systems, Others

응답 형식:
SUMMARY: [요약 내용]
CATEGORY: [카테고리]`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 500,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json();
    const text = payload?.content?.[0]?.text || "";
    const summaryMatch = text.match(/SUMMARY:\s*(.+?)(?=CATEGORY:|$)/s);
    const categoryMatch = text.match(/CATEGORY:\s*(.+?)$/s);
    return {
      summary: summaryMatch ? summaryMatch[1].trim() : article.content || article.title,
      category: normalizeCategory(categoryMatch ? categoryMatch[1].trim() : fallbackCategory(article)),
    };
  } catch (error) {
    console.error(`Error summarizing "${article.title}": ${error.message}`);
    return {
      summary: article.content || article.title,
      category: fallbackCategory(article),
    };
  }
}

async function summarizeArticles(articles) {
  const categorized = Object.fromEntries(DEV_CATEGORIES.map((category) => [category, []]));
  console.log(`Summarizing ${articles.length} DEV articles...`);

  for (let index = 0; index < articles.length; index += 1) {
    const article = articles[index];
    console.log(`[${index + 1}/${articles.length}] ${article.title}`);
    const result = await summarizeArticle(article);
    const category = normalizeCategory(result.category);
    categorized[category].push({ ...article, summary: result.summary, category });
  }

  return categorized;
}

function generateMarkdown(categories, date) {
  const parts = [
    "# 주간 AI 툴 & 프론트엔드 뉴스 다이제스트",
    "",
    `생성일: ${date}`,
    "",
    "이 다이제스트는 웹 퍼블리셔를 위해 AI가 자동으로 생성한 요약입니다.",
    "",
    "---",
    "",
  ];
  let total = 0;

  for (const category of DEV_CATEGORIES) {
    const articles = categories[category] || [];
    if (!articles.length) continue;
    total += articles.length;
    parts.push(`## ${category}`, "");
    for (const article of articles) {
      parts.push(
        `### [${article.title}](${article.link})`,
        "",
        `**출처**: ${article.source} | **날짜**: ${formatDate(article.pubDate)}`,
        "",
        article.summary || article.content || article.title,
        "",
        "---",
        "",
      );
    }
  }

  parts.push("", `**총 ${total}개의 기사를 요약했습니다.**`, "");
  return parts.join("\n");
}

async function main() {
  const date = outputDate();
  const outputDir = runDir(date);
  await fs.mkdir(outputDir, { recursive: true });

  const sources = JSON.parse(await fs.readFile(sourcesPath, "utf8"));
  const articles = await collectArticles(sources);
  const categories = await summarizeArticles(articles);
  const markdown = generateMarkdown(categories, date);

  const articlesPath = path.join(outputDir, "dev-articles.json");
  const digestPath = path.join(outputDir, "dev-weekly-digest.md");
  await fs.writeFile(articlesPath, `${JSON.stringify(articles, null, 2)}\n`, "utf8");
  await fs.writeFile(digestPath, markdown, "utf8");

  console.log(`Fetched ${articles.length} DEV articles`);
  console.log(`Saved to ${articlesPath}`);
  console.log(`Saved digest to ${digestPath}`);
}

main().catch((error) => {
  console.error("Failed to fetch DEV news:", error);
  process.exit(1);
});
