#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
from collections import defaultdict
from datetime import date, datetime
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[2]
TEMPLATE_PATH = ROOT / "templates" / "raw-collection.md"
PLATFORMS_PATH = ROOT / "data" / "platforms.json"
COLLECTIONS_DIR = ROOT / "collections"

CATEGORY_SIGNAL_RULES = {
    "ecommerce": [
        "홈·검색·상품상세·장바구니·결제 플로우",
        "멤버십·쿠폰·포인트·무료배송 조건",
        "AI 추천·리뷰 요약·상품 비교",
        "찜·알림·재구매·휴면 복귀 장치",
    ],
    "fashion": [
        "홈/카테고리/브랜드관 진입 구조",
        "룩북·스타일 추천·착장/코디 탐색",
        "찜·재입고·브랜드 팔로우·방문 보상",
        "편집숍/멀티스토어/버티컬 확장",
    ],
    "beauty": [
        "성분·피부진단·리뷰 기반 비교 UX",
        "AI 추천·듀프·개인화 루틴",
        "랭킹·체험단·리뷰 신뢰 장치",
        "온라인 상담/배송/픽업/글로벌 확장",
    ],
    "department_store": [
        "VIP/멤버십·혜택 이해 UX",
        "온라인 혜택·픽업·재고·예약 연계",
        "선물하기·프리미엄 큐레이션·행사 탐색",
        "백화점 앱과 커머스 앱의 역할 분리",
    ],
    "platform": [
        "사용자 생성 콘텐츠, 리뷰, 커뮤니티, 로컬 네트워크 기반 신뢰 UX",
        "검색·추천·온보딩·계정·알림처럼 플랫폼 사용 흐름을 바꾸는 기능",
        "공급자와 수요자를 연결하는 마켓플레이스 구조와 재방문 장치",
    ],
    "fintech": [
        "결제, 송금, 정산, 포인트, 캐시, 멤버십 회비처럼 돈의 흐름을 설명하는 UX",
        "가맹점·사장님·운영자 도구에서 확인, 승인, 조치하는 플로우",
        "금융/결제 조건을 사용자가 오해하지 않게 만드는 상태값과 안내 문구",
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
        "UIUX 개발자가 화면 구현, 코드 리뷰, 접근성 QA에 바로 쓸 수 있는 AI 개발 도구와 코딩 에이전트",
        "Figma, Storybook, Playwright, 브라우저 MCP처럼 디자인-코드 연동과 UI 검증 방식이 바뀌는 도구",
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


EXPANDED_SOURCE_CHECKLIST = [
    (
        "국내 Service·Design 매거진",
        [
            "요즘IT: UX, PM, 서비스 기획, 디자인 AI, 실무 번역/해설",
            "DIGITAL iNSIGHT: UI/UX, 디자인 시스템, 디지털 캠페인, 서비스 경험",
            "pxd / pxd UX Lab: UX 리서치, 서비스 디자인, 데이터 기반 UX, 접근성",
            "토스 테크 Design: 프로덕트 디자인, UX 리서치, 디자인 시스템, 금융 UX",
            "디자인 스펙트럼: 디자인 커뮤니티, 컨퍼런스, Spectrum Picks",
            "오픈서베이 블로그/트렌드 리포트: CX, 소비자 조사, 정량 근거",
            "PUBLY: PM, 서비스 기획, 제품 조직 운영. 공개 URL/인용 가능 범위 확인",
        ],
    ),
    (
        "공신력 있는 YouTube",
        [
            "공식 제품 채널: OpenAI, Anthropic, Figma, Adobe Creative Cloud, Google Design, Google for Developers",
            "공식 컨퍼런스/세션: Figma Config, Adobe MAX, Google I/O, 토스 메이커스 컨퍼런스, 디자인 스펙트럼",
            "국내 실무 채널: pxd, EO 제품/디자인/AI 인터뷰, 공식 회사 채널의 제품·디자인 실무 영상",
            "개인 크리에이터 영상은 후보 발견 출처나 관련 글로만 사용하고 공식 문서/블로그/보도자료로 재확인",
        ],
    ),
    (
        "AI·디자인 도구 필수 추적",
        [
            "OpenAI: ChatGPT, Images, Sora, Codex, API, Canvas/앱 경험, 디자인 도구 연동",
            "Anthropic: Claude, Claude Code, Artifacts, MCP, 디자인/프로토타이핑/에이전트 워크플로우",
            "Figma: Figma AI, Dev Mode, Make/Sites, Config, design-to-code, agent/canvas 연동",
            "Adobe: Photoshop, Firefly, Express, Illustrator, Premiere, Creative Cloud, 파트너 AI 모델 연동",
            "Google Gemini: Gemini 앱, Imagen, Veo, Stitch, Google AI Studio, Workspace/검색/쇼핑 UX 연동",
            "기타 디자인 AI: Canva, Framer, Webflow, Relume, Uizard, Galileo, UX Pilot 등 공식 릴리즈와 화면 변화 확인",
        ],
    ),
]


EXPANDED_SOURCE_CANDIDATES = [
    {
        "name": "요즘IT",
        "area": "Service",
        "category": "global_service_ux",
        "url": "https://yozm.wishket.com/magazine/",
        "collect": "UX, PM, 서비스 기획, 디자인 AI, 제품 실무 해설",
        "accept": "웹기획자, PM, 웹디자이너가 화면/여정/기획 판단으로 바로 응용할 수 있는 글",
        "verify": "원문에 인용된 공식 발표, 제품 블로그, 실제 서비스 화면으로 재확인",
    },
    {
        "name": "DIGITAL iNSIGHT UI/UX",
        "area": "Design",
        "category": "global_service_ux",
        "url": "https://ditoday.com/ui-ux/",
        "collect": "UI/UX 트렌드, 디자인 시스템, 디지털 캠페인, 서비스 경험 기사",
        "accept": "국내 클라이언트 미팅에서 화면 구조, 콘텐츠 경험, 브랜드 경험 질문으로 바꿀 수 있는 기사",
        "verify": "기사 내 기업/서비스 공식 발표와 화면 자료로 재확인",
    },
    {
        "name": "pxd / pxd UX Lab",
        "area": "Service",
        "category": "global_service_ux",
        "url": "https://www.pxd.co.kr/ko/insights",
        "collect": "UX 리서치, 서비스 디자인, 데이터 기반 UX, 접근성, 컨설팅 인사이트",
        "accept": "리서치 방법, IA, 서비스 여정, 접근성 관점이 실무 체크리스트로 전환되는 글",
        "verify": "사례의 공개 범위와 원문 날짜를 확인하고 특정 수치는 원출처로 재확인",
    },
    {
        "name": "토스 테크 Design",
        "area": "Design",
        "category": "global_service_ux",
        "url": "https://toss.tech/design",
        "collect": "프로덕트 디자인, UX 리서치, 디자인 시스템, 금융 UX, 제품 조직 사례",
        "accept": "디자인 시스템, 사용자 리서치, 복잡한 제품 구조 개선처럼 클라이언트 적용 질문이 선명한 글",
        "verify": "토스 공식 글을 1차 출처로 쓰고 관련 세션/영상이 있으면 보조 출처로 연결",
    },
    {
        "name": "디자인 스펙트럼",
        "area": "Design",
        "category": "global_service_ux",
        "url": "https://www.designspectrum.org/",
        "collect": "디자인 커뮤니티 글, Spectrum Picks, 컨퍼런스, 제품/브랜드 디자인 사례",
        "accept": "국내 디자이너 커뮤니티에서 반복적으로 언급되는 디자인/제품 흐름",
        "verify": "큐레이션 글은 원문 링크를 찾아 공식/원출처 기준으로 재확인",
    },
    {
        "name": "오픈서베이 블로그/트렌드 리포트",
        "area": "Service",
        "category": "global_service_ux",
        "url": "https://blog.opensurvey.co.kr/",
        "collect": "CX, 소비자 조사, 리서치 리포트, 서비스 경험 정량 근거",
        "accept": "사용자 행동 변화나 시장 맥락을 정량 근거로 보강할 수 있는 리포트",
        "verify": "조사 기간, 표본, 응답자 조건, 인용 가능 범위를 함께 기록",
    },
    {
        "name": "PUBLY",
        "area": "Service",
        "category": "global_service_ux",
        "url": "https://publy.co/",
        "collect": "PM, 서비스 기획, 제품 조직 운영, 성장 사례",
        "accept": "공개 URL로 접근 가능하고 제품/기획 의사결정에 대한 실무 맥락이 있는 글",
        "verify": "유료/폐쇄 콘텐츠는 본문 인용 없이 공개 메타 정보와 별도 공식 출처로만 검증",
    },
    {
        "name": "공식 제품 YouTube",
        "area": "Design",
        "category": "ai",
        "url": "https://www.youtube.com/",
        "collect": "OpenAI, Anthropic, Figma, Adobe Creative Cloud, Google Design, Google for Developers 공식 데모/발표",
        "accept": "공식 채널 영상이며 발표 날짜, 실제 화면/데모, 제품명, 설명란 원문 링크 또는 공식 발표 맥락이 확인되는 영상",
        "verify": "공식 채널/공식 컨퍼런스 영상은 최종 기준 원문으로 쓸 수 있습니다. 설명란의 공식 블로그, 릴리즈 노트, 문서 링크가 있으면 함께 연결합니다.",
    },
    {
        "name": "국내 실무 YouTube",
        "area": "Service",
        "category": "global_service_ux",
        "url": "https://www.youtube.com/",
        "collect": "토스 메이커스 컨퍼런스, 디자인 스펙트럼, pxd, EO의 제품/디자인/AI 인터뷰",
        "accept": "제품팀/디자인팀 실무자가 직접 말하는 화면 구조, 리서치, 디자인 시스템, AI 워크플로우 사례",
        "verify": "공식 회사/공식 컨퍼런스 채널은 후보 카드로 수집합니다. 개인·인터뷰 영상은 후보 발견 출처나 관련 글로 남기고 제품 출시/수치는 공식 출처로 재확인합니다.",
    },
    {
        "name": "OpenAI",
        "area": "Design",
        "category": "ai",
        "url": "https://openai.com/news/",
        "collect": "ChatGPT, Images, Sora, Codex, API, Canvas/앱 경험, 디자인 도구 연동",
        "accept": "이미지 생성, 프로토타이핑, 앱 경험, 디자인 도구 연동, UI 개발 워크플로우 변화",
        "verify": "OpenAI 공식 글/문서 우선, 디자인 도구 파트너 발표와 교차 확인",
    },
    {
        "name": "Anthropic / Claude",
        "area": "Design",
        "category": "ai",
        "url": "https://www.anthropic.com/news",
        "collect": "Claude, Claude Code, Artifacts, MCP, 디자인/프로토타이핑/에이전트 워크플로우",
        "accept": "기획자/디자이너의 프로토타이핑 또는 UIUX 개발자의 에이전트 구현 흐름을 바꾸는 변화",
        "verify": "Anthropic 공식 글/지원 문서와 제품 화면 또는 파트너 공식 글로 재확인",
    },
    {
        "name": "Figma",
        "area": "Design",
        "category": "ai",
        "url": "https://www.figma.com/blog/",
        "collect": "Figma AI, Dev Mode, Make/Sites, Config, design-to-code, agent/canvas 연동",
        "accept": "디자인 시스템, 프로토타입, 개발 핸드오프, 디자인-코드 왕복을 바꾸는 기능",
        "verify": "Figma 공식 블로그/릴리즈와 실제 데모 영상, 문서로 재확인",
    },
    {
        "name": "Adobe / Photoshop / Firefly",
        "area": "Design",
        "category": "ai",
        "url": "https://blog.adobe.com/",
        "collect": "Photoshop, Firefly, Express, Illustrator, Creative Cloud, 파트너 AI 모델 연동",
        "accept": "웹디자이너의 이미지 제작, 브랜드 시안, 배너/상세페이지 제작 흐름을 바꾸는 기능",
        "verify": "Adobe 공식 블로그/뉴스룸과 앱별 릴리즈 노트로 재확인",
    },
    {
        "name": "Google Gemini",
        "area": "Design",
        "category": "ai",
        "url": "https://blog.google/products/gemini/",
        "collect": "Gemini 앱, Imagen, Veo, Stitch, Google AI Studio, Workspace/검색/쇼핑 UX 연동",
        "accept": "AI 검색, 이미지/영상 생성, 앱/프로토타입 생성, 쇼핑/업무 화면 경험에 영향을 주는 변화",
        "verify": "Google 공식 블로그, DeepMind/AI Studio 문서, 제품 데모로 재확인",
    },
    {
        "name": "기타 디자인 AI",
        "area": "Design",
        "category": "ai",
        "url": "",
        "collect": "Canva, Framer, Webflow, Relume, Uizard, Galileo, UX Pilot 등 디자인/프로토타이핑 AI",
        "accept": "공식 릴리즈와 실제 화면 변화가 있고 국내 웹기획/웹디자인 업무에 적용 가능한 기능",
        "verify": "공식 릴리즈, 제품 데모, 가격/출시 범위, 사용 가능 지역을 확인",
    },
]


def infer_job_tags(candidate: dict[str, str]) -> str:
    text = " ".join(
        [
            candidate.get("name", ""),
            candidate.get("area", ""),
            candidate.get("category", ""),
            candidate.get("collect", ""),
            candidate.get("accept", ""),
        ]
    ).lower()
    tags: list[str] = []

    if any(keyword in text for keyword in ["design", "디자인", "ui", "비주얼", "브랜드", "photoshop", "firefly", "figma"]):
        tags.append("웹디자인")
    if any(keyword in text for keyword in ["ux", "pm", "기획", "서비스", "정책", "혜택", "플로우", "리서치", "cx", "프로토타입"]):
        tags.append("웹서비스기획")
    if any(keyword in text for keyword in ["dev", "code", "코드", "개발", "api", "mcp", "frontend", "브라우저", "접근성", "구현"]):
        tags.append("웹DEV")

    return " / ".join(dict.fromkeys(tags)) or "웹서비스기획"


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
        "    - [ ] UIUX 개발자가 화면 구현, 디자인 시스템, 접근성 QA, 브라우저 호환성 판단에 바로 쓸 수 있는가?",
        "    - [ ] 클라우드 관리자 도구, OS 설정, 범용 업무 자동화처럼 UIUX 개발 실무와 거리가 먼 이슈를 제외했는가?",
        "    - [ ] 이번 주 기준 최신 릴리즈, 공식 블로그, 표준 문서, 브라우저 릴리즈 노트로 확인했는가?",
        "    - [ ] AI 관련 변화가 있으면 최우선 후보로 올렸는가?",
        "    - [ ] 접근성, CSS, JavaScript, HTML, iOS, Chrome, Firefox 속성/API 업데이트 사례를 각각 확인했는가?",
        "    - [ ] 채택할 이슈가 없더라도 확인한 출처와 제외 사유를 리포트 제외 메모에 남겼는가?",
    ]
    for category, signals in DEV_SIGNAL_RULES.items():
        lines.append(f"  - {category}")
        for signal in signals:
            lines.append(f"    - [ ] {signal}")
    return "\n".join(lines)


def build_expanded_source_checklist() -> str:
    lines: list[str] = []
    for group_name, sources in EXPANDED_SOURCE_CHECKLIST:
        lines.append(f"  - {group_name}")
        for source in sources:
            lines.append(f"    - [ ] {source}")
    return "\n".join(lines)


def build_expanded_source_candidates() -> str:
    lines: list[str] = []
    for index, candidate in enumerate(EXPANDED_SOURCE_CANDIDATES, 1):
        lines.extend(
            [
                f"### E{index}. [{candidate['name']}] 확장 수집 후보",
                "",
                f"- 날짜: {candidate.get('date', '')}",
                f"- 국가: {candidate.get('country', 'KR/GLOBAL')}",
                f"- 대분류: {candidate['area']}",
                f"- 직무 태그: {candidate.get('job_tags') or infer_job_tags(candidate)}",
                f"- 카테고리: {candidate['category']}",
                f"- 출처: {candidate['name']}",
                f"- 출처 URL: {candidate['url']}",
                f"- 수집할 데이터: {candidate['collect']}",
                f"- 채택 기준: {candidate['accept']}",
                f"- 검증 방식: {candidate['verify']}",
                "- 이번 주 새 글/영상/릴리즈:",
                "- 후보군 인사이트 요약:",
                "- 공식/주요 출처 재확인 URL:",
                "- 최종 기준 원문 URL:",
                "- 관련 글:",
                "- 관련 글 URL:",
                "- YouTube 채널:",
                "- YouTube 영상 URL:",
                "- YouTube 게시일:",
                "- 발표자/소속:",
                "- 핵심 타임스탬프:",
                "- 설명란 원문 링크:",
                "- transcript 확인: 확인 / 미확인 / 없음",
                "- 이미지:",
                "- 이미지 출처: 최종 기준 원문",
                "- 이미지 확보 메모:",
                "- 원문 확인 결과: 일치 / 일부 불일치 / 원문 미확인",
                "- 원문 조직 기준: 대기업 / 주요 스타트업 / 공식 기관 / 독립 매거진 / 개인·커뮤니티",
                "- 글 등록 가능 여부: 가능 / 제외",
                "- Service/Design/DEV 적용 포인트:",
                "- 채택 점수: /10",
                "- 채택 여부: 채택 / 보류 / 제외",
                "- 제외/주의 사유:",
                "- 리포트 제외 메모:",
                "",
            ]
        )
    return "\n".join(lines).rstrip()


def main() -> None:
    args = parse_args()
    collection_date = parse_collection_date(args.date)
    data = load_platform_data()
    template = TEMPLATE_PATH.read_text(encoding="utf-8")
    content = (
        template.replace("{{date}}", collection_date.isoformat())
        .replace("{{platform_checklist}}", build_platform_checklist(data))
        .replace("{{category_signal_checklist}}", build_category_signal_checklist(data))
        .replace("{{expanded_source_checklist}}", build_expanded_source_checklist())
        .replace("{{expanded_source_candidates}}", build_expanded_source_candidates())
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
