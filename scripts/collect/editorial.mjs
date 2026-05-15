// scripts/collect/editorial.mjs
// Stage 2: 통과 + 본문 보강된 아티클 각각에 대해 풍부 에디토리얼 JSON 생성

import Anthropic from "@anthropic-ai/sdk";
import { EDITORIAL_SYSTEM_PROMPT } from "./prompts.mjs";

const MODEL = "claude-haiku-4-5";

/**
 * @param {import('./types.mjs').EnrichedArticle} article
 * @returns {Promise<Partial<import('./types.mjs').Issue> | null>}
 */
export async function generateEditorial(article) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY 미설정");
  const client = new Anthropic({ apiKey });

  const userInput = JSON.stringify({
    title: article.title,
    sourceName: article.sourceName,
    url: article.link,
    pubDate: article.pubDate,
    ogDescription: article.ogDescription,
    fullText: article.fullText,
    suggestedTags: article.tags,
  });

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 4096,
      system: EDITORIAL_SYSTEM_PROMPT,
      messages: [{ role: "user", content: userInput }],
    });
    const text = response.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n");
    const obj = JSON.parse(extractJsonObject(text));
    return obj;
  } catch (err) {
    console.error(`[editorial] ${article.link} 실패: ${err.message}`);
    return null;
  }
}

function extractJsonObject(text) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("JSON 객체 미포함");
  return text.slice(start, end + 1);
}
