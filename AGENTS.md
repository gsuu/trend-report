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
- Keep the DEV metadata `요약`, body `요약`, and `매거진 인사이트` layers distinct. Do not repeat the same sentence across these layers.
- Write the DEV body `요약` section only after opening the original source URL. Summarize important source facts, not the existing digest sentence. Do not force a fixed bullet count; include the meaningful points needed to represent the source.
- If the original source is a blog or opinion article rather than a product release note, summarize who is arguing what, which evidence or examples they use, and what CTTD can practically reference from it. Do not force it into a product-change framing.
- Each DEV technical-summary bullet must contain at least one concrete source detail such as a feature name, tool, API/property, browser/accessibility/performance condition, metric, limitation, or validation method.
- Use Markdown backticks/code tags only for code-related expressions such as commands, filenames, package names, APIs, CSS/HTML/ARIA properties, or config values. Do not wrap feature names, product names, Korean UI copy, quotes, or emphasis text in code style.
- Use the original source page's top or representative image (`og:image`/`twitter:image`, falling back to the first content image) as the DEV thumbnail.
- Preserve the practical web publisher/front-end angle: HTML/CSS, JavaScript, accessibility, performance, and AI/developer tooling.
- Do not use Notion for DEV publishing unless the user explicitly asks. After updating `runs/YYYY-MM-DD/magazine-report.md`, refresh magazine JSON/site data only.

## Design Digest Source Standard

When collecting DESIGN newsletter or magazine items, use `news-tracking/design-sources.json` and `npm run fetch:design` for candidate collection.

- After collection, the working AI must apply `docs/design-digest-agent-prompt.md` to select, summarize, categorize, and write DESIGN items. Do not call an LLM API from the collection script.
- Choose items because they are useful to UIUX designers, not because they are broadly newsworthy.
- Prioritize Korean UIUX cases and domestic promotion/event design examples when they show concrete screens, campaign structures, commerce modules, brand expressions, or offline-to-online experience flows. Use global references as supplements, not the default center of gravity.
- Prioritize references and non-development techniques that can be applied to real design work: UI patterns, visual systems, design systems, components, tokens, documentation, prototyping, handoff, content expression, brand experience, research methods, and design AI workflows.
- Exclude developer implementation topics such as CSS, JavaScript, browser APIs, build tooling, and accessibility implementation details. Route those to DEV instead.
- Do not publish a design item only because it is visually attractive, branded, or AI-related. The original source must show a concrete screen, system, workflow, method, or production technique.
- Use discovery sources such as design magazines only as leads. For main publication, trace the item to an official product blog, release note, newsroom, case page, design system documentation, or another reliable primary source where possible.
- Use the collected original article title as the title standard. Do not rewrite it into an overly editorial or interpretive title unless the user explicitly asks.
- Keep DESIGN `요약`, `디자인 포인트`, and `매거진 인사이트` layers distinct. Do not repeat the same sentence across these layers.
- Use Markdown backticks/code tags only for code-related expressions such as filenames, tools, APIs, CSS/HTML/ARIA properties, or config values. Do not wrap feature names, product names, Korean UI copy, quotes, or emphasis text in code style.
- Use the original source page's top or representative image (`og:image`/`twitter:image`, falling back to a relevant first content image) as the DESIGN thumbnail only when it supports the design reference.
- Do not use Notion for DESIGN publishing unless the user explicitly asks. After updating `runs/YYYY-MM-DD/magazine-report.md`, refresh magazine JSON/site data only.

## Korean Naturalization Skill

When translating, adapting, or polishing English source material into Korean for newsletter or magazine writing, use the installed `humanize-korean` skill as the Korean naturalization standard.

- The repository includes a vendored copy at `docs/agent-skills/humanize-korean/SKILL.md`.
- If `humanize-korean` is not installed in the current Codex environment, read and follow `docs/agent-skills/humanize-korean/SKILL.md` and the files under `docs/agent-skills/humanize-korean/references/`.
- Preserve source facts, product names, feature names, API/property names, version numbers, dates, and metrics.
- Use `humanize-korean` to remove translationese, AI-like phrasing, stiff English sentence order, and unnatural Korean rhythm.
- Do not use the skill to add claims, examples, numbers, or interpretations that are not present in the source.
- For code-related expressions such as commands, filenames, packages, APIs, CSS/HTML/ARIA properties, and config values, preserve the original technical spelling.
