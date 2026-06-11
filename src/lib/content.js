// 매거진 본문 HTML 가공 유틸 (프로즈 블록/요약 테이블/용어 글로서리).
// App.vue에서 분리 — 컴포넌트 반응형 상태에 의존하지 않는 순수 함수.

const TABLE_LABELS = ["업데이트", "핵심 업데이트", "핵심 내용", "주요 항목", "서비스 맥락", "디자인 맥락", "기술 맥락", "변경 전", "변경 후", "수치·팩트", "수치/팩트"];
const ASCII_WORD = /[A-Za-z0-9_]/;

export function plainText(htmlText) {
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

export function proseBlocks(blocks = []) {
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
  const checklistConverted = mergedBlocks.map((block) => {
    if (block.kind === "subhead") {
      lastSubheadIsChecklist = /점검\s*질문/.test(plainText(block.html));
      return block;
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

function splitLabelValue(text) {
  const colonMatch = String(text).match(/^([^:：]{2,18})[:：]\s*(.+)$/);
  if (colonMatch) return { label: colonMatch[1].trim(), value: colonMatch[2] };
  const dashMatch = String(text).match(/^(.{2,18}?)\s+[—–]\s+(.+)$/);
  if (dashMatch) return { label: dashMatch[1].trim(), value: dashMatch[2] };
  return null;
}

export function formatSummaryItem(item) {
  const parsed = splitLabelValue(item);
  if (!parsed) return String(item);
  return `<span class="summary-key">${parsed.label}</span><span class="summary-value">${parsed.value}</span>`;
}

export function isTableSection(section) {
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

export function isTermExplanation(section) {
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

export function buildGlossary(section) {
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

export function applyGlossaryToHtml(html, glossary, used) {
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
