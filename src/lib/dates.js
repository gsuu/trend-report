// 발행일 필터링용 날짜 유틸 (KST 기준). App.vue에서 분리 — 순수 함수.

function kstTodayStart() {
  const now = new Date();
  const kstNow = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return new Date(Date.UTC(
    kstNow.getUTCFullYear(),
    kstNow.getUTCMonth(),
    kstNow.getUTCDate(),
  ));
}

export function recentDaysRange(days) {
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

export function isDateInRange(value, range) {
  const date = dateFromIsoDay(value);
  if (!date || !range) return false;
  return date >= range.start && date < range.end;
}

export function issuePublicationDate(issue) {
  return issue?.publicationDate || issue?.issueSlug || issue?.date || "";
}
