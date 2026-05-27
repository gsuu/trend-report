/**
 * Slack Interactive Components 웹훅 핸들러.
 * 매니저가 shortlist 메시지에서 버튼을 클릭하면 이 엔드포인트로 요청이 온다.
 *
 * 지원하는 액션:
 *   toggle_item       - 항목 포함/제외 토글
 *   confirm_shortlist - 확정 후 GHA slack-shortlist-update.yml 트리거
 *   add_item          - 항목 추가 모달 열기
 *   view_submission   - 모달 제출 처리 (add_item_modal)
 *
 * 필요한 Slack App Bot Token Scopes:
 *   chat:write, chat:write.public, channels:read,
 *   channels:history, groups:history, im:history
 *
 * 필요한 환경변수:
 *   SLACK_BOT_TOKEN
 *   SLACK_SIGNING_SECRET
 *   GITHUB_ARCHIVE_TOKEN       (workflow_dispatch 트리거용, repo workflow 권한 필요)
 *   GITHUB_ARCHIVE_REPOSITORY  (예: gsuu/trend-report)
 *
 * 이 핸들러는 newsletter 발송(weekly-newsletters.js)과 완전히 별개 엔드포인트.
 */
import crypto from 'node:crypto';

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function verifySignature(secret, timestamp, body, sig) {
  if (!secret) return { ok: false, reason: 'SLACK_SIGNING_SECRET env var is missing on Vercel' };
  if (!timestamp) return { ok: false, reason: 'missing x-slack-request-timestamp header' };
  if (!sig) return { ok: false, reason: 'missing x-slack-signature header' };
  const ageSec = Math.floor(Date.now() / 1000) - Number(timestamp);
  if (ageSec > 300) return { ok: false, reason: `request timestamp too old (${ageSec}s)` };
  const hmac = crypto
    .createHmac('sha256', secret)
    .update(`v0:${timestamp}:${body}`)
    .digest('hex');
  const expected = `v0=${hmac}`;
  try {
    const match = crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
    return match
      ? { ok: true }
      : { ok: false, reason: 'signature mismatch — check SLACK_SIGNING_SECRET value (whitespace / quotes / wrong app)' };
  } catch {
    return { ok: false, reason: 'signature buffer length mismatch' };
  }
}

async function slackApi(method, body) {
  const res = await fetch(`https://slack.com/api/${method}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}`,
    },
    body: JSON.stringify(body),
  });
  return res.json();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end('Method Not Allowed');
  }

  const rawBody = await getRawBody(req);

  // Slack URL verification challenge (JSON body)
  if (req.headers['content-type']?.includes('application/json')) {
    try {
      const data = JSON.parse(rawBody);
      if (data.type === 'url_verification') {
        return res.status(200).json({ challenge: data.challenge });
      }
    } catch {
      // not JSON
    }
  }

  // Slack signature verification
  const ts = req.headers['x-slack-request-timestamp'];
  const sig = req.headers['x-slack-signature'];
  const verification = verifySignature(process.env.SLACK_SIGNING_SECRET, ts, rawBody, sig);
  if (!verification.ok) {
    console.error('[slack-interaction] signature verification failed:', verification.reason);
    return res.status(401).end(`Unauthorized: ${verification.reason}`);
  }

  // Slack interactions: URL-encoded with "payload" key
  const params = new URLSearchParams(rawBody);
  const raw = params.get('payload');
  if (!raw) return res.status(400).end('Missing payload');

  let payload;
  try {
    payload = JSON.parse(raw);
  } catch {
    return res.status(400).end('Invalid payload JSON');
  }

  if (payload.type === 'block_actions') {
    const action = payload.actions?.[0];
    if (!action) return res.status(200).end();

    console.log(`[slack-interaction] block_actions: ${action.action_id}, value=${action.value ?? '-'}`);
    try {
      if (action.action_id === 'toggle_item') {
        await handleToggle(payload, action);
      } else if (action.action_id === 'confirm_shortlist') {
        await handleConfirm(payload);
      } else if (action.action_id === 'add_item') {
        await handleOpenAddModal(payload);
      } else if (action.action_id === 'move_category') {
        await handleOpenMoveModal(payload);
      }
    } catch (err) {
      console.error(`[slack-interaction] handler ${action.action_id} failed:`, err);
    }
    return res.status(200).end();
  }

  if (payload.type === 'view_submission' && payload.view?.callback_id === 'add_item_modal') {
    await handleAddSubmission(payload);
    return res.status(200).json({ response_action: 'clear' });
  }

  if (payload.type === 'view_submission' && payload.view?.callback_id === 'move_category_modal') {
    await handleMoveSubmission(payload);
    return res.status(200).json({ response_action: 'clear' });
  }

  return res.status(200).end();
}

// ─── 핸들러 ──────────────────────────────────────────────────────

async function handleToggle(payload, action) {
  const [num, current] = action.value.split(':');
  const next = current === 'include' ? 'exclude' : 'include';

  const updatedBlocks = payload.message.blocks.map(block => {
    if (
      block.type === 'section' &&
      block.accessory?.action_id === 'toggle_item' &&
      block.accessory.value.startsWith(`${num}:`)
    ) {
      return {
        ...block,
        accessory: {
          ...block.accessory,
          text: { type: 'plain_text', text: next === 'include' ? '✅ 포함' : '❌ 제외' },
          style: next === 'include' ? 'primary' : 'danger',
          value: `${num}:${next}`,
        },
      };
    }
    return block;
  });

  await slackApi('chat.update', {
    channel: payload.container.channel_id,
    ts: payload.message.ts,
    blocks: updatedBlocks,
  });
}

async function handleConfirm(payload) {
  const excluded = [];
  const added = [];
  const moved = [];
  let date = '';

  for (const block of payload.message.blocks) {
    if (block.type === 'section' && block.accessory?.action_id === 'toggle_item') {
      const value = block.accessory.value ?? '';
      const [rawNum, state] = value.split(':');
      const text = block.text?.text ?? '';
      const isManagerAdded = text.includes('➕ 매니저 추가');
      const isCandidate = rawNum.startsWith('c'); // 'C후보' 블록 (다시 볼 만한 제외 항목)

      // 1) 애매 후보 — ✅ 복원만 처리 (added 로 합산), ❌ 유지면 무시
      if (isCandidate) {
        if (state === 'include') {
          // 후보 블록 텍스트 포맷: `*C\d+\.* [CAT] 제목\n<url|원문 보기>\n_조건: ..._`
          const titleM = text.match(/\*C\d+\.\*\s*\[([A-Z]+)\]\s*([^\n]+)/);
          const urlM = text.match(/<(https?[^|>]+)\|/);
          if (titleM) {
            added.push({
              url: urlM?.[1] ?? '',
              category: titleM[1],
              title: titleM[2].trim(),
            });
          }
        }
        continue;
      }

      // 2) 메인 항목
      if (state === 'exclude') {
        if (!isManagerAdded) excluded.push(rawNum);
      } else if (isManagerAdded) {
        const urlM = text.match(/<(https?[^|>]+)/);
        const catM = text.match(/\[([A-Z]+)\]/);
        const titleM = text.match(/\n([^\n]+)\n/);
        added.push({
          url: urlM?.[1] ?? '',
          category: catM?.[1] ?? '',
          title: titleM?.[1] ?? '',
        });
      }

      // 카테고리 이동 표식 `[→ DEV]` 가 있으면 수집 (제외되지 않은 항목만)
      if (state !== 'exclude' && !isManagerAdded) {
        const moveM = text.match(/\[→\s*(SERVICE|DESIGN|DEV)\]/);
        if (moveM) moved.push({ num: parseInt(rawNum, 10), to: moveM[1] });
      }
    }
    if (block.type === 'context') {
      const m = block.elements?.[0]?.text?.match(/(\d{4}-\d{2}-\d{2})/);
      if (m) date = m[1];
    }
  }

  const repo = process.env.GITHUB_DISPATCH_REPO || process.env.GITHUB_ARCHIVE_REPOSITORY;
  const repoSource = process.env.GITHUB_DISPATCH_REPO ? 'GITHUB_DISPATCH_REPO' : 'GITHUB_ARCHIVE_REPOSITORY';
  const token = process.env.GITHUB_DISPATCH_TOKEN || process.env.GITHUB_ARCHIVE_TOKEN;
  const tokenSource = process.env.GITHUB_DISPATCH_TOKEN ? 'GITHUB_DISPATCH_TOKEN' : 'GITHUB_ARCHIVE_TOKEN';

  if (!repo) {
    console.error('[slack-interaction] dispatch aborted: repo env var is missing');
  }
  if (!token) {
    console.error('[slack-interaction] dispatch aborted: token env var is missing');
  }
  const dispatchUrl = `https://api.github.com/repos/${repo}/actions/workflows/slack-shortlist-update.yml/dispatches`;

  console.log(`[slack-interaction] dispatch → ${dispatchUrl} (token=${tokenSource}, repo=${repo})`);

  const dispatchRes = await fetch(dispatchUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
      'User-Agent': 'cttd-magazine-slack-bot',
    },
    body: JSON.stringify({
      ref: 'main',
      inputs: {
        date,
        excluded_items: excluded.join(','),
        added_items: added.length > 0 ? JSON.stringify(added) : '[]',
        moved_items: moved.length > 0 ? JSON.stringify(moved) : '[]',
      },
    }),
  });

  const ok = dispatchRes.status === 204;
  let errBody = '';
  if (!ok) {
    try { errBody = await dispatchRes.text(); } catch {}
    console.error(`[slack-interaction] dispatch failed: HTTP ${dispatchRes.status}\n${errBody}`);
  }

  const statusText = ok
    ? `✅ *확정 완료* | 제외 *${excluded.length}건* | 이동 *${moved.length}건* | 추가 요청 *${added.length}건*\n반영 중입니다 — 잠시 후 shortlist가 업데이트됩니다.`
    : `⚠️ 확정 요청은 받았지만 워크플로 트리거에 실패했습니다 (HTTP ${dispatchRes.status}).\n` +
      `\`\`\`\nrepo (${repoSource}):  ${repo || '(미설정)'}\ntoken (${tokenSource}): ${token ? '설정됨' : '(미설정)'}\n${errBody || '(응답 본문 없음)'}\n\`\`\`\n` +
      `수동으로 \`slack-shortlist-update.yml\`을 실행하세요.`;

  const finalBlocks = [
    ...payload.message.blocks.filter(b => b.type !== 'actions'),
    { type: 'section', text: { type: 'mrkdwn', text: statusText } },
  ];

  await slackApi('chat.update', {
    channel: payload.container.channel_id,
    ts: payload.message.ts,
    blocks: finalBlocks,
  });
}

async function handleOpenAddModal(payload) {
  let date = '';
  for (const block of payload.message.blocks) {
    if (block.type === 'context') {
      const m = block.elements?.[0]?.text?.match(/(\d{4}-\d{2}-\d{2})/);
      if (m) { date = m[1]; break; }
    }
  }

  await slackApi('views.open', {
    trigger_id: payload.trigger_id,
    view: {
      type: 'modal',
      callback_id: 'add_item_modal',
      private_metadata: JSON.stringify({
        channel: payload.container.channel_id,
        message_ts: payload.message.ts,
        date,
      }),
      title: { type: 'plain_text', text: '항목 추가' },
      submit: { type: 'plain_text', text: '추가' },
      close: { type: 'plain_text', text: '취소' },
      blocks: [
        {
          type: 'input',
          block_id: 'url_block',
          label: { type: 'plain_text', text: '원문 URL' },
          element: {
            type: 'plain_text_input',
            action_id: 'url',
            placeholder: { type: 'plain_text', text: 'https://...' },
          },
        },
        {
          type: 'input',
          block_id: 'title_block',
          label: { type: 'plain_text', text: '제목' },
          element: {
            type: 'plain_text_input',
            action_id: 'title',
            placeholder: { type: 'plain_text', text: '글 제목을 입력하세요' },
          },
        },
        {
          type: 'input',
          block_id: 'category_block',
          label: { type: 'plain_text', text: '카테고리' },
          element: {
            type: 'static_select',
            action_id: 'category',
            placeholder: { type: 'plain_text', text: '선택' },
            options: [
              { text: { type: 'plain_text', text: 'SERVICE' }, value: 'SERVICE' },
              { text: { type: 'plain_text', text: 'DESIGN' }, value: 'DESIGN' },
              { text: { type: 'plain_text', text: 'DEV' }, value: 'DEV' },
            ],
          },
        },
      ],
    },
  });
}

async function handleOpenMoveModal(payload) {
  await slackApi('views.open', {
    trigger_id: payload.trigger_id,
    view: {
      type: 'modal',
      callback_id: 'move_category_modal',
      private_metadata: JSON.stringify({
        channel: payload.container.channel_id,
        message_ts: payload.message.ts,
      }),
      title: { type: 'plain_text', text: '카테고리 이동' },
      submit: { type: 'plain_text', text: '이동' },
      close: { type: 'plain_text', text: '취소' },
      blocks: [
        {
          type: 'input',
          block_id: 'nums_block',
          label: { type: 'plain_text', text: '이동할 항목 번호 (쉼표 구분)' },
          element: {
            type: 'plain_text_input',
            action_id: 'nums',
            placeholder: { type: 'plain_text', text: '예: 5, 8' },
          },
        },
        {
          type: 'input',
          block_id: 'target_block',
          label: { type: 'plain_text', text: '이동할 카테고리' },
          element: {
            type: 'static_select',
            action_id: 'target',
            placeholder: { type: 'plain_text', text: '선택' },
            options: [
              { text: { type: 'plain_text', text: 'SERVICE' }, value: 'SERVICE' },
              { text: { type: 'plain_text', text: 'DESIGN' }, value: 'DESIGN' },
              { text: { type: 'plain_text', text: 'DEV' }, value: 'DEV' },
            ],
          },
        },
        {
          type: 'context',
          elements: [{
            type: 'mrkdwn',
            text: '여러 항목을 한 번에 이동 가능. 같은 카테고리로 다시 이동하면 표식이 제거됩니다.',
          }],
        },
      ],
    },
  });
}

async function handleMoveSubmission(payload) {
  const vals = payload.view.state.values;
  const numsRaw = vals.nums_block?.nums?.value ?? '';
  const target = vals.target_block?.target?.selected_option?.value ?? '';
  const { channel, message_ts } = JSON.parse(payload.view.private_metadata);

  const nums = numsRaw
    .split(/[,\s]+/)
    .map(s => parseInt(s.replace(/[^\d]/g, ''), 10))
    .filter(n => !isNaN(n));
  if (nums.length === 0 || !target) return;
  const numSet = new Set(nums.map(String));

  // 현재 메시지 블록 조회 (channels:history 스코프 필요)
  const histRes = await fetch(
    `https://slack.com/api/conversations.history?channel=${channel}&latest=${message_ts}&limit=1&inclusive=true`,
    { headers: { Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}` } },
  );
  const histData = await histRes.json();
  const currentBlocks = histData.messages?.[0]?.blocks ?? [];

  const updatedBlocks = currentBlocks.map(block => {
    if (block.type !== 'section' || block.accessory?.action_id !== 'toggle_item') return block;
    const [num] = (block.accessory.value ?? '').split(':');
    if (!numSet.has(num)) return block;

    // 텍스트에서 기존 `[→ X]` 토큰 제거
    let text = (block.text?.text ?? '').replace(/\s*\[→\s*(?:SERVICE|DESIGN|DEV)\]/g, '');

    // 현재 항목이 이미 target 카테고리에 있는지 확인 — 있다면 표식만 제거하고 끝
    // (블록의 상위 컨텍스트에서 카테고리를 알 수 없으므로, 같은 target으로 두 번 누르면
    //  표식이 토글되도록 구현)
    const wasInTarget = (block.text?.text ?? '').includes(`[→ ${target}]`);
    if (!wasInTarget) {
      // 제목 뒤 (원문 보기 줄 앞)에 토큰 삽입
      const newlineIdx = text.indexOf('\n');
      text = newlineIdx >= 0
        ? `${text.slice(0, newlineIdx)} \`[→ ${target}]\`${text.slice(newlineIdx)}`
        : `${text} \`[→ ${target}]\``;
    }

    return { ...block, text: { ...block.text, text } };
  });

  await slackApi('chat.update', { channel, ts: message_ts, blocks: updatedBlocks });
}

async function handleAddSubmission(payload) {
  const vals = payload.view.state.values;
  const url = vals.url_block?.url?.value?.trim() ?? '';
  const title = vals.title_block?.title?.value?.trim() ?? '';
  const category = vals.category_block?.category?.selected_option?.value ?? 'SERVICE';
  const { channel, message_ts } = JSON.parse(payload.view.private_metadata);

  // 현재 메시지 블록 조회 (channels:history 스코프 필요)
  const histRes = await fetch(
    `https://slack.com/api/conversations.history?channel=${channel}&latest=${message_ts}&limit=1&inclusive=true`,
    { headers: { Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}` } },
  );
  const histData = await histRes.json();
  const currentBlocks = histData.messages?.[0]?.blocks ?? [];

  let maxNum = 0;
  for (const block of currentBlocks) {
    if (block.type === 'section' && block.accessory?.action_id === 'toggle_item') {
      const n = parseInt(block.accessory.value.split(':')[0], 10);
      if (n > maxNum) maxNum = n;
    }
  }
  const newNum = maxNum + 1;

  const newBlock = {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `*${newNum}. [${category}]* ➕ 매니저 추가\n${title}\n<${url}|원문 보기>`,
    },
    accessory: {
      type: 'button',
      text: { type: 'plain_text', text: '✅ 포함' },
      style: 'primary',
      action_id: 'toggle_item',
      value: `${newNum}:include`,
    },
  };

  const actionsIdx = currentBlocks.findIndex(b => b.type === 'actions');
  const updatedBlocks =
    actionsIdx >= 0
      ? [...currentBlocks.slice(0, actionsIdx), newBlock, ...currentBlocks.slice(actionsIdx)]
      : [...currentBlocks, newBlock];

  await slackApi('chat.update', {
    channel,
    ts: message_ts,
    blocks: updatedBlocks,
  });
}
