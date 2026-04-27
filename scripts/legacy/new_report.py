#!/usr/bin/env python3
from __future__ import annotations

import sys
from datetime import date, datetime
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
TEMPLATE_PATH = ROOT / "templates" / "weekly-report.md"
REPORTS_DIR = ROOT / "reports"


def parse_report_date(args: list[str]) -> date:
    if not args:
        return date.today()

    try:
        return datetime.strptime(args[0], "%Y-%m-%d").date()
    except ValueError as exc:
        raise SystemExit("날짜는 YYYY-MM-DD 형식으로 입력하세요.") from exc


def main() -> None:
    report_date = parse_report_date(sys.argv[1:])
    template = TEMPLATE_PATH.read_text(encoding="utf-8")
    content = template.replace("{{date}}", report_date.isoformat())

    REPORTS_DIR.mkdir(exist_ok=True)
    output_path = REPORTS_DIR / f"{report_date.isoformat()}-uiux-web-service-weekly-trend-report.md"

    if output_path.exists():
        raise SystemExit(f"이미 파일이 있습니다: {output_path}")

    output_path.write_text(content, encoding="utf-8")
    print(output_path)


if __name__ == "__main__":
    main()
