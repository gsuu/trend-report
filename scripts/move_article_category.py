"""Move an article between top-level categories (service/design/dev) in magazine.json.

Usage: python scripts/move_article_category.py <issueSlug> <number> <newAreaKey>

Updates: areaKey, area, categoryKey (best guess) and any cross-references.
"""

from __future__ import annotations

import io
import json
import sys
from pathlib import Path

if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

ROOT = Path(__file__).resolve().parents[1]
MAGAZINE_JSON = ROOT / "public" / "data" / "magazine.json"

AREA_LABELS = {"service": "Service", "design": "Design", "dev": "DEV"}
DEFAULT_DEV_CATEGORY = ("ai", "AI")  # categoryKey, category for AI-leaning DEV pieces


def move_article(issue_slug: str, number: str, new_area: str) -> dict | None:
    if new_area not in AREA_LABELS:
        raise SystemExit(f"unknown area: {new_area}")
    data = json.loads(MAGAZINE_JSON.read_text(encoding="utf-8"))
    issues = data["report"]["issues"]
    target = None
    for issue in issues:
        if issue.get("issueSlug") == issue_slug and str(issue.get("number")) == str(number):
            target = issue
            break
    if target is None:
        return None
    target["areaKey"] = new_area
    target["area"] = AREA_LABELS[new_area]
    if new_area == "dev":
        target["categoryKey"] = DEFAULT_DEV_CATEGORY[0]
        target["category"] = DEFAULT_DEV_CATEGORY[1]
    # Update facts row that mirrors 카테고리/직무 태그
    for fact in target.get("facts") or []:
        if fact.get("label") == "카테고리":
            fact["valueHtml"] = target["category"]
        if fact.get("label") == "직무 태그":
            if new_area == "dev":
                fact["valueHtml"] = "웹DEV"
            elif new_area == "design":
                fact["valueHtml"] = "웹디자인"
            elif new_area == "service":
                fact["valueHtml"] = "웹서비스기획"
    MAGAZINE_JSON.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return target


def main(argv: list[str]) -> int:
    if len(argv) < 4:
        print("usage: python scripts/move_article_category.py <issueSlug> <number> <areaKey>")
        return 2
    issue_slug, number, new_area = argv[1], argv[2], argv[3]
    moved = move_article(issue_slug, number, new_area)
    if moved is None:
        print(f"not found: {issue_slug} #{number}")
        return 1
    print(f"moved #{number} -> {new_area} ({moved.get('platform')}: {moved.get('takeawayHtml','')[:60]})")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
