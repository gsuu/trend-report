#!/usr/bin/env python3
"""일일 수집·발행 대시보드 생성기.

`runs/YYYY-MM-DD/raw/*-fetch-report.json`과 `magazine/*.md`를 읽어
`runs/YYYY-MM-DD/dashboard.html` 정적 페이지로 합칩니다.

사용:
    python scripts/magazine/build_dashboard.py [YYYY-MM-DD]
    인자 없으면 가장 최근 runs 폴더 자동 선택.
"""
from __future__ import annotations

import json
import re
import sys
from datetime import datetime
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
RUNS_DIR = ROOT / "runs"


def latest_run_date() -> str | None:
    candidates = sorted(
        (p.name for p in RUNS_DIR.iterdir() if p.is_dir() and re.match(r"^\d{4}-\d{2}-\d{2}$", p.name)),
        reverse=True,
    )
    return candidates[0] if candidates else None


def read_json(path: Path) -> dict | list | None:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (FileNotFoundError, json.JSONDecodeError):
        return None


def read_text(path: Path) -> str | None:
    try:
        return path.read_text(encoding="utf-8")
    except FileNotFoundError:
        return None


def fetch_summary(name: str, report: dict | None) -> dict:
    if not report:
        return {"name": name, "status": "missing", "totalArticles": 0, "totalSkippedByScore": 0, "sources": []}
    sources = report.get("sourceResults", [])
    return {
        "name": name,
        "status": "ok",
        "totalArticles": report.get("totalArticles", 0),
        "totalSkippedByScore": report.get("totalSkippedByScore", 0),
        "sources": sources,
    }


def shortlist_count(text: str | None) -> int:
    if not text:
        return 0
    return len(re.findall(r"^####\s+\d+\.", text, flags=re.MULTILINE))


def magazine_issue_count(text: str | None) -> int:
    if not text:
        return 0
    return len(re.findall(r"^####\s+\d+\.", text, flags=re.MULTILINE))


def excluded_section(text: str | None) -> list[str]:
    if not text:
        return []
    match = re.search(r"(?:^|\n)## 수집했지만 제외한 것\n(.+?)(?=\n## |\Z)", text, re.DOTALL)
    if not match:
        return []
    body = match.group(1)
    return [line.strip("- ").strip() for line in body.splitlines() if line.strip().startswith("- ")]


def feedback_score(date: str) -> dict | None:
    path = RUNS_DIR / date / "magazine" / "feedback-bonus.json"
    return read_json(path)


def render_fetch_card(summary: dict) -> str:
    sources_html = "".join(
        f'<li>{escape(s.get("name", ""))} <em>{s.get("count", 0)}</em>'
        + (f' <small class="dash-deny">−{s.get("skippedByScore", 0)}</small>' if s.get("skippedByScore") else "")
        + (f' <span class="dash-error">{escape(s.get("error", ""))}</span>' if s.get("status") == "error" else "")
        + "</li>"
        for s in summary["sources"]
    )
    status_label = summary["status"]
    return f"""
    <article class="dash-card">
      <header>
        <h3>{escape(summary["name"])}</h3>
        <span class="dash-badge dash-badge-{escape(status_label)}">{escape(status_label)}</span>
      </header>
      <p class="dash-metrics">
        <span class="dash-metric"><strong>{summary["totalArticles"]}</strong>건 수집</span>
        <span class="dash-metric"><strong>{summary["totalSkippedByScore"]}</strong>건 점수제 차단</span>
      </p>
      <details>
        <summary>출처별 결과</summary>
        <ul>{sources_html or '<li>없음</li>'}</ul>
      </details>
    </article>
    """


def render_html(date: str) -> str:
    raw_dir = RUNS_DIR / date / "raw"
    magazine_dir = RUNS_DIR / date / "magazine"

    fetches = [
        fetch_summary("SERVICE", read_json(raw_dir / "service-fetch-report.json")),
        fetch_summary("DESIGN", read_json(raw_dir / "design-fetch-report.json")),
        fetch_summary("DEV", read_json(raw_dir / "dev-fetch-report.json")),
        fetch_summary("App Store RN", read_json(raw_dir / "appstore-fetch-report.json")),
    ]

    shortlist_text = read_text(magazine_dir / "shortlist-20-30.md")
    magazine_text = read_text(magazine_dir / "magazine-report.md")
    excluded = excluded_section(magazine_text)
    feedback = feedback_score(date)
    signals = read_json(raw_dir / "jobs-signals.json")

    fetch_cards = "\n".join(render_fetch_card(summary) for summary in fetches)
    excluded_html = "".join(f"<li>{escape(item)}</li>" for item in excluded[:30])
    signals_html = "".join(
        f"<li><span>{escape(s.get('label', s.get('key', '')))}</span> <em>{s.get('total', 0)}</em></li>"
        for s in (signals.get("signals", []) if isinstance(signals, dict) else [])[:10]
    )
    feedback_html = ""
    if isinstance(feedback, dict) and feedback:
        domain_scores = sorted(
            (feedback.get("domains") or {}).items(),
            key=lambda pair: -abs(pair[1].get("score", 0) if isinstance(pair[1], dict) else pair[1] or 0),
        )[:8]
        feedback_html = "".join(
            f"<li><span>{escape(domain)}</span> <em>{(value.get('score') if isinstance(value, dict) else value) or 0}</em></li>"
            for domain, value in domain_scores
        )

    generated_at = datetime.utcnow().isoformat(timespec="seconds") + "Z"
    return f"""<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>CTTD Trend Dashboard — {escape(date)}</title>
<style>
  body {{ font-family: -apple-system, BlinkMacSystemFont, "SUIT Variable", "Apple SD Gothic Neo", Helvetica, Arial, sans-serif; margin: 0; background: #fafaf7; color: #111111; }}
  main {{ max-width: 1200px; margin: 0 auto; padding: 32px 24px 80px; }}
  h1 {{ margin: 0 0 4px; font-size: 28px; }}
  h2 {{ margin: 32px 0 12px; font-size: 18px; }}
  .dash-eyebrow {{ color: #777; font-size: 12px; letter-spacing: 0.06em; text-transform: uppercase; margin: 0 0 4px; }}
  .dash-grid {{ display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }}
  .dash-card {{ background: #fff; border: 1px solid #ececec; border-radius: 10px; padding: 16px 18px; }}
  .dash-card header {{ display: flex; align-items: baseline; justify-content: space-between; gap: 8px; margin-bottom: 8px; }}
  .dash-card h3 {{ margin: 0; font-size: 15px; }}
  .dash-badge {{ font-size: 11px; padding: 2px 8px; border-radius: 999px; background: #f0f0e8; color: #555; text-transform: uppercase; letter-spacing: 0.05em; }}
  .dash-badge-ok {{ background: #e6f4ea; color: #1e6b3a; }}
  .dash-badge-missing {{ background: #fdeaea; color: #a53737; }}
  .dash-metrics {{ display: flex; gap: 14px; margin: 0 0 8px; color: #555; font-size: 13px; }}
  .dash-metric strong {{ color: #111; font-size: 18px; margin-right: 4px; }}
  details summary {{ cursor: pointer; color: #555; font-size: 12px; padding: 6px 0; }}
  details ul {{ margin: 4px 0 0; padding-left: 16px; font-size: 13px; line-height: 1.55; }}
  details li em {{ color: #888; font-style: normal; font-weight: 600; }}
  .dash-deny {{ color: #c05014; font-weight: 600; }}
  .dash-error {{ color: #a53737; margin-left: 4px; }}
  .dash-panel {{ background: #fff; border: 1px solid #ececec; border-radius: 10px; padding: 18px 20px; }}
  .dash-panel ul {{ margin: 8px 0 0; padding-left: 18px; font-size: 13px; line-height: 1.6; }}
  .dash-panel li span {{ font-weight: 500; }}
  .dash-panel li em {{ font-weight: 700; font-style: normal; color: #111; }}
  .dash-checklist {{ margin: 0; padding-left: 18px; font-size: 13px; line-height: 1.7; color: #555; }}
  footer {{ margin-top: 40px; color: #888; font-size: 11px; }}
</style>
</head>
<body>
<main>
  <p class="dash-eyebrow">CTTD Trend Daily Dashboard</p>
  <h1>{escape(date)}</h1>

  <h2>수집 결과</h2>
  <div class="dash-grid">{fetch_cards}</div>

  <h2>매거진 진행</h2>
  <div class="dash-panel">
    <p>shortlist 항목: <strong>{shortlist_count(shortlist_text)}</strong>건</p>
    <p>magazine-report 등록: <strong>{magazine_issue_count(magazine_text)}</strong>건</p>
  </div>

  <h2>수집했지만 제외한 것 (Top 30)</h2>
  <div class="dash-panel">
    {f'<ul>{excluded_html}</ul>' if excluded_html else '<p>제외 항목 없음 / 매거진 미완성</p>'}
  </div>

  <h2>채용 신호 Top 10</h2>
  <div class="dash-panel">
    {f'<ul>{signals_html}</ul>' if signals_html else '<p>signals 데이터 없음</p>'}
  </div>

  <h2>사용자 피드백 도메인 Top 8</h2>
  <div class="dash-panel">
    {f'<ul>{feedback_html}</ul>' if feedback_html else '<p>feedback-bonus.json 없음</p>'}
  </div>

  <h2>다음 액션 체크리스트</h2>
  <div class="dash-panel">
    <ul class="dash-checklist">
      <li>fetch 점수제 차단 항목 검토 — service-fetch-report.json의 totalSkippedByScore가 0이 아닌 경우 패턴 점검</li>
      <li>shortlist의 항목 수가 카테고리별 5건 미만이면 수집 채널 보강</li>
      <li>magazine-report 등록 건 모두 verified source로 검증 완료 여부 확인</li>
      <li>회의 질문 메타 누락된 SERVICE 글이 있으면 작성자에게 회신</li>
      <li>새 글의 이미지 alt·caption·다중 스크린샷 채움 확인</li>
    </ul>
  </div>

  <footer>Generated {escape(generated_at)} · scripts/magazine/build_dashboard.py</footer>
</main>
</body>
</html>
"""


def main() -> int:
    date = sys.argv[1] if len(sys.argv) > 1 else latest_run_date()
    if not date:
        print("No runs directory found.")
        return 1
    output_path = RUNS_DIR / date / "dashboard.html"
    output_path.write_text(render_html(date), encoding="utf-8")
    print(f"Wrote dashboard for {date} -> {output_path.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
