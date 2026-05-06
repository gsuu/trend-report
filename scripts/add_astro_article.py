"""One-shot: insert Astro 6.2 / 7 alpha article into magazine.json."""

import io
import json
import sys
from pathlib import Path

if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

ROOT = Path(__file__).resolve().parents[1]
MAGAZINE_JSON = ROOT / "public" / "data" / "magazine.json"

ASTRO_ARTICLE = {
    "number": "32",
    "platform": "Astro",
    "areaKey": "dev",
    "area": "DEV",
    "categoryKey": "javascript",
    "category": "JAVASCRIPT",
    "sourceType": "release_note",
    "sourceTypeLabel": "공식 릴리즈",
    "publicationDate": "2026-05-06",
    "date": "2026-04-30",
    "route": "/articles/2026-05-06-32",
    "href": "/articles/2026-05-06-32",
    "articleUrl": "https://magazine.cttd.co.kr/articles/2026-05-06-32",
    "image": "https://astro.build/_astro/og-astro-6.2.CeMyCUt2.jpg",
    "imageCaption": "Astro 6.2 릴리즈 노트 og:image",
    "tags": ["Astro", "Vite 8", "Rust 컴파일러", "릴리즈"],
    "takeawayHtml": "Astro 6.2 + 7 알파 — Vite 8과 Rust 컴파일러로 빌드 파이프라인을 다시 짠다",
    "deckHtml": "Astro 6.2는 SVG 옵티마이저, 구조화 JSON 로거, 폰트 파일 URL 헬퍼를 실험 기능으로 풀었다. 같은 글에서 공개된 Astro 7 알파는 Vite 8을 정식 채택하고 Rust 컴파일러를 기본·유일 컴파일러로 못 박는다. 풀스택 빌드 도구가 한 단계씩 올라간 릴리즈다.",
    "facts": [
        {"label": "발행날짜", "valueHtml": "2026-04-30"},
        {"label": "태그", "valueHtml": "Astro Vite 8 Rust 컴파일러 릴리즈"},
        {"label": "국가", "valueHtml": "GLOBAL"},
        {"label": "카테고리", "valueHtml": "JAVASCRIPT"},
        {"label": "직무 태그", "valueHtml": "웹DEV"},
        {"label": "출처", "valueHtml": "Astro Blog"},
    ],
    "sourceUrl": "https://astro.build/blog/astro-620/",
    "sourceTitle": "Astro Blog",
    "referenceLinks": [],
    "sections": [],
    "id": "2026-05-06-32",
    "issueSlug": "2026-05-06",
    "articleSlug": "2026-05-06-32",
}


def make_section(title, prose, items, css_class=None):
    if prose:
        blocks = []
        items_html = []
        for kind, body in items:
            blocks.append({"kind": kind, "html": body})
            items_html.append(f"@@{kind}@@{body}")
        return {
            "title": title,
            "className": css_class or "article-section is-deep-dive",
            "prose": True,
            "blocks": blocks,
            "itemsHtml": items_html,
        }
    blocks = [{"kind": "list", "html": body} for _, body in items]
    items_html = [body for _, body in items]
    return {
        "title": title,
        "className": css_class or "article-section is-bullet-summary",
        "prose": False,
        "blocks": blocks,
        "itemsHtml": items_html,
    }


ASTRO_ARTICLE["sections"] = [
    make_section(
        "요약",
        prose=False,
        items=[
            ("list", "Astro 6.2가 2026-04-30에 공개됐다. SVG 옵티마이저, JSON 로거, <code>experimental_getFontFileURL()</code> 세 가지 실험 기능과 Astro 7 알파 라인업을 한 자리에서 발표했다."),
            ("list", "SVG 옵티마이저는 <code>svgOptimizer</code> 옵션으로 일원화된다. 기존 <code>experimental.svgo</code>를 대체하며 SVGO 외 다른 옵티마이저(OxVG 등)도 같은 인터페이스로 갈아끼울 수 있다."),
            ("list", "구조화 JSON 로거가 들어왔다. <code>experimental.logger: logHandlers.json()</code> 또는 <code>--experimentalJson</code> 플래그로 켜면 코딩 에이전트가 빌드 로그를 그대로 파싱할 수 있다."),
            ("list", "<code>experimental_getFontFileURL()</code>은 prerender 단계에서 폰트 파일 URL을 노출해 Satori 같은 도구로 OG 이미지를 빌드 타임에 생성할 수 있게 한다."),
            ("list", "Astro 7 알파는 Vite 8을 정식 채택하고, Rust 컴파일러를 <code>experimental.rustCompiler</code> 플래그 없이 기본·유일 컴파일러로 못 박는다. <code>npm install astro@alpha</code>로 시범 평가 가능."),
        ],
    ),
    make_section(
        "인사이트",
        prose=True,
        items=[
            ("quote", "프레임워크가 자체 컴파일러와 빌드 도구를 한 번에 갈아끼우는 메이저 전환 — 운영 의존성 평가가 다음 분기 과제로 들어간다."),
            ("subhead", "왜 지금 이 업데이트인가"),
            ("paragraph", "Astro 6.2는 \"실험 기능 셋\" 같은 작은 릴리즈처럼 보이지만, 같은 글에서 Astro 7 알파를 함께 풀며 Vite 8 채택과 Rust 컴파일러 정식화를 못 박았다. 빌드 파이프라인의 두 핵심 의존성(번들러·컴파일러)이 동시에 한 단계 위로 올라가는 시점이다. Vite 8은 Rolldown 기반으로 dev/build 경로를 좁혔고, Rust 컴파일러는 Go 컴파일러 대비 빌드 시간을 크게 줄여 둔 상태다."),
            ("subhead", "구현 관점"),
            ("paragraph", "현행 코드에서 가장 먼저 점검할 자리는 두 곳이다. 하나는 <code>experimental.svgo</code>를 켜둔 프로젝트 — <code>svgOptimizer: svgoOptimizer()</code>로 옮기는 마이그레이션이 필요하다. 다른 하나는 <code>experimental.rustCompiler</code> 플래그 — Astro 7에서는 플래그 자체가 사라지므로 설정 제거가 정답이다. JSON 로거는 CI 로그 파서나 Claude Code 같은 코딩 에이전트가 구조화된 입력을 받을 때 효과가 가장 크다. <code>experimental_getFontFileURL()</code>은 OG 이미지 빌드 타임 생성 패턴(Satori + sharp)을 안정 경로로 끌어올린다."),
            ("subhead", "실무에 어떻게 적용할 수 있을까"),
            ("list", "Astro 7 알파는 사이드 프로젝트 또는 한 페이지 단위로 시범 빌드해 Vite 8 호환성과 Rust 컴파일러 결과를 측정한다. 운영 코드 이전은 정식 안정 버전 이후."),
            ("list", "Astro 통합/플러그인을 자체 작성한 팀은 Vite 8 내부 변경에 따라 깨질 수 있으니 알파 단계에서 호환성 점검 일정을 미리 잡아둔다."),
            ("list", "코딩 에이전트와 함께 운영하는 빌드 파이프라인은 JSON 로거를 활성화해 로그 파싱 안정성을 확인한다."),
            ("list", "OG 이미지를 매번 런타임에 만드는 구조라면 <code>experimental_getFontFileURL()</code> + Satori 조합으로 빌드 타임 생성 경로로 옮기는 PoC를 후보로 둔다."),
            ("subhead", "점검 질문"),
            ("paragraph", "사이트의 빌드 파이프라인이 Vite 메이저 업그레이드에 얼마나 민감하게 반응하는가, 알파 단계에서 어느 영역부터 시범 적용할 수 있을까. SVG 자동 최적화를 도입했을 때 디자인 시스템에서 들어오는 SVG 자산들이 의도한 형태로 유지되는가. JSON 로거가 활성화되면 현재 CI에서 의존하고 있는 텍스트 로그 파서는 어떤 변경이 필요한가."),
        ],
    ),
]


def main():
    data = json.loads(MAGAZINE_JSON.read_text(encoding="utf-8"))
    issues = data["report"]["issues"]
    # remove existing 32 if any
    issues = [i for i in issues if not (i.get("issueSlug") == "2026-05-06" and i.get("number") == "32")]
    # find insertion index right after last 2026-05-06 issue
    last_idx = -1
    for idx, issue in enumerate(issues):
        if issue.get("issueSlug") == "2026-05-06":
            last_idx = idx
    if last_idx < 0:
        issues.append(ASTRO_ARTICLE)
    else:
        issues.insert(last_idx + 1, ASTRO_ARTICLE)
    data["report"]["issues"] = issues
    MAGAZINE_JSON.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"inserted Astro article at issues[{last_idx + 1}]")


if __name__ == "__main__":
    main()
