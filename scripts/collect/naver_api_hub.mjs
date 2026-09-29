// NAVER API HUB(네이버 클라우드 플랫폼) 클라이언트.
// 네이버 개발자센터(openapi.naver.com, X-Naver-Client-Id) 검색 API 신규 발급이 2026-07-31 종료되어
// API HUB로 연결한다. 파라미터·응답 형식은 개발자센터와 같고 호스트·경로·인증 헤더만 다르다.
//
// 등록된 API: NAVER 검색(블로그·웹문서), Data Lab(검색어트렌드)
// 키: NAVER_API_HUB_CLIENT_ID / NAVER_API_HUB_CLIENT_SECRET (.env 또는 .env.local)
//
// 점검: npm run naver:check -- --query=무신사
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..", "..");

export const NAVER_API_HUB_BASE_URL = "https://naverapihub.apigw.ntruss.com";

function loadDotenvFiles() {
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

// 키가 없는 환경(로컬 초기 세팅, secrets 미등록 CI)에서는 수집을 건너뛰도록 호출부가 먼저 확인한다.
export function hasNaverApiHubCredentials() {
  loadDotenvFiles();
  return Boolean(process.env.NAVER_API_HUB_CLIENT_ID && process.env.NAVER_API_HUB_CLIENT_SECRET);
}

function authHeaders() {
  loadDotenvFiles();
  const id = process.env.NAVER_API_HUB_CLIENT_ID;
  const secret = process.env.NAVER_API_HUB_CLIENT_SECRET;
  if (!id || !secret) {
    throw new Error("NAVER_API_HUB_CLIENT_ID / NAVER_API_HUB_CLIENT_SECRET 환경변수가 없습니다 (.env 확인).");
  }
  return {
    "X-NCP-APIGW-API-KEY-ID": id,
    "X-NCP-APIGW-API-KEY": secret,
  };
}

async function request(pathname, { method = "GET", query, body } = {}) {
  const url = new URL(pathname, NAVER_API_HUB_BASE_URL);
  for (const [key, value] of Object.entries(query || {})) {
    if (value !== undefined && value !== null) url.searchParams.set(key, String(value));
  }

  const headers = authHeaders();
  if (body) headers["Content-Type"] = "application/json";

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`NAVER API HUB ${method} ${url.pathname} → ${response.status}: ${text.slice(0, 300)}`);
  }
  return JSON.parse(text);
}

const stripTags = (value = "") => value.replace(/<[^>]+>/g, "").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&").trim();

function normalizeItems(items = []) {
  return items.map((item) => ({ ...item, title: stripTags(item.title), description: stripTags(item.description) }));
}

// 블로그 검색. sort: "sim"(정확도) | "date"(최신순), display 최대 100, start 최대 1000
export async function searchBlog(query, { display = 10, start = 1, sort = "date" } = {}) {
  const data = await request("/search/v1/blog", { query: { query, display, start, sort } });
  return { ...data, items: normalizeItems(data.items) };
}

// 웹문서 검색. display 최대 100, start 최대 1000
export async function searchWeb(query, { display = 10, start = 1 } = {}) {
  const data = await request("/search/v1/webkr", { query: { query, display, start } });
  return { ...data, items: normalizeItems(data.items) };
}

// 데이터랩 검색어트렌드. keywordGroups: [{ groupName, keywords: [...] }] (최대 5그룹)
export async function searchTrend({ startDate, endDate, timeUnit = "week", keywordGroups, device, gender, ages } = {}) {
  return request("/search-trend/v1/search", {
    method: "POST",
    body: { startDate, endDate, timeUnit, keywordGroups, device, gender, ages },
  });
}

function isoDate(date) {
  return date.toISOString().slice(0, 10);
}

async function main() {
  const arg = process.argv.slice(2).find((value) => value.startsWith("--query="));
  const query = arg ? arg.slice("--query=".length) : "무신사";
  const today = new Date();
  const monthAgo = new Date(today.getTime() - 28 * 24 * 60 * 60 * 1000);

  const checks = [
    ["블로그", () => searchBlog(query, { display: 3 }).then((d) => `total ${d.total} · ${d.items.map((i) => i.title).join(" | ")}`)],
    ["웹문서", () => searchWeb(query, { display: 3 }).then((d) => `total ${d.total} · ${d.items.map((i) => i.title).join(" | ")}`)],
    ["검색어트렌드", () => searchTrend({
      startDate: isoDate(monthAgo),
      endDate: isoDate(today),
      timeUnit: "week",
      keywordGroups: [{ groupName: query, keywords: [query] }],
    }).then((d) => d.results[0].data.map((p) => `${p.period}:${p.ratio.toFixed(1)}`).join(" "))],
  ];

  let failed = 0;
  for (const [label, run] of checks) {
    try {
      console.log(`✔ ${label} — ${await run()}`);
    } catch (error) {
      failed += 1;
      console.error(`✘ ${label} — ${error.message}`);
    }
  }
  process.exitCode = failed ? 1 : 0;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
