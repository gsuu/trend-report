#!/usr/bin/env python3
from __future__ import annotations

import argparse
import html
import json
import re
from pathlib import Path

import report_parser


ROOT = Path(__file__).resolve().parents[2]
RUNS_DIR = ROOT / "runs"
REPORTS_DIR = ROOT / "reports"
OUTPUT_PATH = ROOT / "public" / "data" / "magazine.json"


def report_slug_from_path(report_path: Path, fallback: str = "") -> str:
    if report_path.name == "magazine-report.md" and report_path.parent.name:
        return report_path.parent.name
    return report_path.stem.replace("-uiux-web-service-weekly-trend-report", "") or fallback


def cumulative_report_paths() -> list[Path]:
    selected: dict[str, Path] = {}
    for report_path in sorted(REPORTS_DIR.glob("*.md")):
        selected[report_slug_from_path(report_path)] = report_path
    for report_path in sorted(RUNS_DIR.glob("*/magazine-report.md")):
        selected[report_slug_from_path(report_path)] = report_path
    if not selected:
        raise SystemExit("누적할 Markdown 리포트 파일을 찾지 못했습니다.")
    return [selected[slug] for slug in sorted(selected)]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Markdown 리포트들을 누적 매거진 정적 JSON으로 생성합니다.")
    parser.add_argument("reports", nargs="*", help="입력 Markdown 리포트 경로들. 없으면 reports/*.md와 runs/*/magazine-report.md 전체를 사용합니다.")
    parser.add_argument("--output", default=str(OUTPUT_PATH), help="출력 JSON 경로")
    return parser.parse_args()


def clean_markdown(value: str) -> str:
    value = re.sub(r"`([^`]+)`", r"\1", value or "")
    value = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", value)
    value = re.sub(r"<[^>]+>", "", value)
    return re.sub(r"\s+", " ", html.unescape(value)).strip()


def resolve_report_paths(values: list[str]) -> list[Path]:
    if not values:
        return cumulative_report_paths()

    paths: list[Path] = []
    for value in values:
        report_path = Path(value)
        if not report_path.is_absolute():
            report_path = ROOT / report_path
        paths.append(report_path)
    return paths


def report_payload_from_path(report_path: Path) -> dict[str, object]:
    if not report_path.is_absolute():
        report_path = ROOT / report_path
    report = report_parser.parse_report(report_path)
    report.slug = report_slug_from_path(report_path, report.slug)
    payload = report_parser.report_payload(report)

    for issue_payload, issue in zip(payload.get("issues", []), report.issues):
        issue_number = str(issue_payload.get("number") or issue.number).zfill(2)
        issue_date = issue.meta.get("날짜") or report.slug
        article_slug = f"{report.slug}-{issue_number}"
        issue_payload["id"] = article_slug
        issue_payload["issueSlug"] = report.slug
        issue_payload["articleSlug"] = article_slug
        issue_payload["number"] = issue_number
        issue_payload["publicationDate"] = report.slug
        issue_payload["date"] = issue_date
        issue_payload["route"] = f"/articles/{article_slug}"
        issue_payload["href"] = issue_payload["route"]
        issue_payload["articleUrl"] = report_parser.absolute_site_url(issue_payload["route"])
        for fact in issue_payload.get("facts", []):
            if fact.get("label") in {"날짜", "발행날짜"}:
                fact["valueHtml"] = issue_date
    return payload


def main() -> None:
    args = parse_args()
    report_paths = resolve_report_paths(args.reports)

    output_path = Path(args.output)
    if not output_path.is_absolute():
        output_path = ROOT / output_path

    report_parser.clean_markdown = clean_markdown
    report_parser.issue_source_title = lambda issue: issue.meta.get("출처", "")

    report_payloads = [report_payload_from_path(path) for path in report_paths]
    latest_slug = max((str(payload.get("slug") or "") for payload in report_payloads), default="")
    issues = [
        issue
        for payload in sorted(report_payloads, key=lambda item: str(item.get("slug") or ""), reverse=True)
        for issue in payload.get("issues", [])
    ]
    payload = {
        "generatedAt": __import__("datetime").datetime.now(__import__("datetime").timezone.utc).isoformat(),
        "report": {
            "title": "CTTD Trend Magazine",
            "description": "CTTD Service/Design/DEV Weekly Trend Magazine",
            "slug": latest_slug,
            "issues": issues,
            "issueSlugs": sorted(
                {str(report_payload.get("slug") or "") for report_payload in report_payloads if report_payload.get("slug")},
                reverse=True,
            ),
        },
    }

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {len(issues)} issues from {len(report_payloads)} reports to {output_path.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
