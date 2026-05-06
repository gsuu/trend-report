"""Strip 점검 질문 subhead and the following blocks/paragraphs from every article."""

import io
import json
import re
import sys
from pathlib import Path

if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

ROOT = Path(__file__).resolve().parents[1]
MAGAZINE_JSON = ROOT / "public" / "data" / "magazine.json"
RUNS_DIR = ROOT / "runs"

CHECKLIST_TITLE = re.compile(r"점검\s*질문")
ITEM_PREFIX = re.compile(r"^@@(?P<kind>\w+)@@(?P<body>.*)$", flags=re.S)


def strip_checklist_blocks(blocks):
    if not isinstance(blocks, list):
        return blocks
    result = []
    skipping = False
    for block in blocks:
        if not isinstance(block, dict):
            result.append(block)
            continue
        kind = block.get("kind")
        html = str(block.get("html") or "")
        if kind == "subhead":
            if CHECKLIST_TITLE.search(html):
                skipping = True
                continue
            skipping = False
            result.append(block)
            continue
        if skipping:
            continue
        result.append(block)
    return result


def strip_checklist_items(items):
    if not isinstance(items, list):
        return items
    result = []
    skipping = False
    for item in items:
        if not isinstance(item, str):
            result.append(item)
            continue
        m = ITEM_PREFIX.match(item)
        if m and m.group("kind") == "subhead":
            if CHECKLIST_TITLE.search(m.group("body")):
                skipping = True
                continue
            skipping = False
            result.append(item)
            continue
        if skipping:
            continue
        result.append(item)
    return result


def cleanup_section(section):
    if not isinstance(section, dict):
        return
    section["blocks"] = strip_checklist_blocks(section.get("blocks") or [])
    section["itemsHtml"] = strip_checklist_items(section.get("itemsHtml") or [])


def cleanup_issue(issue):
    for section in issue.get("sections") or []:
        cleanup_section(section)
    for section in issue.get("overviewSections") or []:
        cleanup_section(section)


def update_magazine_json():
    data = json.loads(MAGAZINE_JSON.read_text(encoding="utf-8"))
    issues = (data.get("report") or {}).get("issues") or []
    for issue in issues:
        cleanup_issue(issue)
    MAGAZINE_JSON.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"updated {MAGAZINE_JSON}")


def update_markdown_files():
    if not RUNS_DIR.exists():
        return
    # H6 ##### 점검 질문 ... up to next ##### or #### or ## or end
    block_re = re.compile(r"(?ms)^######\s+점검\s*질문\s*\n.*?(?=^#{1,6}\s|\Z)")
    h5_re = re.compile(r"(?ms)^#####\s+점검\s*질문\s*\n.*?(?=^#{1,6}\s|\Z)")
    for md in RUNS_DIR.rglob("magazine-report.md"):
        text = md.read_text(encoding="utf-8")
        new_text = block_re.sub("", text)
        new_text = h5_re.sub("", new_text)
        new_text = re.sub(r"\n{3,}", "\n\n", new_text)
        if new_text != text:
            md.write_text(new_text, encoding="utf-8")
            print(f"updated {md}")


if __name__ == "__main__":
    update_magazine_json()
    update_markdown_files()
