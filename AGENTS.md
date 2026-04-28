# Project Operating Rules

## Newsletter Approval Flow

When the user provides a PDF, asks to collect source material, and then asks to send the newsletter:

1. Build the report and magazine site from the collected material.
2. Push the site/data changes to the repository.
3. Use `https://magazine.cttd.co.kr` as `MAGAZINE_BASE_URL`.
4. Send the first test email only to `jisuk@cttd.co.kr`.
5. Wait for the user's explicit confirmation that the test email is okay.
6. After confirmation, send the final email to `cxd@cttd.co.kr`.

Do not send directly to `cxd@cttd.co.kr` before the test email has been confirmed.

## DEV Digest Source Standard

When collecting and uploading DEV newsletter or magazine items, reproduce the same collection logic as
`cttd/ai-tf`'s DEV digest generator. Do not treat `news-tracking/weekly-digest/issue-YYYY-MM-DD.md` as the source of truth; use it only as a verification sample.

- Use `news-tracking/dev-sources.json` and `npm run fetch:dev` for DEV candidate collection. This mirrors the `ai-tf` RSS source groups and 7-day window.
- After collection, the working AI must apply `docs/dev-digest-agent-prompt.md` to select, summarize, categorize, and write DEV items. Do not call an LLM API from the collection script.
- Include all DEV items that pass the prompt criteria, rather than over-pruning to only a few highlights.
- Use the collected original article title as the title standard. Do not rewrite it into an overly editorial or interpretive title unless the user explicitly asks.
- Add a DEV `요약` metadata line for the article-header deck. It should be a 1-2 sentence reader-facing summary, not a copy of the technical-summary bullets.
- Keep the DEV `요약`, `기술 변화 요약`, and `매거진 인사이트` layers distinct. Do not repeat the same sentence across these layers.
- Write the DEV `기술 변화 요약` section only after opening the original source URL. Summarize important source facts, not the existing digest sentence. Do not force a fixed bullet count; include the meaningful points needed to represent the source.
- Each DEV technical-summary bullet must contain at least one concrete source detail such as a feature name, tool, API/property, browser/accessibility/performance condition, metric, limitation, or validation method.
- Use the original source page's top or representative image (`og:image`/`twitter:image`, falling back to the first content image) as the DEV thumbnail.
- Preserve the practical web publisher/front-end angle: HTML/CSS, JavaScript, accessibility, performance, and AI/developer tooling.
- Do not use Notion for DEV publishing unless the user explicitly asks. After updating `runs/YYYY-MM-DD/magazine-report.md`, refresh magazine JSON/site data only.
