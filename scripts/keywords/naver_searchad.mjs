// 네이버 검색광고 API 클라이언트 — 키워드도구(연관키워드 + 월간 검색수).
// 검색광고 계정(searchad.naver.com) > 도구 > API 사용 관리에서 발급한 키를 쓴다. 광고 집행 없이 무료.
//   NAVER_SEARCHAD_API_KEY      액세스라이선스
//   NAVER_SEARCHAD_SECRET_KEY   비밀키
//   NAVER_SEARCHAD_CUSTOMER_ID  CUSTOMER_ID (숫자)
//
// 점검: npm run naver:searchad-check -- --hint=촬영스튜디오
import crypto from "node:crypto";
import { pathToFileURL } from "node:url";
import { argValue, loadDotenv } from "./env.mjs";

export const SEARCHAD_BASE_URL = "https://api.searchad.naver.com";
export const MAX_HINTS_PER_CALL = 5;

const RETRY_COUNT = 3;
const RETRY_BASE_DELAY_MS = 1500;

export function hasSearchAdCredentials() {
  loadDotenv();
  return Boolean(
    process.env.NAVER_SEARCHAD_API_KEY &&
      process.env.NAVER_SEARCHAD_SECRET_KEY &&
      process.env.NAVER_SEARCHAD_CUSTOMER_ID,
  );
}

function credentials() {
  if (!hasSearchAdCredentials()) {
    throw new Error(
      "NAVER_SEARCHAD_API_KEY / NAVER_SEARCHAD_SECRET_KEY / NAVER_SEARCHAD_CUSTOMER_ID 환경변수가 없습니다 (.env 또는 .env.local 확인).",
    );
  }
  return {
    apiKey: process.env.NAVER_SEARCHAD_API_KEY,
    secretKey: process.env.NAVER_SEARCHAD_SECRET_KEY,
    customerId: process.env.NAVER_SEARCHAD_CUSTOMER_ID,
  };
}

// 서명 = base64(HMAC-SHA256(secret, "{timestamp}.{METHOD}.{path}")). path에는 쿼리스트링을 넣지 않는다.
export function signRequest({ timestamp, method, pathname, secretKey }) {
  return crypto.createHmac("sha256", secretKey).update(`${timestamp}.${method}.${pathname}`).digest("base64");
}

// 키워드도구는 힌트 키워드에 공백을 허용하지 않는다.
export function normalizeHint(keyword = "") {
  return String(keyword).replace(/\s+/g, "").trim();
}

// "< 10" 같은 문자열 검색수는 0으로 본다(정렬용). 표시할 때는 원본을 그대로 쓴다.
export function parseCount(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const text = String(value ?? "").trim();
  if (!text || text.startsWith("<")) return 0;
  const number = Number(text.replace(/,/g, ""));
  return Number.isFinite(number) ? number : 0;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function request(pathname, { method = "GET", query } = {}) {
  const { apiKey, secretKey, customerId } = credentials();
  const url = new URL(pathname, SEARCHAD_BASE_URL);
  for (const [key, value] of Object.entries(query || {})) {
    if (value !== undefined && value !== null) url.searchParams.set(key, String(value));
  }

  let lastError;
  for (let attempt = 0; attempt < RETRY_COUNT; attempt += 1) {
    const timestamp = String(Date.now());
    const response = await fetch(url, {
      method,
      headers: {
        "X-Timestamp": timestamp,
        "X-API-KEY": apiKey,
        "X-Customer": customerId,
        "X-Signature": signRequest({ timestamp, method, pathname, secretKey }),
        "Content-Type": "application/json; charset=UTF-8",
      },
    });
    const text = await response.text();
    if (response.ok) return JSON.parse(text);

    lastError = new Error(`NAVER SearchAd ${method} ${pathname} → ${response.status}: ${text.slice(0, 300)}`);
    // 429(한도)·5xx만 재시도. 4xx 인증/파라미터 오류는 바로 실패.
    if (response.status !== 429 && response.status < 500) throw lastError;
    await sleep(RETRY_BASE_DELAY_MS * (attempt + 1));
  }
  throw lastError;
}

// 연관키워드 조회. hintKeywords 최대 5개. 반환 행:
// { relKeyword, monthlyPcQcCnt, monthlyMobileQcCnt, monthlyAvePcClkCnt, monthlyAveMobileClkCnt,
//   monthlyAvePcCtr, monthlyAveMobileCtr, plAvgDepth, compIdx("낮음"|"중간"|"높음") }
export async function relatedKeywords(hintKeywords, { showDetail = 1 } = {}) {
  const hints = [...new Set((hintKeywords || []).map(normalizeHint).filter(Boolean))];
  if (!hints.length) return [];
  if (hints.length > MAX_HINTS_PER_CALL) {
    throw new Error(`힌트 키워드는 한 번에 최대 ${MAX_HINTS_PER_CALL}개입니다 (받은 값 ${hints.length}개).`);
  }
  const data = await request("/keywordstool", { query: { hintKeywords: hints.join(","), showDetail } });
  return Array.isArray(data?.keywordList) ? data.keywordList : [];
}

export function chunk(list, size) {
  const out = [];
  for (let index = 0; index < list.length; index += size) out.push(list.slice(index, index + size));
  return out;
}

async function main() {
  const hint = argValue("--hint", "촬영스튜디오");
  const rows = await relatedKeywords([hint]);
  const sorted = rows
    .map((row) => ({ ...row, total: parseCount(row.monthlyPcQcCnt) + parseCount(row.monthlyMobileQcCnt) }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);
  console.log(`✔ 키워드도구 — "${hint}" 연관 ${rows.length}건, 상위 10:`);
  for (const row of sorted) {
    console.log(`  ${row.relKeyword}  PC ${row.monthlyPcQcCnt} / 모바일 ${row.monthlyMobileQcCnt} / 경쟁 ${row.compIdx}`);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(`✘ ${error.message}`);
    process.exitCode = 1;
  });
}
