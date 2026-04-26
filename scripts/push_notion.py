#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import os
import re
import sys
from pathlib import Path
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


ROOT = Path(__file__).resolve().parents[1]
REPORTS_DIR = ROOT / "reports"
NOTION_VERSION = "2022-06-28"
MAX_RICH_TEXT_LENGTH = 1900

sys.path.insert(0, str(ROOT / "scripts"))
from build_site import (  # noqa: E402
    Issue,
    Report,
    issue_area_key,
    issue_area_label,
    issue_category_key,
    issue_category_label,
    issue_deck,
    issue_takeaway,
    parse_report,
    split_section_block,
)


PROPERTY_ALIASES = {
    "title": ("Title", "Name", "제목"),
    "number": ("Number", "번호", "No", "순번"),
    "platform": ("Platform", "서비스", "플랫폼", "Brand"),
    "area": ("Area", "대분류", "Type"),
    "category": ("Category", "카테고리", "Subcategory", "소분류"),
    "date": ("Date", "발행날짜", "Published Date"),
    "tags": ("Tags", "태그"),
    "takeaway": ("Takeaway", "한줄 인사이트"),
    "deck": ("Deck", "Summary", "요약", "설명"),
    "source_url": ("Source URL", "출처 URL", "URL"),
    "source_title": ("Source Title", "출처", "출처명"),
    "image": ("Image", "이미지", "Cover", "커버"),
    "image_caption": ("Image Caption", "이미지 설명", "캡션"),
    "report_slug": ("Report Slug", "Report", "리포트"),
    "source_key": ("Source Key", "Slug", "Page Key", "고유키"),
    "status": ("Status", "상태"),
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Markdown 리포트 이슈를 Notion 데이터베이스에 추가/업데이트합니다.")
    parser.add_argument("report", nargs="?", help="동기화할 reports/*.md 경로. 없으면 최신 리포트를 사용합니다.")
    parser.add_argument("--dry-run", action="store_true", help="Notion에 쓰지 않고 변환될 항목만 출력합니다.")
    parser.add_argument("--no-update", action="store_true", help="Source Key가 있어도 기존 페이지를 업데이트하지 않고 새로 만듭니다.")
    parser.add_argument("--limit", type=int, default=0, help="앞에서부터 N개 이슈만 동기화합니다.")
    return parser.parse_args()


def load_dotenv() -> None:
    env_path = ROOT / ".env"
    if not env_path.exists():
        return

    for raw_line in env_path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        if key and key not in os.environ:
            os.environ[key] = value.strip().strip('"').strip("'")


def latest_report_path() -> Path:
    reports = sorted(REPORTS_DIR.glob("*.md"))
    if not reports:
        raise SystemExit("reports/*.md 파일을 찾지 못했습니다.")
    return reports[-1]


def notion_request(method: str, path: str, payload: dict[str, Any] | None = None) -> dict[str, Any]:
    token = os.getenv("NOTION_TOKEN") or os.getenv("NOTION_API_KEY")
    if not token:
        raise SystemExit("NOTION_TOKEN 환경변수가 필요합니다.")

    body = json.dumps(payload).encode("utf-8") if payload is not None else None
    request = Request(
        f"https://api.notion.com/v1/{path.lstrip('/')}",
        data=body,
        method=method,
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "Notion-Version": NOTION_VERSION,
        },
    )

    try:
        with urlopen(request, timeout=30) as response:
            return json.loads(response.read().decode("utf-8"))
    except HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        raise SystemExit(f"Notion API 오류 {exc.code}: {detail}") from exc
    except URLError as exc:
        raise SystemExit(f"Notion API 연결 오류: {exc}") from exc


def database_schema(database_id: str) -> dict[str, dict[str, Any]]:
    database = notion_request("GET", f"databases/{database_id}")
    return database.get("properties", {})


def first_property(schema: dict[str, dict[str, Any]], logical_name: str) -> tuple[str, dict[str, Any]] | tuple[None, None]:
    for name in PROPERTY_ALIASES[logical_name]:
        if name in schema:
            return name, schema[name]

    if logical_name == "title":
        for name, prop in schema.items():
            if prop.get("type") == "title":
                return name, prop
    return None, None


def text_content(value: str) -> dict[str, Any]:
    return {"type": "text", "text": {"content": value[:MAX_RICH_TEXT_LENGTH]}}


def clean_markdown(value: str) -> str:
    value = re.sub(r"`([^`]+)`", r"\1", value)
    value = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", value)
    return re.sub(r"\s+", " ", value).strip()


def date_value(value: str) -> str:
    match = re.search(r"\d{4}-\d{2}-\d{2}", value)
    if match:
        return match.group(0)
    month_match = re.search(r"(\d{4})-(\d{2})", value)
    if month_match:
        return f"{month_match.group(1)}-{month_match.group(2)}-01"
    return ""


def notion_property(prop_type: str, value: Any) -> dict[str, Any] | None:
    if value is None:
        return None

    if isinstance(value, str):
        value = value.strip()
        if not value:
            return None

    if prop_type == "title":
        return {"title": [text_content(str(value))]}
    if prop_type == "rich_text":
        return {"rich_text": [text_content(str(value))]}
    if prop_type == "select":
        return {"select": {"name": str(value)}}
    if prop_type == "status":
        return {"status": {"name": str(value)}}
    if prop_type == "multi_select":
        values = value if isinstance(value, list) else [part.strip() for part in str(value).split(",")]
        return {"multi_select": [{"name": str(item)} for item in values if str(item).strip()]}
    if prop_type == "date":
        clean_date = date_value(str(value))
        return {"date": {"start": clean_date}} if clean_date else None
    if prop_type == "url":
        return {"url": str(value)}
    if prop_type == "number":
        try:
            return {"number": float(value)}
        except (TypeError, ValueError):
            return None
    if prop_type == "files":
        return {"files": [{"name": "cover", "type": "external", "external": {"url": str(value)}}]}
    if prop_type == "checkbox":
        return {"checkbox": bool(value)}
    return None


def set_property(properties: dict[str, Any], schema: dict[str, dict[str, Any]], logical_name: str, value: Any) -> None:
    name, prop = first_property(schema, logical_name)
    if not name or not prop:
        return

    payload = notion_property(prop["type"], value)
    if payload is not None:
        properties[name] = payload


def source_key(report: Report, issue: Issue) -> str:
    return f"{report.slug}-{issue.number.zfill(2)}"


def issue_properties(report: Report, issue: Issue, schema: dict[str, dict[str, Any]]) -> dict[str, Any]:
    title = clean_markdown(issue_takeaway(issue) or f"{issue.platform} {issue.title}")
    properties: dict[str, Any] = {}
    set_property(properties, schema, "title", title)
    set_property(properties, schema, "number", issue.number)
    set_property(properties, schema, "platform", issue.platform)
    set_property(properties, schema, "area", issue_area_label(issue))
    set_property(properties, schema, "category", issue_category_label(issue))
    set_property(properties, schema, "date", issue.meta.get("날짜", report.slug))
    set_property(properties, schema, "tags", issue.tags)
    set_property(properties, schema, "takeaway", clean_markdown(issue_takeaway(issue)))
    set_property(properties, schema, "deck", clean_markdown(issue_deck(issue)))
    set_property(properties, schema, "source_url", issue.meta.get("출처 URL", ""))
    set_property(properties, schema, "source_title", issue.meta.get("출처", ""))
    set_property(properties, schema, "image", issue.image)
    set_property(properties, schema, "image_caption", issue.image_caption)
    set_property(properties, schema, "report_slug", report.slug)
    set_property(properties, schema, "source_key", source_key(report, issue))
    set_property(properties, schema, "status", "Ready")
    return properties


def paragraph_block(text: str) -> dict[str, Any]:
    return {"object": "block", "type": "paragraph", "paragraph": {"rich_text": [text_content(text)]}}


def heading_block(text: str, level: int = 2) -> dict[str, Any]:
    block_type = "heading_3" if level == 3 else "heading_2"
    return {"object": "block", "type": block_type, block_type: {"rich_text": [text_content(text)]}}


def list_block(text: str) -> dict[str, Any]:
    return {"object": "block", "type": "bulleted_list_item", "bulleted_list_item": {"rich_text": [text_content(text)]}}


def quote_block(text: str) -> dict[str, Any]:
    return {"object": "block", "type": "quote", "quote": {"rich_text": [text_content(text)]}}


def chunk_text(value: str) -> list[str]:
    clean = clean_markdown(value)
    if len(clean) <= MAX_RICH_TEXT_LENGTH:
        return [clean] if clean else []
    return [clean[index : index + MAX_RICH_TEXT_LENGTH] for index in range(0, len(clean), MAX_RICH_TEXT_LENGTH)]


def issue_blocks(issue: Issue) -> list[dict[str, Any]]:
    blocks: list[dict[str, Any]] = []

    meta_lines = [
        ("국가", issue.meta.get("국가", "")),
        ("카테고리", issue_category_key(issue)),
        ("출처", issue.meta.get("출처", "")),
        ("출처 URL", issue.meta.get("출처 URL", "")),
        ("이미지", issue.image),
        ("이미지 설명", issue.image_caption),
    ]
    blocks.append(heading_block("기본 정보", 2))
    for label, value in meta_lines:
        if value:
            blocks.append(list_block(f"{label}: {value}"))

    for section_name, items in issue.sections.items():
        blocks.append(heading_block(section_name, 2))
        for item in items:
            kind, text = split_section_block(item)
            for chunk in chunk_text(text):
                if kind == "quote":
                    blocks.append(quote_block(chunk))
                elif kind == "subhead":
                    blocks.append(heading_block(chunk, 3))
                elif kind == "list":
                    blocks.append(list_block(chunk))
                else:
                    blocks.append(paragraph_block(chunk))

    return blocks[:100]


def find_existing_page(database_id: str, schema: dict[str, dict[str, Any]], key: str) -> str:
    name, prop = first_property(schema, "source_key")
    if not name or not prop:
        return ""

    prop_type = prop["type"]
    if prop_type not in {"rich_text", "title"}:
        return ""

    response = notion_request(
        "POST",
        f"databases/{database_id}/query",
        {"filter": {"property": name, prop_type: {"equals": key}}, "page_size": 1},
    )
    results = response.get("results", [])
    return results[0]["id"] if results else ""


def replace_children(page_id: str, blocks: list[dict[str, Any]]) -> None:
    cursor = None
    while True:
        query = f"blocks/{page_id}/children?page_size=100"
        if cursor:
            query += f"&start_cursor={cursor}"
        response = notion_request("GET", query)
        for block in response.get("results", []):
            notion_request("DELETE", f"blocks/{block['id']}")
        if not response.get("has_more"):
            break
        cursor = response.get("next_cursor")

    for index in range(0, len(blocks), 100):
        notion_request("PATCH", f"blocks/{page_id}/children", {"children": blocks[index : index + 100]})


def upsert_issue(database_id: str, schema: dict[str, dict[str, Any]], report: Report, issue: Issue, update: bool) -> str:
    properties = issue_properties(report, issue, schema)
    blocks = issue_blocks(issue)
    key = source_key(report, issue)
    existing_page_id = find_existing_page(database_id, schema, key) if update else ""

    if existing_page_id:
        notion_request("PATCH", f"pages/{existing_page_id}", {"properties": properties})
        replace_children(existing_page_id, blocks)
        return "updated"

    notion_request(
        "POST",
        "pages",
        {
            "parent": {"database_id": database_id},
            "properties": properties,
            "children": blocks,
        },
    )
    return "created"


def main() -> None:
    load_dotenv()
    args = parse_args()
    report_path = Path(args.report).resolve() if args.report else latest_report_path()
    report = parse_report(report_path)
    issues = report.issues[: args.limit] if args.limit else report.issues

    if args.dry_run:
        print(f"{report_path}")
        print(f"{len(issues)} issues")
        for issue in issues:
            print(f"- {source_key(report, issue)} | {issue_area_label(issue)} | {issue.platform} | {clean_markdown(issue_takeaway(issue))}")
        return

    database_id = os.getenv("NOTION_DATABASE_ID", "").strip()
    if not database_id:
        raise SystemExit("NOTION_DATABASE_ID 환경변수가 필요합니다.")

    schema = database_schema(database_id)
    title_name, _ = first_property(schema, "title")
    if not title_name:
        raise SystemExit("Notion 데이터베이스에 title 타입 속성이 필요합니다.")

    counts = {"created": 0, "updated": 0}
    for issue in issues:
        result = upsert_issue(database_id, schema, report, issue, update=not args.no_update)
        counts[result] += 1
        print(f"{result}: {source_key(report, issue)} {issue.platform}")

    print(f"Done. created={counts['created']} updated={counts['updated']}")


if __name__ == "__main__":
    main()
