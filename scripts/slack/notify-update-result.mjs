/**
 * GHA slack-shortlist-update.yml 의 commit step 이 끝난 뒤,
 * 원래 매니저 메시지의 스레드에 결과 후속 알림을 단다.
 *
 * 환경변수 (모두 GHA workflow env 에서 전달):
 *   SLACK_BOT_TOKEN
 *   SLACK_CHANNEL       — 원본 메시지 채널 ID
 *   SLACK_TS            — 원본 메시지 ts (스레드 부모)
 *   COMMITTED           — 'true' 면 커밋이 새로 생긴 것
 *   SHA                 — 새 커밋의 sha (COMMITTED=true 일 때만)
 *   REPO                — `owner/repo`
 *   DATE                — 대상 shortlist 날짜
 *   RUN_ID              — 현재 GHA run id
 *   EXCLUDED_COUNT, ADDED_COUNT, MOVED_COUNT  (선택)
 */
const {
  SLACK_BOT_TOKEN,
  SLACK_CHANNEL,
  SLACK_TS,
  COMMITTED,
  SHA,
  REPO,
  DATE,
  RUN_ID,
} = process.env;

if (!SLACK_BOT_TOKEN || !SLACK_CHANNEL || !SLACK_TS) {
  console.log('필수 환경변수 누락 — 후속 알림 스킵.');
  process.exit(0);
}

const runUrl = `https://github.com/${REPO}/actions/runs/${RUN_ID}`;
const shortSha = (SHA || '').slice(0, 7);
const text =
  COMMITTED === 'true'
    ? `✅ *shortlist 갱신 완료* — \`${DATE}\`\n` +
      `• 커밋: <https://github.com/${REPO}/commit/${SHA}|${shortSha}>\n` +
      `• 워크플로: <${runUrl}|run #${RUN_ID}>`
    : `ℹ️ *변경 사항 없음* — \`${DATE}\`\n` +
      `매니저 토글이 모두 기존 상태와 같았거나 적용할 항목이 없었습니다.\n` +
      `• 워크플로: <${runUrl}|run #${RUN_ID}>`;

const res = await fetch('https://slack.com/api/chat.postMessage', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    Authorization: `Bearer ${SLACK_BOT_TOKEN}`,
  },
  body: JSON.stringify({
    channel: SLACK_CHANNEL,
    thread_ts: SLACK_TS,
    text,
  }),
});
const data = await res.json();
if (!data.ok) {
  console.error('Slack 후속 알림 실패:', data.error);
  process.exit(1);
}
console.log('Slack 후속 알림 전송 완료:', data.ts);
