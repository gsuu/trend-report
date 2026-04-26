#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
from collections import defaultdict
from datetime import date, datetime
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
TEMPLATE_PATH = ROOT / "templates" / "raw-collection.md"
PLATFORMS_PATH = ROOT / "data" / "platforms.json"
COLLECTIONS_DIR = ROOT / "collections"

CATEGORY_SIGNAL_RULES = {
    "fashion": [
        "홈/카테고리/브랜드관 진입 구조",
        "룩북·스타일 추천·착장/코디 탐색",
        "찜·재입고·브랜드 팔로우·방문 보상",
        "편집숍/멀티스토어/버티컬 확장",
    ],
    "ecommerce": [
        "홈·검색·상품상세·장바구니·결제 플로우",
        "멤버십·쿠폰·포인트·무료배송 조건",
        "AI 추천·리뷰 요약·상품 비교",
        "찜·알림·재구매·휴면 복귀 장치",
    ],
    "department_store": [
        "VIP/멤버십·혜택 이해 UX",
        "오프라인 매장·픽업·재고·예약 연계",
        "선물하기·프리미엄 큐레이션·행사 탐색",
        "백화점 앱과 커머스 앱의 역할 분리",
    ],
    "beauty": [
        "성분·피부진단·리뷰 기반 비교 UX",
        "AI 추천·듀프·개인화 루틴",
        "랭킹·체험단·리뷰 신뢰 장치",
        "오프라인 매장/픽업/글로벌 확장",
    ],
    "book_content": [
        "추천 홈·이어보기·책갈피·동기화",
        "로그인/복귀/재설치 후 이어 읽기",
        "웹툰·웹소설·전자책 뷰어 조작",
        "구독·캐시·소장/대여 결제 구조",
    ],
}

DEV_SIGNAL_RULES = {
    "ai": [
        "AI 개발 도구, 코딩 에이전트, 디자인/프론트엔드 워크플로우 자동화",
        "Figma, Storybook, Playwright, 브라우저 MCP처럼 UIUX 팀 검토 방식이 바뀌는 도구",
        "AI 결과를 사람이 검증할 수 있는 로그, diff, screenshot, trace, 평가 기능",
    ],
    "web_platform": [
        "접근성, CSS, JavaScript, HTML 속성·API·브라우저 동작 변경",
        "Chrome, Firefox, Safari/WebKit, iOS/iPadOS의 이번 주 릴리즈와 호환성 변화",
        "Baseline, MDN, W3C/WICG, WebKit, Chrome Developers, Mozilla Hacks의 최신 업데이트",
    ],
    "frontend_system": [
        "디자인 시스템, 컴포넌트, 토큰, 접근성 QA, 시각 회귀 테스트 사례",
        "Astro, React, Next.js, Vue, Svelte, Web Components처럼 화면 구현 방식에 영향이 있는 프레임워크",
        "빌드/배포보다 UI 구현 품질, 반응형, 성능, 브라우저 QA에 직접 연결되는 변화",
    ],
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="우선순위 기반 원천 수집 체크리스트를 생성합니다.")
    parser.add_argument("date", nargs="?", help="수집 기준일. YYYY-MM-DD 형식이며 없으면 오늘 날짜를 사용합니다.")
    return parser.parse_args()


def parse_collection_date(value: str | None) -> date:
    if not value:
        return date.today()

    try:
        return datetime.strptime(value, "%Y-%m-%d").date()
    except ValueError as exc:
        raise SystemExit("날짜는 YYYY-MM-DD 형식으로 입력하세요.") from exc


def load_platform_data() -> dict[str, Any]:
    return json.loads(PLATFORMS_PATH.read_text(encoding="utf-8"))


def build_platform_checklist(data: dict[str, Any]) -> str:
    priority = data.get("contentPriority", data.get("collectionPriority", []))
    platforms = data.get("domestic", [])
    grouped: dict[str, list[dict[str, Any]]] = defaultdict(list)

    for platform in platforms:
        grouped[platform.get("category", "uncategorized")].append(platform)

    categories = list(priority)
    categories.extend(category for category in grouped if category not in categories)

    lines: list[str] = []
    for category in categories:
        items = grouped.get(category, [])
        if not items:
            continue

        lines.append(f"  - {category}")
        for item in items:
            sources = ", ".join(item.get("sources", []))
            lines.append(f"    - [ ] {item.get('name', '이름 없음')} | sources: {sources}")

    return "\n".join(lines)


def build_category_signal_checklist(data: dict[str, Any]) -> str:
    priority = data.get("contentPriority", data.get("collectionPriority", []))
    lines: list[str] = []
    for category in priority:
        signals = CATEGORY_SIGNAL_RULES.get(category, [])
        if not signals:
            continue
        lines.append(f"  - {category}")
        for signal in signals:
            lines.append(f"    - [ ] {signal}")
    return "\n".join(lines)


def build_dev_signal_checklist() -> str:
    lines = [
        "  - DEV 필수 수집 원칙",
        "    - [ ] 우리 UIUX 팀의 화면 설계, 디자인 시스템, 접근성 QA, 프론트엔드 구현 판단에 직접 도움이 되는가?",
        "    - [ ] 이번 주 기준 최신 릴리즈, 공식 블로그, 표준 문서, 브라우저 릴리즈 노트로 확인했는가?",
        "    - [ ] AI 관련 변화가 있으면 최우선 후보로 올렸는가?",
        "    - [ ] 접근성, CSS, JavaScript, HTML, iOS, Chrome, Firefox 속성/API 업데이트 사례를 각각 확인했는가?",
    ]
    for category, signals in DEV_SIGNAL_RULES.items():
        lines.append(f"  - {category}")
        for signal in signals:
            lines.append(f"    - [ ] {signal}")
    return "\n".join(lines)


def main() -> None:
    args = parse_args()
    collection_date = parse_collection_date(args.date)
    data = load_platform_data()
    template = TEMPLATE_PATH.read_text(encoding="utf-8")
    content = (
        template.replace("{{date}}", collection_date.isoformat())
        .replace("{{platform_checklist}}", build_platform_checklist(data))
        .replace("{{category_signal_checklist}}", build_category_signal_checklist(data))
        .replace("{{dev_signal_checklist}}", build_dev_signal_checklist())
    )

    COLLECTIONS_DIR.mkdir(exist_ok=True)
    output_path = COLLECTIONS_DIR / f"{collection_date.isoformat()}-raw-trend-collection.md"

    if output_path.exists():
        raise SystemExit(f"이미 파일이 있습니다: {output_path}")

    output_path.write_text(content, encoding="utf-8")
    print(output_path)


if __name__ == "__main__":
    main()
