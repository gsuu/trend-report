"""Remove a single article from magazine.json + magazine-report.md by number.

Usage: python scripts/remove_article.py <issueSlug> <number>
"""

from __future__ import annotations

import io
import json
import re
import sys
from pathlib import Path

if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

ROOT = Path(__file__).resolve().parents[1]
MAGAZINE_JSON = ROOT / "public" / "data" / "magazine.json"


def remove_from_json(issue_slug: str, number: str) -> dict | None:
    data = json.loads(MAGAZINE_JSON.read_text(encoding="utf-8"))
    issues = data["report"]["issues"]
    removed = None
    keep = []
    for issue in issues:
        if issue.get("issueSlug") == issue_slug and str(issue.get("number")) == str(number):
            removed = issue
            continue
        keep.append(issue)
    if removed is None:
        return None
    data["report"]["issues"] = keep
    MAGAZINE_JSON.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return removed


def remove_from_markdown(report_path: Path, number: str) -> bool:
    if not report_path.exists():
        return False
    text = report_path.read_text(encoding="utf-8")
    pattern = re.compile(
        rf"(?ms)^####\s+{re.escape(str(int(number)))}\.\s.*?(?=^####\s+\d+\.|^##\s|\Z)"
    )
    new_text, count = pattern.subn("", text)
    if not count:
        return False
    new_text = re.sub(r"\n{3,}", "\n\n", new_text)
    report_path.write_text(new_text, encoding="utf-8")
    return True


def main(argv: list[str]) -> int:
    if len(argv) < 3:
        print("usage: python scripts/remove_article.py <issueSlug> <number>")
        return 2
    issue_slug, number = argv[1], argv[2]
    removed = remove_from_json(issue_slug, number)
    if removed is None:
        print(f"not found: {issue_slug} #{number}")
        return 1
    print(f"removed from JSON: {issue_slug} #{number} - {removed.get('platform')} - {removed.get('takeawayHtml', '')[:60]}")
    report_path = ROOT / "runs" / issue_slug / "magazine" / "magazine-report.md"
    if remove_from_markdown(report_path, number):
        print(f"removed from {report_path}")
    else:
        print(f"not found in markdown: {report_path}")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
