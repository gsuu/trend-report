#!/usr/bin/env python3
"""Build or backfill runs/<date>/source-date-audit.json from magazine-report.md.

The audit format expected by report_parser.py is a JSON array with entries:
  { "num": str, "platform": str, "title": str, "url": str, "status": int,
    "finalUrl": str, "date": "YYYY-MM-DD" }

Entries are sourced from the markdown's per-issue meta (`날짜:`, `출처:`, `출처 URL:`).
This is a manual-fill helper — it trusts the markdown as the verified source.
For new runs where the writer already verified dates via WebFetch, this is sufficient
and avoids the legacy audit-generation pipeline.

Usage: python build_source_date_audit.py runs/2026-04-29/magazine-report.md
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


ISSUE_HEADER = re.compile(r"^####\s+(\d+)\.\s+\[([^\]]+)\]\s*(.+?)\s*$")
META = re.compile(r"^-\s+([^:]+):\s*(.*)$")


def parse_issues(md_path: Path) -> list[dict]:
    issues: list[dict] = []
    current: dict | None = None
    in_meta = False
    for raw in md_path.read_text(encoding="utf-8").splitlines():
        line = raw.rstrip()
        m = ISSUE_HEADER.match(line)
        if m:
            if current and current.get("url"):
                issues.append(current)
            current = {
                "num": m.group(1).zfill(2),
                "platform": m.group(2).strip(),
                "title": m.group(3).strip(),
                "url": "",
                "status": 200,
                "finalUrl": "",
                "date": "",
            }
            in_meta = True
            continue
        if not current or not in_meta:
            continue
        if line.startswith("##### "):
            in_meta = False
            continue
        mm = META.match(line)
        if not mm:
            continue
        key = mm.group(1).strip()
        val = mm.group(2).strip()
        if key == "날짜":
            iso = re.search(r"\d{4}-\d{2}-\d{2}", val)
            if iso:
                current["date"] = iso.group(0)
        elif key == "출처 URL":
            current["url"] = val
            current["finalUrl"] = val
    if current and current.get("url"):
        issues.append(current)
    return issues


def merge_existing(existing: list[dict], generated: list[dict]) -> list[dict]:
    """Backfill empty `date` fields in `existing` from `generated` by URL match,
    keep extra audit fields (status codes, finalUrl differences) intact, and
    append entries from generated that are missing in existing."""
    by_url = {e.get("url", ""): e for e in existing}
    out = list(existing)
    for g in generated:
        cur = by_url.get(g["url"])
        if cur is None:
            out.append(g)
        else:
            if not cur.get("date") and g.get("date"):
                cur["date"] = g["date"]
            if not cur.get("finalUrl"):
                cur["finalUrl"] = g.get("finalUrl") or g["url"]
            if not cur.get("status"):
                cur["status"] = g.get("status", 200)
    return out


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("report", help="runs/<date>/magazine-report.md path (relative to repo root or absolute)")
    ap.add_argument("--write", action="store_true", help="write to disk")
    args = ap.parse_args()

    md = Path(args.report)
    if not md.is_absolute():
        md = ROOT / md
    if not md.exists():
        print(f"not found: {md}", file=sys.stderr)
        return 2

    audit_path = md.parent / "source-date-audit.json"

    generated = parse_issues(md)
    if not generated:
        print(f"no issues parsed from {md}", file=sys.stderr)
        return 3

    if audit_path.exists():
        try:
            existing = json.loads(audit_path.read_text(encoding="utf-8"))
            if not isinstance(existing, list):
                existing = []
        except json.JSONDecodeError:
            existing = []
        merged = merge_existing(existing, generated)
    else:
        merged = generated

    payload = json.dumps(merged, ensure_ascii=False, indent=2) + "\n"
    if args.write:
        audit_path.write_text(payload, encoding="utf-8")
        print(f"wrote {len(merged)} entries -> {audit_path.relative_to(ROOT)}")
    else:
        sys.stdout.write(payload)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
