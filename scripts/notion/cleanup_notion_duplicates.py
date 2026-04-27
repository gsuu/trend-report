#!/usr/bin/env python3
from __future__ import annotations

import argparse
import os
import re
import sys
from typing import Any

from push_notion import clean_markdown, database_schema, load_dotenv, notion_request, page_property_text

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Notion DB에서 완전 동일한 이슈 중복만 archive 처리합니다.")
    parser.add_argument("report", nargs="?", help="호환용 인자입니다. 현재 중복 판정에는 사용하지 않습니다.")
    parser.add_argument("--apply", action="store_true", help="실제로 Notion 페이지를 archive 처리합니다.")
    return parser.parse_args()


def query_all_pages(database_id: str) -> list[dict[str, Any]]:
    payload: dict[str, Any] = {"page_size": 100}
    pages: list[dict[str, Any]] = []
    while True:
        response = notion_request("POST", f"databases/{database_id}/query", payload)
        pages.extend(response.get("results", []))
        if not response.get("has_more"):
            break
        payload["start_cursor"] = response.get("next_cursor")
    return pages


def normalize_key(value: str) -> str:
    value = clean_markdown(value).lower()
    value = re.sub(r"\s+", " ", value)
    return value.strip()


def duplicate_key(page: dict[str, Any], schema: dict[str, dict[str, Any]]) -> tuple[str, str, str, str, str]:
    props = page.get("properties", {})
    return (
        normalize_key(page_property_text(props, schema, "title", "")),
        normalize_key(page_property_text(props, schema, "platform", "")),
        normalize_key(page_property_text(props, schema, "area", "")),
        normalize_key(page_property_text(props, schema, "category", "")),
        normalize_key(page_property_text(props, schema, "source_url", "")),
    )


def page_label(page: dict[str, Any], schema: dict[str, dict[str, Any]]) -> str:
    props = page.get("properties", {})
    title = page_property_text(props, schema, "title", "")
    platform = page_property_text(props, schema, "platform", "")
    area = page_property_text(props, schema, "area", "")
    category = page_property_text(props, schema, "category", "")
    return f"{title} | {platform} | {area}/{category}"


def archive_page(page_id: str) -> None:
    notion_request("PATCH", f"pages/{page_id}", {"archived": True})


def main() -> None:
    load_dotenv()
    args = parse_args()
    database_id = os.getenv("NOTION_DATABASE_ID", "").strip()
    if not database_id:
        raise SystemExit("NOTION_DATABASE_ID 환경변수가 필요합니다.")

    schema = database_schema(database_id)
    pages = [page for page in query_all_pages(database_id) if not page.get("archived")]

    groups: dict[tuple[str, str, str, str, str], list[dict[str, Any]]] = {}
    for page in pages:
        key = duplicate_key(page, schema)
        if not key[0]:
            continue
        groups.setdefault(key, []).append(page)

    archive_targets: list[dict[str, Any]] = []
    for group in groups.values():
        if len(group) < 2:
            continue
        ranked = sorted(group, key=lambda page: page.get("last_edited_time", ""), reverse=True)
        archive_targets.extend(ranked[1:])

    action = "archive" if args.apply else "would archive"
    print(f"notion_pages={len(pages)} duplicate_groups={sum(1 for group in groups.values() if len(group) > 1)} archive_targets={len(archive_targets)}")
    for page in archive_targets:
        print(f"{action}: {page_label(page, schema)}")
        if args.apply:
            archive_page(page["id"])


if __name__ == "__main__":
    main()
