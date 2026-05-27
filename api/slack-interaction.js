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
  let date = '';

  for (const block of payload.message.blocks) {
    if (block.type === 'section' && block.accessory?.action_id === 'toggle_item') {
      const [num, state] = block.accessory.value.split(':');
      const text = block.text?.text ?? '';
      const isManagerAdded = text.includes('➕ 매니저 추가');

      if (state === 'exclude') {
        if (!isManagerAdded) excluded.push(num);
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
    }
    if (block.type === 'context') {
      const m = block.elements?.[0]?.text?.match(/(\d{4}-\d{2}-\d{2})/);
      if (m) date = m[1];
    }
  }

  const repo = process.env.GITHUB_ARCHIVE_REPOSITORY;
  const token = process.env.GITHUB_ARCHIVE_TOKEN;
  const dispatchRes = await fetch(
    `https://api.github.com/repos/${repo}/actions/workflows/slack-shortlist-update.yml/dispatches`,
    {
      method: 'POST',
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ref: 'main',
        inputs: {
          date,
          excluded_items: excluded.join(','),
          added_items: added.length > 0 ? JSON.stringify(added) : '[]',
        },
      }),
    },
  );

  const ok = dispatchRes.status === 204;
  const statusText = ok
    ? `✅ *확정 완료* | 제외 *${excluded.length}건* | 추가 요청 *${added.length}건*\n반영 중입니다 — 잠시 후 shortlist가 업데이트됩니다.`
    : `⚠️ 확정 요청은 받았지만 워크플로 트리거에 실패했습니다 (HTTP ${dispatchRes.status}).\n수동으로 \`slack-shortlist-update.yml\`을 실행하세요.`;

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
