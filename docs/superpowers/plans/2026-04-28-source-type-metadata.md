# Source Type Metadata Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add article source-type metadata to `magazine-report.md` parsing and exported magazine JSON so article templates can vary by source character.

**Architecture:** Keep the existing Markdown metadata format and add one optional line, `- 출처 유형: <type>`. The parser normalizes that value into stable JSON fields, while editorial docs define how each type changes writing structure.

**Tech Stack:** Python parser/export scripts, Markdown operating docs, JSON output under `public/data/magazine.json`.

---

### Task 1: Parser Source Type Normalization

**Files:**
- Modify: `scripts/notion/report_parser.py`

- [ ] Add source-type constants near the existing category constants.
- [ ] Add `issue_source_type(issue)` and `issue_source_type_label(issue)` helpers.
- [ ] Include `sourceType` and `sourceTypeLabel` in `report_payload()`.
- [ ] Hide raw `출처 유형` from generic `facts` so the site can render it intentionally later.

### Task 2: Editorial Documentation

**Files:**
- Modify: `docs/editorial-style-guide.md`
- Modify: `docs/dev-digest-agent-prompt.md`
- Modify: `docs/design-digest-agent-prompt.md`

- [ ] Document the supported source types: `news`, `release_note`, `blog_opinion`, `reference`, `guide`, `research`.
- [ ] Require `출처 유형` in new `magazine-report.md` items.
- [ ] Explain how writing changes by source type without multiplying templates.

### Task 3: Verification

**Files:**
- Read: `runs/2026-04-28/magazine-report.md`
- Generated: temporary JSON through `scripts/notion/export_magazine_json.py`

- [ ] Run the exporter against the current run.
- [ ] Verify old articles without `출처 유형` export as `sourceType: "unknown"`.
- [ ] Confirm UTF-8 Korean output is readable on Windows.
