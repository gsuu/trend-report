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

When collecting and uploading DEV newsletter or magazine items, use the same selection standard as
`cttd/ai-tf`'s `news-tracking/weekly-digest/issue-YYYY-MM-DD.md` digest.

- Treat the `ai-tf` weekly DEV digest as the primary reference for DEV source scope and article quality.
- Include all DEV items that meet that digest standard, rather than over-pruning to only a few highlights.
- Use the DEV article titles from the `ai-tf` digest as the title standard. Do not rewrite them into overly editorial or interpretive titles unless the user explicitly asks.
- Use the DEV article descriptions/decks from the `ai-tf` digest summary as the description standard. Do not append generic technical-context filler to the list/card description.
- Write the DEV `기술 변화 요약` section as a list that summarizes the important original-source content. Do not force a fixed bullet count; include the meaningful points needed to represent the source.
- Use the original source page's top or representative image (`og:image`/`twitter:image`, falling back to the first content image) as the DEV thumbnail.
- Preserve the practical web publisher/front-end angle: HTML/CSS, JavaScript, accessibility, performance, and AI/developer tooling.
- Do not use Notion for DEV publishing unless the user explicitly asks. After updating `runs/YYYY-MM-DD/magazine-report.md`, refresh magazine JSON/site data only.
