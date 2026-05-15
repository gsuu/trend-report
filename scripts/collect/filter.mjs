// scripts/collect/filter.mjs
// Stage 1: Claude Haiku 배치로 후보 필터링 — 관련도 점수 + 카테고리 재분류 + 태그

import Anthropic from "@anthropic-ai/sdk";
import { FILTER_SYSTEM_PROMPT, FILTER_RELEVANCE_CUTOFF } from "./prompts.mjs";

const MODEL = "claude-haiku-4-5";

/**
 * @param {import('./types.mjs').RawCandidate[]} candidates
 * @returns {Promise<import('./types.mjs').FilterVerdict[]>}
 */
export async function filterCandidates(candidates) {
  if (!candidates.length) return [];
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY 미설정");

  const client = new Anthropic({ apiKey });

  const chunks = chunk(candidates, 40);
  const verdicts = [];

  for (const part of chunks) {
    const userInput = JSON.stringify(
      part.map((c) => ({
        id: c.id,
        title: c.title,
        snippet: c.contentSnippet?.slice(0, 400) ?? "",
        source: c.sourceName,
        sourceCategoryHint: c.sourceCategory,
        locale: c.locale,
      })),
    );

    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 4096,
      system: FILTER_SYSTEM_PROMPT,
      messages: [{ role: "user", content: userInput }],
    });

    const text = response.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n");

    try {
      const parsed = JSON.parse(extractJsonArray(text));
      for (const v of parsed) {
        if (v.relevance >= FILTER_RELEVANCE_CUTOFF) verdicts.push(v);
      }
    } catch (err) {
      console.error(`[filter] JSON 파싱 실패: ${err.message}\n원문: ${text.slice(0, 300)}`);
    }
  }

  return verdicts;
}

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function extractJsonArray(text) {
  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");
  if (start === -1 || end === -1) throw new Error("JSON 배열 미포함");
  return text.slice(start, end + 1);
}
