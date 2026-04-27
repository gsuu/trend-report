#!/usr/bin/env python3
from __future__ import annotations

import argparse
import html
import json
import os
import re
from dataclasses import dataclass, field
from html.parser import HTMLParser
from pathlib import Path
from urllib.error import URLError
from urllib.request import Request, urlopen


ROOT = Path(__file__).resolve().parents[2]
REPORTS_DIR = ROOT / "reports"
SITE_DIR = ROOT / "site"
ASSETS_DIR = SITE_DIR / "assets"
ARTICLES_DIR = SITE_DIR / "articles"
SHOW_SUBSCRIBE_LINK = True
PRODUCTION_SITE_URL = "https://cttd-magazine.vercel.app"
SITE_DESCRIPTION = "CTTD Service/Design/DEV Weekly Trend Magazine"
SITE_OG_IMAGE = "assets/cttd-logo-email.png"


CATEGORY_LABELS = {
    "fashion": "fashion",
    "ecommerce": "ecommerce",
    "department_store": "department",
    "beauty": "beauty",
    "book_content": "book",
    "global_service_ux": "global",
    "ai": "AI",
    "service": "service",
    "platform": "platform",
    "fintech": "fintech",
    "jp_fashion": "fashion",
    "jp_ecommerce": "ecommerce",
}
CATEGORY_KEYS = {
    "jp_fashion": "fashion",
    "jp_ecommerce": "ecommerce",
    "global_service_ux": "global",
    "ai_dev": "ai",
}

MAIN_CATEGORY_ORDER = {"service": 0, "design": 1, "dev": 2}
MAIN_CATEGORY_LABELS = {
    "service": "Service",
    "design": "Design",
    "dev": "DEV",
}
SERVICE_CATEGORY_KEYS = {
    "service",
    "services",
    "service_planning",
    "planning",
    "pm",
    "product",
    "product_management",
    "ux",
    "uiux",
    "ui_ux",
    "web_service",
    "webservice",
    "서비스",
    "서비스기획",
    "웹서비스기획",
}
DESIGN_CATEGORY_KEYS = {
    "design",
    "web_design",
    "webdesign",
    "product_design",
    "visual",
    "visual_design",
    "brand",
    "branding",
    "design_system",
    "ui_design",
    "디자인",
    "웹디자인",
    "브랜드",
    "비주얼",
    "디자인시스템",
}
DEVELOP_CATEGORY_KEYS = {
    "dev",
    "develop",
    "development",
    "engineering",
    "fe",
    "frontend",
    "frontend_development",
    "backend",
    "web_development",
    "web_develop",
    "개발",
    "프론트",
    "프론트엔드",
}
DEVELOP_SUBCATEGORY_ORDER = (
    "ai",
    "update",
    "html",
    "css",
    "javascript",
    "web_accessibility",
    "tool",
    "data_api",
)
DEVELOP_SUBCATEGORY_CLASSIFICATION_ORDER = (
    "ai",
    "update",
    "web_accessibility",
    "css",
    "html",
    "data_api",
    "tool",
    "javascript",
)
DEVELOP_SUBCATEGORY_LABELS = {
    "html": "HTML",
    "css": "CSS",
    "javascript": "JAVASCRIPT",
    "web_accessibility": "웹접근성",
    "update": "Update",
    "ai": "AI",
    "tool": "TOOL",
    "data_api": "DATA/API",
    "performance": "Performance",
    "accessibility": "Accessibility",
    "browser": "Browser",
    "frontend": "Frontend",
    "ai_dev": "AI/DEV",
    "publishing": "Publishing",
    "ai_design": "AI/Design",
    "pwa": "PWA",
}
DEVELOP_SUBCATEGORY_KEYWORDS = {
    "html": {"html", "dom", "markup", "semantic_html", "semantics", "document", "web_components", "custom_elements", "custom_element", "template", "popover", "dialog", "details", "마크업", "시맨틱", "시맨틱_html", "웹컴포넌트"},
    "css": {"css", "cssgridlanes", "css_grid_lanes", "grid", "grid_lanes", "layout", "style", "styles", "responsive", "animation", "container_query", "container_queries", "anchor_positioning", "view_transition", "scroll_driven_animation", "baseline", "레이아웃", "반응형", "스타일", "애니메이션"},
    "javascript": {"javascript", "js", "typescript", "ts", "type_script", "es2025", "es2026", "temporal", "node", "nodejs", "node_js", "eslint", "lint", "next", "nextjs", "next_js", "react", "vue", "svelte", "astro", "framework", "frontend", "frontend_development", "front_end", "fe", "web_development", "web_develop", "adapterapi", "adapter_api", "opennext", "runtime", "component", "components", "design_system", "storybook", "프론트", "프론트엔드", "웹개발", "컴포넌트", "디자인시스템"},
    "web_accessibility": {"accessibility", "a11y", "wcag", "aria", "screen_reader", "screenreader", "web_accessibility", "inert", "focus", "keyboard", "웹접근성", "접근성", "스크린리더"},
    "update": {"update", "updates", "release", "releases", "release_note", "release_notes", "technology_preview", "safari_technology_preview", "stp", "browser", "browsers", "chrome", "chromium", "firefox", "mozilla", "safari", "webkit", "ios", "ipados", "업데이트", "릴리즈", "브라우저"},
    "ai": {"ai", "ai_development", "ai개발", "ai개발도구", "code_assistant", "copilot", "llm", "ai_coding", "ai_assisted_development", "agent", "agentic", "agent_devtools", "agent_dev_tools", "agentdevtools", "agents", "mcp", "model_context_protocol", "코딩어시스턴트"},
    "tool": {"tool", "tools", "tooling", "quality", "test", "testing", "qa", "ci", "cd", "build", "deploy", "release", "monitoring", "observability", "e2e", "eslint", "lint", "devtools", "dev_tools", "chrome", "chromium", "firefox", "mozilla", "safari", "webkit", "ios", "ipados", "browser", "browserlogforwarding", "browser_log_forwarding", "테스트", "품질", "도구", "툴", "빌드", "배포", "모니터링", "브라우저"},
    "data_api": {"data", "api", "data_api", "graphql", "rest", "server", "backend", "database", "db", "auth", "webtransport", "web_transport", "node", "nodejs", "node_js", "runtime", "데이터", "서버", "백엔드", "인증"},
}
DESIGN_SUBCATEGORY_ORDER = (
    "ai",
    "global",
)
DESIGN_SUBCATEGORY_LABELS = {
    "ai": "AI",
    "global": "global",
}
DESIGN_AI_KEYWORDS = {
    "ai",
    "ai디자인",
    "ai이미지",
    "artificial_intelligence",
    "chatgpt",
    "claude",
    "gemini",
    "figma_ai",
    "adobe_firefly",
    "firefly",
    "photoshop",
    "canva",
    "imagen",
    "veo",
    "sora",
    "image_generation",
    "이미지생성",
    "프로토타이핑",
    "디자인ai",
}
GENERIC_SERVICE_CATEGORY_KEYS = {"", "service", "services", "서비스", "web_service", "webservice"}
SERVICE_SUBCATEGORY_CLASSIFICATION_ORDER = (
    "platform",
    "fintech",
    "ecommerce",
    "fashion",
    "beauty",
    "book_content",
    "department_store",
    "ai",
)
SERVICE_SUBCATEGORY_LABELS = {
    "platform": "platform",
    "fintech": "fintech",
    "ecommerce": "ecommerce",
    "fashion": "fashion",
    "beauty": "beauty",
    "book_content": "book",
    "department_store": "department",
    "ai": "AI",
    "service": "service",
}
SERVICE_SUBCATEGORY_KEYWORDS = {
    "platform": {
        "platform", "플랫폼", "마켓플레이스", "marketplace", "커뮤니티", "community", "로컬", "local",
        "후기", "리뷰", "review", "콘텐츠", "content", "추천", "탐색", "검색", "온보딩", "계정",
        "당근", "karrot", "spotify", "오픈서베이", "opensurvey", "서비스플랫폼",
    },
    "fintech": {
        "fintech", "핀테크", "페이", "pay", "결제", "송금", "정산", "간편결제", "캐시", "포인트",
        "금융", "은행", "카드", "보험", "대출", "가맹점", "pos", "사장님", "상점", "매장운영",
        "당근페이", "토스", "토스페이", "토스플레이스", "toss", "panda", "데이터봇", "data_bot", "databot",
    },
    "fashion": {
        "fashion", "패션", "의류", "룩", "스타일", "스타일링", "키즈", "아울렛", "부티크", "스니커즈",
        "무신사", "w컨셉", "wconcept", "지그재그", "zigzag", "브랜드", "옷", "신발", "가방", "원피스",
        "임부복", "수유복", "플러스사이즈", "플러스_사이즈",
    },
    "ecommerce": {
        "ecommerce", "e_commerce", "커머스", "이커머스", "쇼핑", "구매", "결제", "주문", "배송", "장바구니",
        "상품", "상품상세", "상품_상세", "거래", "중고거래", "중고", "리세일", "보상판매", "판매", "스토어",
        "마켓", "홈쇼핑", "멤버십", "쿠폰", "할인", "적립", "환불", "교환", "재고", "큐레이션", "선물",
        "g마켓", "gmarket", "네이버플러스", "롯데홈쇼핑", "당근페이", "rakuten", "楽天市場",
    },
    "beauty": {
        "beauty", "뷰티", "화장품", "스킨케어", "메이크업", "피부", "성분", "제형", "향", "헬스",
        "건강", "건강기능식품", "영양제", "올리브영", "다이소", "무신사뷰티", "무신사_뷰티", "화해",
        "cosme", "코스메", "바로교환", "바로환불",
    },
    "book_content": {
        "book", "book_content", "content", "콘텐츠", "도서", "책", "서점", "전자책", "웹소설", "웹툰",
        "리디", "ridibooks", "밀리의서재", "뷰어", "이어보기", "추천홈",
    },
    "department_store": {
        "department", "department_store", "백화점", "신세계", "롯데백화점", "현대백화점", "팝업", "오프라인",
    },
    "ai": {
        "ai", "생성형ai", "챗봇", "대화형", "자연어", "에이전트", "agent", "agents", "agentic", "llm",
        "추천", "개인화", "자동화", "데이터봇", "data_bot", "databot", "panda", "mcp", "chatgpt", "claude",
    },
}
DEVELOP_DETECTION_EXCLUDED_KEYWORDS = {"ai", "llm"}
DEVELOP_DETECTION_KEYS = DEVELOP_CATEGORY_KEYS.union(
    keyword
    for keywords in DEVELOP_SUBCATEGORY_KEYWORDS.values()
    for keyword in keywords
    if keyword not in DEVELOP_DETECTION_EXCLUDED_KEYWORDS
)

DETAIL_SECTION_TITLES = {"매거진 상세", "사이트 매거진 상세", "웹사이트 상세", "매거진 인사이트"}
DEV_SECTION_HEADING_REPLACEMENTS = {
    "Frontend Development 관점": "구현 관점",
    "프론트엔드 개발 전문가 관점": "구현 관점",
    "UIUX 전문가 관점": "설계 관점",
    "개발자는 무엇을 덜 해도 될까": "실무에 어떻게 적용할 수 있을까",
    "클라이언트에게 던질 질문": "점검 질문",
}
SECTION_BLOCK_PATTERN = re.compile(r"^@@(?P<kind>quote|subhead|paragraph|list)@@(?P<text>.*)")
SUMMARY_LABEL_PATTERN = re.compile(r"^(?P<label>[^:：]{2,18})[:：]\s*(?P<value>.+)$")
CORE_SUMMARY_LABELS = {"업데이트", "서비스 맥락", "디자인 맥락", "기술 맥락", "변경 전", "변경 후"}
HIDDEN_FACT_KEYS = {"출처 URL", "서비스 URL", "상세페이지 초점"}
SOURCE_TITLE_CACHE: dict[str, str] = {}


class SourceTitleParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.in_title = False
        self.meta_title = ""
        self.title_parts: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attrs_dict = {key.lower(): value or "" for key, value in attrs}
        if tag == "meta":
            meta_key = (attrs_dict.get("property") or attrs_dict.get("name", "")).lower()
            content = attrs_dict.get("content", "").strip()
            if meta_key in {"og:title", "twitter:title"} and content and not self.meta_title:
                self.meta_title = content
        elif tag == "title":
            self.in_title = True

    def handle_endtag(self, tag: str) -> None:
        if tag == "title":
            self.in_title = False

    def handle_data(self, data: str) -> None:
        if self.in_title:
            self.title_parts.append(data)

    def title(self) -> str:
        title = self.meta_title or " ".join(self.title_parts)
        return re.sub(r"\s+", " ", html.unescape(title)).strip()


@dataclass
class Issue:
    number: str
    platform: str
    title: str
    tags: list[str]
    category: str
    area: str
    meta: dict[str, str] = field(default_factory=dict)
    sections: dict[str, list[str]] = field(default_factory=dict)
    image: str = ""
    image_caption: str = ""


@dataclass
class Report:
    source_path: Path
    slug: str
    title: str
    period: str
    summary: list[str]
    issues: list[Issue]
    next_week: list[str]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Markdown 리포트를 CTTD 매거진 정적 사이트로 빌드합니다.")
    parser.add_argument("report", nargs="?", help="빌드할 Markdown 리포트 경로. 없으면 reports/의 최신 파일을 사용합니다.")
    return parser.parse_args()


def clean_inline(text: str) -> str:
    escaped = html.escape(text.strip())
    escaped = re.sub(r"`([^`]+)`", r"<code>\1</code>", escaped)
    return re.sub(
        r"\[([^\]]+)\]\(([^)]+)\)",
        lambda match: f'<a href="{html.escape(match.group(2), quote=True)}">{match.group(1)}</a>',
        escaped,
    )


def meta_text(text: str, fallback: str = "", limit: int = 180) -> str:
    value = text or fallback
    value = re.sub(r"`([^`]+)`", r"\1", value)
    value = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", value)
    value = re.sub(r"<[^>]+>", "", value)
    value = html.unescape(value)
    value = re.sub(r"\s+", " ", value).strip()
    if not value:
        value = fallback
    if limit and len(value) > limit:
        return value[:limit].rstrip() + "..."
    return value


def magazine_base_url() -> str:
    return os.getenv("SITE_URL", os.getenv("MAGAZINE_BASE_URL", PRODUCTION_SITE_URL)).strip().rstrip("/")


def absolute_site_url(path: str = "") -> str:
    base_url = magazine_base_url()
    clean_path = path.strip()
    if not clean_path:
        return base_url
    return f"{base_url}/{clean_path.lstrip('/')}"


def absolute_asset_url(url: str) -> str:
    if re.match(r"^https?://", url):
        return url
    return absolute_site_url(url)


def fetch_source_title(url: str) -> str:
    if not url:
        return ""
    if url in SOURCE_TITLE_CACHE:
        return SOURCE_TITLE_CACHE[url]

    title = ""
    try:
        request = Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urlopen(request, timeout=5) as response:
            charset = response.headers.get_content_charset() or "utf-8"
            document = response.read(180_000).decode(charset, errors="replace")
        parser = SourceTitleParser()
        parser.feed(document)
        title = parser.title()
    except (OSError, UnicodeError, URLError):
        title = ""

    SOURCE_TITLE_CACHE[url] = title
    return title


def issue_source_title(issue: Issue) -> str:
    source_url = issue.meta.get("출처 URL", "")
    return fetch_source_title(source_url) or issue.meta.get("출처", "") or source_url


def is_hidden_fact_key(key: str) -> bool:
    return key in HIDDEN_FACT_KEYS or key.startswith("관련 뉴스")


def parse_reference_link(label: str, value: str) -> dict[str, str]:
    text = value.strip()
    markdown_link = re.match(r"^\[([^\]]+)\]\(([^)]+)\)$", text)
    if markdown_link:
        return {"label": label, "title": markdown_link.group(1).strip(), "url": markdown_link.group(2).strip()}

    if " | " in text:
        title, url = text.split(" | ", 1)
        return {"label": label, "title": title.strip(), "url": url.strip()}

    if re.match(r"^https?://", text):
        title = text if label == "서비스 URL" else fetch_source_title(text) or text
        return {"label": label, "title": title, "url": text}

    return {"label": label, "title": text, "url": ""}


def issue_reference_links(issue: Issue) -> list[dict[str, str]]:
    links: list[dict[str, str]] = []
    for key, value in issue.meta.items():
        if key.startswith("관련 뉴스"):
            links.append(parse_reference_link("관련 뉴스", value))
    if issue.meta.get("서비스 URL"):
        links.append(parse_reference_link("서비스 URL", issue.meta["서비스 URL"]))
    return links


def format_summary_item(text: str) -> str:
    match = SUMMARY_LABEL_PATTERN.match(text.strip())
    if not match:
        return f'<span class="summary-value summary-note">{clean_inline(text)}</span>'
    return (
        f'<span class="summary-key">{clean_inline(match.group("label"))}</span>'
        f'<span class="summary-value">{clean_inline(match.group("value"))}</span>'
    )


def summary_item_class(text: str) -> str:
    return "summary-note-row" if not SUMMARY_LABEL_PATTERN.match(text.strip()) else ""


def summary_item_class_attr(text: str) -> str:
    class_name = summary_item_class(text)
    return f' class="{class_name}"' if class_name else ""


def summary_label(text: str) -> str:
    match = SUMMARY_LABEL_PATTERN.match(text.strip())
    return match.group("label") if match else ""


def is_summary_fact(text: str) -> bool:
    label = summary_label(text)
    return not label or label not in CORE_SUMMARY_LABELS


def split_summary_items(items: list[str]) -> tuple[list[str], list[str]]:
    core_items = [item for item in items if not is_summary_fact(item)]
    fact_items = [item for item in items if is_summary_fact(item)]
    return core_items, fact_items


def section_block(kind: str, text: str) -> str:
    return f"@@{kind}@@{text.strip()}"


def split_section_block(item: str) -> tuple[str, str]:
    match = SECTION_BLOCK_PATTERN.match(item)
    if match:
        return match.group("kind"), match.group("text")
    return "list", item


def is_detail_section(title: str) -> bool:
    return title in DETAIL_SECTION_TITLES


def validate_dev_article_headings(path: Path, lines: list[str]) -> None:
    current_area = ""
    current_issue = ""
    in_practical_steps = False
    practical_step_count = 0
    in_related_tech = False
    related_tech_has_item = False
    errors: list[str] = []

    def close_practical_steps(line_number: int) -> None:
        nonlocal in_practical_steps, practical_step_count
        if in_practical_steps and practical_step_count < 3:
            issue_label = f" ({current_issue})" if current_issue else ""
            errors.append(
                f"- {line_number}행{issue_label}: `실무에 어떻게 적용할 수 있을까`는 "
                "화면 구현 실무 기준 `- ...` 리스트 3개 이상으로 작성해야 합니다."
            )
        in_practical_steps = False
        practical_step_count = 0

    def close_related_tech(line_number: int) -> None:
        nonlocal in_related_tech, related_tech_has_item
        if in_related_tech and not related_tech_has_item:
            issue_label = f" ({current_issue})" if current_issue else ""
            errors.append(f"- {line_number}행{issue_label}: `같이 보면 좋은 기술`은 `- 기술명: 이유` 리스트로 작성해야 합니다.")
        in_related_tech = False
        related_tech_has_item = False

    def close_tracked_sections(line_number: int) -> None:
        close_practical_steps(line_number)
        close_related_tech(line_number)

    for line_number, raw_line in enumerate(lines, 1):
        line = raw_line.strip()
        if line in {"---", "* * *"}:
            close_tracked_sections(line_number)
            continue
        if line.startswith("## "):
            close_tracked_sections(line_number)
            current_area = line[3:].strip()
            current_issue = ""
            continue
        if current_area != "DEV":
            continue
        if line.startswith("#### "):
            close_tracked_sections(line_number)
            heading = line[5:].strip()
            if re.match(r"\d+\.\s*", heading):
                current_issue = heading
            continue
        if line.startswith("##### "):
            close_tracked_sections(line_number)
            continue
        if line.startswith("###### "):
            close_tracked_sections(line_number)
            heading = line[7:].strip()
            replacement = DEV_SECTION_HEADING_REPLACEMENTS.get(heading)
            if replacement:
                issue_label = f" ({current_issue})" if current_issue else ""
                errors.append(f"- {line_number}행{issue_label}: `{heading}` -> `{replacement}`")
            if heading == "실무에 어떻게 적용할 수 있을까":
                in_practical_steps = True
            if heading == "같이 보면 좋은 기술":
                in_related_tech = True
            continue

        if not line:
            continue

        if in_practical_steps:
            if line.startswith("- "):
                practical_step_count += 1
                continue
            if line.startswith("#"):
                close_practical_steps(line_number)
            else:
                issue_label = f" ({current_issue})" if current_issue else ""
                errors.append(f"- {line_number}행{issue_label}: `실무에 어떻게 적용할 수 있을까` 본문은 bullet 리스트만 허용합니다.")
            continue

        if not in_related_tech:
            continue

        if line.startswith("- "):
            related_tech_has_item = True
            if ":" not in line[2:] and "：" not in line[2:]:
                issue_label = f" ({current_issue})" if current_issue else ""
                errors.append(f"- {line_number}행{issue_label}: 관련 기술 항목은 `- 기술명: 왜 같이 보는지` 형식이어야 합니다.")
            continue

        if line.startswith("#"):
            close_related_tech(line_number)
        else:
            issue_label = f" ({current_issue})" if current_issue else ""
            errors.append(f"- {line_number}행{issue_label}: `같이 보면 좋은 기술` 본문은 bullet 리스트만 허용합니다.")

    close_tracked_sections(len(lines) + 1)

    if errors:
        raise SystemExit(
            f"{path}: DEV 아티클 형식이 현재 템플릿과 다릅니다.\n"
            + "\n".join(errors)
        )


def slugify(value: str) -> str:
    slug = re.sub(r"[^0-9a-zA-Z가-힣]+", "-", value.lower()).strip("-")
    return slug or "article"


def normalize_category_token(value: str) -> str:
    content = re.sub(r"`([^`]+)`", r"\1", value.strip().lower())
    content = content.replace("#", "")
    content = re.sub(r"[\s./\-]+", "_", content)
    content = re.sub(r"[^0-9a-z가-힣_]+", "_", content)
    return re.sub(r"_+", "_", content).strip("_")


def issue_tokens(issue: Issue) -> set[str]:
    values = [
        issue.area,
        issue.category,
        issue.platform,
        issue.title,
        issue.meta.get("카테고리", ""),
        issue_deck(issue),
    ]
    values.extend(issue.tags)
    for section_title, section_items in issue.sections.items():
        values.append(section_title)
        values.extend(section_items)

    tokens: set[str] = set()
    for value in values:
        for part in re.split(r"[,/|>·]+", value):
            token = normalize_category_token(part)
            if not token:
                continue
            tokens.add(token)
            tokens.update(segment for segment in token.split("_") if segment)
    return tokens


def issue_classification_blob(issue: Issue) -> str:
    values = [
        issue.area,
        issue.category,
        issue.platform,
        issue.title,
        issue.meta.get("카테고리", ""),
        issue.meta.get("출처", ""),
        issue_deck(issue),
    ]
    values.extend(issue.tags)
    for section_title, section_items in issue.sections.items():
        values.append(section_title)
        values.extend(section_items)
    return normalize_category_token(" ".join(values))


def infer_service_category_key(issue: Issue, raw_category: str) -> str:
    normalized_raw_category = normalize_category_token(raw_category)
    if normalized_raw_category not in GENERIC_SERVICE_CATEGORY_KEYS:
        return CATEGORY_KEYS.get(normalized_raw_category, normalized_raw_category)

    tokens = issue_tokens(issue)
    blob = issue_classification_blob(issue)
    scores: dict[str, int] = {}
    for category_key, keywords in SERVICE_SUBCATEGORY_KEYWORDS.items():
        matches = tokens.intersection(keywords)
        score = len(matches)
        score += sum(1 for keyword in keywords if keyword and keyword in blob and keyword not in matches)
        if score:
            scores[category_key] = score

    if not scores:
        return "service"

    return sorted(
        scores,
        key=lambda category_key: (
            -scores[category_key],
            SERVICE_SUBCATEGORY_CLASSIFICATION_ORDER.index(category_key)
            if category_key in SERVICE_SUBCATEGORY_CLASSIFICATION_ORDER
            else 99,
        ),
    )[0]


def is_develop_issue(issue: Issue) -> bool:
    area = normalize_category_token(issue.area)
    if area in SERVICE_CATEGORY_KEYS or area in DESIGN_CATEGORY_KEYS:
        return False
    if area in DEVELOP_CATEGORY_KEYS:
        return True
    return bool(issue_tokens(issue).intersection(DEVELOP_DETECTION_KEYS))


def is_design_issue(issue: Issue) -> bool:
    area = normalize_category_token(issue.area)
    if area in DESIGN_CATEGORY_KEYS:
        return True
    if area in SERVICE_CATEGORY_KEYS or area in DEVELOP_CATEGORY_KEYS:
        return False
    tokens = issue_tokens(issue)
    if tokens.intersection(DESIGN_CATEGORY_KEYS):
        service_hits = tokens.intersection({"웹서비스기획", "service_planning", "planning", "pm", "서비스기획"})
        develop_hits = tokens.intersection({"웹dev", "frontend", "development", "dev"})
        return not service_hits and not develop_hits
    return False


def issue_area_key(issue: Issue) -> str:
    if normalize_category_token(issue.category or issue.meta.get("카테고리", "")) == "ai_design":
        return "design"
    if is_develop_issue(issue):
        return "dev"
    if is_design_issue(issue):
        return "design"
    return "service"


def issue_area_label(issue: Issue) -> str:
    return MAIN_CATEGORY_LABELS[issue_area_key(issue)]


def issue_category_key(issue: Issue) -> str:
    area_key = issue_area_key(issue)
    raw_category = issue.category or issue.meta.get("카테고리", "")
    normalized_raw_category = normalize_category_token(raw_category)
    if area_key == "design":
        tokens = issue_tokens(issue)
        if normalized_raw_category == "ai" or tokens.intersection(DESIGN_AI_KEYWORDS):
            return "ai"
        return CATEGORY_KEYS.get(normalized_raw_category, normalized_raw_category) or "global"

    if area_key != "dev":
        return infer_service_category_key(issue, raw_category) or area_key

    if normalized_raw_category:
        return CATEGORY_KEYS.get(normalized_raw_category, normalized_raw_category)
    tokens = issue_tokens(issue)
    for category_key in DEVELOP_SUBCATEGORY_CLASSIFICATION_ORDER:
        if tokens.intersection(DEVELOP_SUBCATEGORY_KEYWORDS.get(category_key, set())):
            return category_key
    return "javascript"


def issue_category_label(issue: Issue) -> str:
    category_key = issue_category_key(issue)
    area_key = issue_area_key(issue)
    if area_key == "dev":
        return DEVELOP_SUBCATEGORY_LABELS.get(category_key, CATEGORY_LABELS.get(category_key, category_key))
    if area_key == "design":
        return DESIGN_SUBCATEGORY_LABELS.get(category_key, CATEGORY_LABELS.get(category_key, category_key))
    return CATEGORY_LABELS.get(category_key, category_key)


def split_issue_title(raw: str) -> tuple[str, str, str, list[str]]:
    match = re.match(r"(?P<number>\d+)\.\s*(?P<body>.+)", raw)
    number = match.group("number") if match else "0"
    body = match.group("body") if match else raw

    platform_match = re.match(r"\[(?P<platform>[^\]]+)\]\s*(?P<rest>.*)", body)
    if platform_match:
        platform = platform_match.group("platform")
        rest = platform_match.group("rest").strip()
    else:
        platform = body.split()[0]
        rest = body

    raw_tags = re.findall(r"#([^\s#]+)", rest)
    tags = normalize_tags([tag for tag in raw_tags if not tag.isdigit()])
    title = re.sub(r"#(?!\d+\b)[^\s#]+", "", rest).strip() or platform
    return number, platform, title, tags


def normalize_tag(value: str) -> str:
    tag = value.strip().lstrip("#")
    squashed = re.sub(r"\s+", "", tag).lower()
    aliases = {
        "uiux웹디자이너": "웹디자인",
        "uiux디자이너": "웹디자인",
        "웹서비스기획자": "웹서비스기획",
        "웹기획자": "웹서비스기획",
        "웹dev": "웹DEV",
        "웹퍼블리셔": "웹DEV",
        "webdev": "웹DEV",
    }
    return aliases.get(squashed, tag)


def normalize_tags(values: list[str]) -> list[str]:
    tags: list[str] = []
    seen: set[str] = set()
    for value in values:
        tag = normalize_tag(value)
        key = re.sub(r"\s+", "", tag).lower()
        if tag and key not in seen:
            tags.append(tag)
            seen.add(key)
    return tags


def split_meta_tags(value: str) -> list[str]:
    return normalize_tags([
        tag
        for tag in re.split(r"[,/|]", value)
        if tag.strip().lstrip("#")
    ])


def parse_report(path: Path) -> Report:
    lines = path.read_text(encoding="utf-8").splitlines()
    validate_dev_article_headings(path, lines)
    title = path.stem
    period = ""
    summary: list[str] = []
    next_week: list[str] = []
    issues: list[Issue] = []
    current_area = ""
    current_category = ""
    current_issue: Issue | None = None
    current_section = ""

    for raw_line in lines:
        line = raw_line.strip()
        if not line or line in {"---", "* * *"}:
            continue

        if line.startswith("# "):
            title = line[2:].strip()
            continue

        if line and not line.startswith("#") and not period:
            period = line
            continue

        if line.startswith("## "):
            current_area = line[3:].strip()
            current_issue = None
            current_section = ""
            continue

        if line.startswith("### "):
            current_category = line[4:].strip()
            current_issue = None
            current_section = ""
            continue

        if line.startswith("#### "):
            heading = line[5:].strip()
            if re.match(r"\d+\.\s*", heading):
                number, platform, item_title, tags = split_issue_title(heading)
                current_issue = Issue(
                    number=number,
                    platform=platform,
                    title=item_title,
                    tags=tags,
                    category=current_category,
                    area=current_area,
                )
                issues.append(current_issue)
                current_section = ""
            else:
                current_section = heading
            continue

        if line.startswith("###### "):
            if current_issue and current_section:
                current_issue.sections.setdefault(current_section, []).append(section_block("subhead", line[7:].strip()))
            continue

        if line.startswith("##### "):
            current_section = line[6:].strip()
            if current_issue:
                current_issue.sections.setdefault(current_section, [])
            continue

        if line.startswith("> "):
            if current_issue and current_section:
                current_issue.sections.setdefault(current_section, []).append(section_block("quote", line[2:].strip()))
            continue

        if line.startswith("- "):
            item = line[2:].strip()
            if current_area == "이번 주 요약" and not current_issue:
                summary.append(item)
                continue
            if current_area == "다음 주 확인할 것":
                next_week.append(item)
                continue
            if not current_issue:
                continue

            if current_section:
                if is_detail_section(current_section):
                    current_issue.sections.setdefault(current_section, []).append(section_block("list", item))
                else:
                    current_issue.sections.setdefault(current_section, []).append(item)
                continue

            if ":" in item:
                key, value = item.split(":", 1)
                key = key.strip()
                value = value.strip()
                if key == "이미지":
                    current_issue.image = value
                elif key == "이미지 설명":
                    current_issue.image_caption = value
                else:
                    current_issue.meta[key] = value
                    if key in {"태그", "직무 태그", "직무태그"}:
                        for tag in split_meta_tags(value):
                            if tag not in current_issue.tags:
                                current_issue.tags.append(tag)

            continue

        if current_issue and current_section:
            if is_detail_section(current_section):
                current_issue.sections.setdefault(current_section, []).append(section_block("paragraph", line))
            else:
                current_issue.sections.setdefault(current_section, []).append(line)

    slug = path.stem.replace("-uiux-web-service-weekly-trend-report", "")
    return Report(path, slug, title, period, summary, issues, next_week)


def render_header_category_nav(report: Report, active: str = "") -> str:
    href_prefix = "../index.html" if active == "article" else ""
    categories: list[dict[str, str]] = []
    seen_category_keys: set[str] = set()
    for issue in report.issues:
        key = issue_area_key(issue)
        if key in seen_category_keys:
            continue
        seen_category_keys.add(key)
        categories.append({"key": key, "label": issue_area_label(issue)})

    categories = sorted(
        categories,
        key=lambda category: MAIN_CATEGORY_ORDER.get(category["key"], 99),
    )
    category_links = "\n".join(
        f'      <a href="{href_prefix}category/{html.escape(category["key"], quote=True)}" '
        f'data-category-nav="{html.escape(category["key"], quote=True)}">{clean_inline(category["label"])}</a>'
        for category in categories
    )
    return f"""    <nav class="header-category-nav" aria-label="매거진 카테고리">
      <a href="{href_prefix or './'}" data-category-nav="">전체</a>
{category_links}
    </nav>
"""


def html_shell(
    title: str,
    body: str,
    active: str = "",
    header_nav: str = "",
    description: str = SITE_DESCRIPTION,
    image: str = SITE_OG_IMAGE,
    url: str = "",
    page_type: str = "website",
    og_title: str = "",
    image_alt: str = "",
) -> str:
    home_href = "../" if active == "article" else "./"
    stylesheet = "../assets/styles.css" if active == "article" else "assets/styles.css"
    logo = "../assets/cttd-logo.svg" if active == "article" else "assets/cttd-logo.svg"
    body_class = ' class="is-article-page"' if active == "article" else ""
    meta_title = meta_text(og_title or title, title, 120)
    meta_description = meta_text(description, SITE_DESCRIPTION, 180)
    meta_image = absolute_asset_url(image or SITE_OG_IMAGE)
    meta_url = url or absolute_site_url()
    meta_image_alt = meta_text(image_alt or meta_title, meta_title, 120)
    subscribe_link = ""
    subscribe_modal = ""
    subscribe_script = ""
    if SHOW_SUBSCRIBE_LINK:
        subscribe_link = """      <button class="subscribe-link" type="button" data-subscribe-open>
        <span>Subscribe</span>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 6h16v12H4z" />
          <path d="m4 7 8 6 8-6" />
        </svg>
      </button>
"""
        subscribe_modal = """
  <div class="subscribe-modal" data-subscribe-modal hidden role="dialog" aria-modal="true" aria-labelledby="subscribe-title">
    <button class="subscribe-backdrop" type="button" data-subscribe-close aria-label="구독 창 닫기"></button>
    <form class="subscribe-panel" data-subscribe-form>
      <div class="subscribe-panel-head">
        <h2 id="subscribe-title">Subscribe</h2>
        <button class="subscribe-close-button" type="button" data-subscribe-close aria-label="구독 창 닫기">×</button>
      </div>
      <label class="subscribe-field">
        <input name="email" type="email" required autocomplete="email" placeholder=" ">
        <span>이메일<strong aria-hidden="true">*</strong></span>
      </label>
      <div class="subscribe-options" role="group" aria-labelledby="static-subscribe-category-label">
        <span id="static-subscribe-category-label" class="subscribe-category-label">구독 카테고리<span aria-hidden="true">*</span></span>
        <label>
          <input name="audiences" type="checkbox" value="Service/Design" checked>
          <span>Service/Design</span>
        </label>
        <label>
          <input name="audiences" type="checkbox" value="DEV">
          <span>DEV</span>
        </label>
      </div>
      <p class="subscribe-message" data-subscribe-message hidden></p>
      <button class="subscribe-submit-button" type="submit">구독 신청 하기</button>
    </form>
  </div>
"""
        subscribe_script = """
  <script>
    (() => {
      const modal = document.querySelector("[data-subscribe-modal]");
      const form = document.querySelector("[data-subscribe-form]");
      const message = document.querySelector("[data-subscribe-message]");
      const submitButton = document.querySelector(".subscribe-submit-button");
      const apiBaseUrl = (window.NEWSLETTER_API_BASE_URL || "https://cttd-magazine.vercel.app").replace(/\\/$/, "");
      const openModal = () => {
        modal.hidden = false;
        document.body.classList.add("is-subscribe-open");
        message.hidden = true;
        message.textContent = "";
        form.email.focus();
      };
      const closeModal = () => {
        modal.hidden = true;
        document.body.classList.remove("is-subscribe-open");
      };
      document.querySelectorAll("[data-subscribe-open]").forEach((button) => button.addEventListener("click", openModal));
      document.querySelectorAll("[data-subscribe-close]").forEach((button) => button.addEventListener("click", closeModal));
      form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const audiences = Array.from(form.querySelectorAll("input[name='audiences']:checked")).map((input) => input.value);
        message.hidden = true;
        message.className = "subscribe-message";
        submitButton.disabled = true;
        submitButton.textContent = "신청 중";
        try {
          const response = await fetch(`${apiBaseUrl}/api/subscribe`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: form.email.value, audiences }),
          });
          const responseText = await response.text();
          const data = responseText ? JSON.parse(responseText) : {};
          if (!response.ok || !data.ok) throw new Error(data.error || "구독 신청을 처리하지 못했습니다.");
          message.textContent = "구독 신청이 완료되었습니다.";
          message.classList.add("is-success");
          message.hidden = false;
        } catch (error) {
          message.textContent = error.message || "구독 신청을 처리하지 못했습니다.";
          message.classList.add("is-error");
          message.hidden = false;
        } finally {
          submitButton.disabled = false;
          submitButton.textContent = "구독 신청 하기";
        }
      });
    })();
  </script>
"""
    header_actions = f"""    <div class="header-actions">
{subscribe_link}\
    </div>
""" if subscribe_link else ""
    cttd_url = "https://www.cttd.co.kr/"
    return f"""<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{html.escape(title)}</title>
  <meta name="description" content="{html.escape(meta_description, quote=True)}">
  <meta property="og:type" content="{html.escape(page_type, quote=True)}">
  <meta property="og:site_name" content="CTTD Trend Magazine">
  <meta property="og:title" content="{html.escape(meta_title, quote=True)}">
  <meta property="og:description" content="{html.escape(meta_description, quote=True)}">
  <meta property="og:image" content="{html.escape(meta_image, quote=True)}">
  <meta property="og:image:alt" content="{html.escape(meta_image_alt, quote=True)}">
  <meta property="og:url" content="{html.escape(meta_url, quote=True)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{html.escape(meta_title, quote=True)}">
  <meta name="twitter:description" content="{html.escape(meta_description, quote=True)}">
  <meta name="twitter:image" content="{html.escape(meta_image, quote=True)}">
  <link rel="icon" href="/favicon.ico">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="preconnect" href="https://cdn.jsdelivr.net">
  <link rel="preconnect" href="https://unpkg.com">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/sun-typeface/SUIT@2/fonts/variable/woff2/SUIT-Variable.css">
  <link rel="stylesheet" href="{stylesheet}">
</head>
<body{body_class}>
  <header class="site-header">
    <a class="header-back-link" href="{home_href}" aria-label="목록으로 돌아가기">
      <span aria-hidden="true">←</span>
    </a>
    <a class="brand" href="{home_href}" aria-label="CTTD Trend Magazine home">
      <img src="{logo}" alt="CTTD">
      <span>Magazine</span>
    </a>
{header_nav}\
{header_actions}\
  </header>
{subscribe_modal}\
  {body}
  <footer class="site-footer">
    <p>Copyright &copy; 2026 CTTD. All rights reserved.</p>
    <a class="footer-site-link" href="{cttd_url}" target="_blank" rel="noreferrer" aria-label="CTTD 웹사이트 바로가기">
      <span>CTTD 웹사이트 바로가기</span>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7 17 17 7" />
        <path d="M9 7h8v8" />
      </svg>
    </a>
  </footer>
{subscribe_script}\
</body>
</html>
"""


def render_summary_item(item: str) -> str:
    label, _, value = item.partition(":")
    if value:
        return f"<li><span>{clean_inline(label)}</span>{clean_inline(value)}</li>"
    return f"<li>{clean_inline(item)}</li>"


def summary_payload(item: str) -> dict[str, str]:
    label, _, value = item.partition(":")
    if value:
        return {"label": label.strip(), "valueHtml": clean_inline(value)}
    return {"label": "", "valueHtml": clean_inline(item)}


def issue_href(report: Report, issue: Issue) -> str:
    return issue_route(issue)


def issue_route(issue: Issue) -> str:
    return f"/articles/{issue.number.zfill(2)}"


def issue_takeaway(issue: Issue) -> str:
    detail_quote = issue_detail_quote(issue)
    if detail_quote:
        return detail_quote

    for section_name in ("인사이트", "기술 변화 요약", "서비스 변화 요약", "핵심 업데이트", "변경 전/후"):
        items = issue.sections.get(section_name, [])
        if items:
            return strip_brief_label(items[0])
    return issue.title or issue.platform


def issue_deck(issue: Issue) -> str:
    items = issue.sections.get("기술 변화 요약", []) or issue.sections.get("디자인 변화 요약", []) or issue.sections.get("서비스 변화 요약", []) or issue.sections.get("핵심 업데이트", [])
    for preferred_label in ("서비스 맥락", "디자인 맥락", "기술 맥락", "변경 후", "확인 포인트", "디자인 포인트"):
        for item in items:
            label, separator, value = str(item).partition(":")
            if separator and label.strip() == preferred_label and value.strip():
                return clean_inline(value.strip())
    if items:
        return strip_brief_label(items[0])
    return issue.meta.get("출처", "")


def issue_update_title(issue: Issue) -> str:
    items = issue.sections.get("기술 변화 요약", []) or issue.sections.get("디자인 변화 요약", []) or issue.sections.get("서비스 변화 요약", []) or issue.sections.get("핵심 업데이트", [])
    for preferred_label in ("업데이트", "핵심 업데이트"):
        for item in items:
            label, separator, value = str(item).partition(":")
            if separator and label.strip() == preferred_label and value.strip():
                return value.strip()
    if items:
        return strip_brief_label(items[0])
    return issue.title or issue.platform


def issue_target_title(issue: Issue) -> str:
    quote = issue_detail_quote(issue)
    if quote:
        return quote
    return issue_takeaway(issue) or issue.title or issue.platform


def issue_target_description(issue: Issue) -> str:
    return issue_deck(issue) or issue_takeaway(issue) or issue.title or issue.platform


def issue_display_title(issue: Issue) -> str:
    return issue_update_title(issue)


def issue_display_description(issue: Issue) -> str:
    return issue_target_title(issue) or issue_target_description(issue)


def issue_newsletter_summary(issue: Issue, limit: int = 76) -> str:
    paragraphs: list[str] = []
    for title, items in issue.sections.items():
        if not is_detail_section(title):
            continue
        for item in items:
            kind, text = split_section_block(item)
            if kind == "paragraph" and text:
                paragraphs.append(text)
            if len(paragraphs) == 2:
                break
        if paragraphs:
            break

    summary = " ".join(paragraphs) or issue_deck(issue)
    summary = re.sub(r"`([^`]+)`", r"\1", summary)
    summary = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", r"\1", summary)
    summary = re.sub(r"\s+", " ", summary).strip()
    if len(summary) > limit:
        summary = summary[:limit].rstrip() + "..."
    return summary


def strip_brief_label(text: str) -> str:
    for label in ("업데이트", "핵심 업데이트", "기술 맥락", "디자인 맥락", "서비스 맥락"):
        prefix = f"{label}:"
        if text.startswith(prefix):
            return text[len(prefix):].strip()
    return text


def issue_detail_quote(issue: Issue) -> str:
    for title, items in issue.sections.items():
        if not is_detail_section(title):
            continue
        for item in items:
            kind, text = split_section_block(item)
            if kind == "quote" and text:
                return text
    return ""


def featured_issues(report: Report) -> list[Issue]:
    must_see = " ".join(item for item in report.summary if item.startswith("꼭 볼 이슈"))
    selected = [issue for issue in report.issues if issue.platform in must_see]
    for issue in report.issues:
        if issue not in selected:
            selected.append(issue)
        if len(selected) == 3:
            break
    return selected


def issue_display_date(report: Report) -> str:
    return report.slug


def render_issue_row(report: Report, issue: Issue, compact: bool = False) -> str:
    tags = " ".join(f"<span>#{clean_inline(tag)}</span>" for tag in issue.tags[:3])
    category = issue_category_label(issue)
    row_class = "issue-row is-compact" if compact else "issue-row"
    return f"""
    <article class="{row_class}">
      <a class="issue-number" href="{issue_href(report, issue)}">{issue.number.zfill(2)}</a>
      <div class="issue-main">
        <p>{clean_inline(category)} / {clean_inline(issue.platform)} / {clean_inline(issue_display_date(report))}</p>
        <h3><a href="{issue_href(report, issue)}">{clean_inline(issue_display_title(issue))}</a></h3>
      </div>
      <div class="tag-row">{tags}</div>
    </article>
    """


def render_latest_card(report: Report, issue: Issue) -> str:
    tags = " ".join(f"<span>#{clean_inline(tag)}</span>" for tag in issue.tags[:2])
    category = issue_category_label(issue)
    image = (
        f'<img src="{html.escape(issue.image, quote=True)}" alt="{html.escape(issue.image_caption or issue.platform, quote=True)}" loading="lazy">'
        if issue.image
        else ""
    )
    return f"""
    <article class="latest-card">
      <a class="latest-thumb" href="{issue_href(report, issue)}">{image}</a>
      <div class="latest-meta">
        <span>{clean_inline(category)} / {clean_inline(issue.platform)}</span>
        <span>{clean_inline(issue_display_date(report))}</span>
      </div>
      <h3><a href="{issue_href(report, issue)}">{clean_inline(issue_display_title(issue))}</a></h3>
      <div class="tag-row">{tags}</div>
    </article>
    """


def render_trending_item(index: int, text: str) -> str:
    return f"""
    <li>
      <span>{index:02d}</span>
      <p>{clean_inline(text)}</p>
    </li>
    """


def render_feed_item(report: Report, issue: Issue) -> str:
    category = issue_category_label(issue)
    image = (
        f'<img src="{html.escape(issue.image, quote=True)}" alt="{html.escape(issue.image_caption or issue.platform, quote=True)}" loading="lazy">'
        if issue.image
        else ""
    )
    item_class = "feed-item" if issue.image else "feed-item has-no-thumb"
    thumb = f'<a class="feed-thumb" href="{issue_href(report, issue)}">{image}</a>' if issue.image else ""
    return f"""
    <article class="{item_class}">
      {thumb}
      <div>
        <p class="feed-meta">
          <img class="feed-plus" src="assets/cttd-plus.svg" alt="+">
          <span>{clean_inline(category)} / {clean_inline(issue.platform)} ↗</span>
        </p>
        <h2><a href="{issue_href(report, issue)}">{clean_inline(issue_display_title(issue))}</a></h2>
        <p class="story-date">{clean_inline(issue_display_date(report))}</p>
      </div>
    </article>
    """


def render_index(report: Report) -> str:
    payload_json = json.dumps(report_payload(report), ensure_ascii=False).replace("</", "<\\/")
    home_description = report.summary[0] if report.summary else SITE_DESCRIPTION
    if ":" in home_description:
        home_description = home_description.split(":", 1)[1].strip()
    home_image = next((issue.image for issue in report.issues if issue.image), SITE_OG_IMAGE)

    body = f"""
  <script id="report-data" type="application/json">{payload_json}</script>
  <main id="app" :class="{{ 'article-main': activeIssue }}" v-cloak>
    <transition name="route" mode="out-in">
      <article v-if="activeIssue" :key="'story-' + activeIssue.number" class="article-layout">
        <header class="article-hero">
          <p class="article-brand" v-text="activeIssue.platform"></p>
          <h1 v-html="activeIssue.takeawayHtml"></h1>
          <p class="article-deck" v-html="activeIssue.deckHtml"></p>
          <div class="article-meta-row">
            <div class="article-meta">
              <time v-text="activeIssue.date"></time>
              <span aria-hidden="true">|</span>
              <span class="category-label" v-text="activeIssue.category"></span>
            </div>
            <button class="article-share-button" type="button" :aria-label="shareStatus || '공유하기'" :title="shareStatus || '공유하기'" @click="shareIssue(activeIssue)">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <path d="M8.6 10.7 15.4 6.3" />
                <path d="M8.6 13.3 15.4 17.7" />
              </svg>
            </button>
          </div>
        </header>
        <div class="article-body">
          <figure v-if="activeIssue.image" class="article-image">
            <img :src="activeIssue.image" :alt="activeIssue.imageCaption || activeIssue.platform">
            <figcaption v-text="activeIssue.imageCaption"></figcaption>
          </figure>
          <section v-for="section in activeIssue.sections" :key="section.title" :class="section.className">
            <h2 v-text="section.title"></h2>
            <div v-if="section.prose" class="section-prose">
              <template v-for="block in section.blocks" :key="block.kind + block.html">
                <blockquote v-if="block.kind === 'quote'" v-html="block.html"></blockquote>
                <h3 v-else-if="block.kind === 'subhead'" v-html="block.html"></h3>
                <p v-else-if="block.kind === 'paragraph'" v-html="block.html"></p>
                <ul v-else class="prose-list"><li v-html="block.html"></li></ul>
              </template>
            </div>
            <template v-else>
              <ul class="summary-list">
                <li v-for="item in summaryCoreItems(section.itemsHtml)" :key="item" :class="summaryItemClass(item)" v-html="formatSummaryItem(item)"></li>
              </ul>
              <div v-if="summaryFactItems(section.itemsHtml).length" class="summary-facts">
                <ul class="summary-fact-list">
                  <li v-for="item in summaryFactItems(section.itemsHtml)" :key="item" :class="summaryItemClass(item)" v-html="formatSummaryItem(item)"></li>
                </ul>
              </div>
            </template>
          </section>
          <footer class="article-footer">
            <div class="tag-row">
              <span v-for="tag in activeIssue.tags" :key="tag" v-text="'#' + tag"></span>
            </div>
            <div v-if="activeIssue.sourceUrl || activeIssue.referenceLinks.length" class="source-link-list">
              <a v-if="activeIssue.sourceUrl" class="source-url" :href="activeIssue.sourceUrl" target="_blank" rel="noreferrer">
                <span class="source-label">출처:</span>
                <span v-text="activeIssue.sourceTitle"></span>
              </a>
              <a v-for="link in activeIssue.referenceLinks" :key="link.label + link.url" class="source-url" :href="link.url" target="_blank" rel="noreferrer">
                <span class="source-label" v-text="link.label + ':'"></span>
                <span v-text="link.title"></span>
              </a>
            </div>
          </footer>
          <div class="article-list-actions">
            <a class="article-list-link" :href="detailReturnRoute" @click.prevent="goToList">목록보기</a>
          </div>
        </div>
      </article>

      <section v-else key="home" id="magazine" class="magazine-home">
        <section v-if="activeCategory" class="subcategory-panel" aria-label="소 카테고리">
          <div class="subcategory-list">
            <a class="subcategory-link" :class="{{ 'is-active': !activeSubcategory }}" :href="categoryPath(activeCategory.key)">
              <span>전체</span>
              <em v-text="categoryIssues.length"></em>
            </a>
            <a v-for="subcategory in subcategories" :key="subcategory.key" class="subcategory-link" :class="{{ 'is-active': activeSubcategory === subcategory.key }}" :href="subcategoryPath(activeCategory.key, subcategory.key)">
              <span v-text="subcategory.label"></span>
              <em v-text="subcategory.count"></em>
            </a>
          </div>
        </section>

        <section class="guide-grid" :aria-label="activeCategory ? activeCategory.label + ' 아티클 목록' : '아티클 목록'">
          <article v-for="issue in visibleIssues" :key="issue.number" class="guide-card">
            <a :href="storyRoute(issue)">
              <div v-if="issue.image" class="guide-thumb">
                <img :src="issue.image" :alt="issue.imageCaption || issue.platform">
              </div>
              <p class="guide-brand" v-text="issue.platform"></p>
              <h2 v-html="issue.takeawayHtml"></h2>
              <strong v-html="issue.deckHtml"></strong>
              <div class="guide-card-foot">
                <time v-text="issue.date"></time>
                <span aria-hidden="true">|</span>
                <span class="category-label" v-text="issue.category"></span>
              </div>
            </a>
          </article>
        </section>
      </section>
    </transition>
  </main>
  <script type="module">
    import {{ createApp }} from "https://unpkg.com/vue@3.5.32/dist/vue.esm-browser.prod.js";

    const report = JSON.parse(document.getElementById("report-data").textContent);

    createApp({{
      data() {{
        return {{
          report,
          route: this.currentRoute(),
          shareStatus: "",
        }};
      }},
      computed: {{
        activeIssue() {{
          const match = this.route.match(/^\\/articles\\/(\\d+)/);
          if (!match) return null;
          return this.report.issues.find((issue) => issue.number === match[1]) || null;
        }},
        activeCategoryKey() {{
          const match = this.route.match(/^\\/category\\/([^/]+)/);
          if (match) return decodeURIComponent(match[1]);
          if (this.activeIssue) {{
            const returnMatch = this.detailReturnRoute.match(/^\\/category\\/([^/]+)/);
            if (returnMatch) return decodeURIComponent(returnMatch[1]);
            return this.activeIssue.areaKey || "";
          }}
          return "";
        }},
        activeSubcategory() {{
          const match = this.route.match(/^\\/category\\/[^/]+\\/([^/?]+)/);
          return match ? decodeURIComponent(match[1]) : "";
        }},
        categories() {{
          const categoryMap = new Map();
          this.report.issues.forEach((issue) => {{
            const key = issue.areaKey || issue.area || "uncategorized";
            if (!categoryMap.has(key)) {{
              categoryMap.set(key, {{
                key,
                label: issue.area || "분류 없음",
                count: 0,
              }});
            }}
            categoryMap.get(key).count += 1;
          }});
          const order = {json.dumps(MAIN_CATEGORY_ORDER)};
          return Array.from(categoryMap.values()).sort((a, b) => (order[a.key] ?? 99) - (order[b.key] ?? 99));
        }},
        activeCategory() {{
          if (!this.activeCategoryKey) return null;
          return this.categories.find((category) => category.key === this.activeCategoryKey) || null;
        }},
        categoryIssues() {{
          if (!this.activeCategory) return this.report.issues;
          return this.report.issues.filter((issue) => (issue.areaKey || issue.area || "uncategorized") === this.activeCategory.key);
        }},
        subcategories() {{
          if (!this.activeCategory) return [];
          const subcategoryMap = new Map();
          const devOrder = {json.dumps({key: index for index, key in enumerate(DEVELOP_SUBCATEGORY_ORDER)})};
          const devLabels = {json.dumps({key: DEVELOP_SUBCATEGORY_LABELS[key] for key in DEVELOP_SUBCATEGORY_ORDER})};
          const serviceOrder = {json.dumps({key: index for index, key in enumerate(SERVICE_SUBCATEGORY_CLASSIFICATION_ORDER + ("service",))})};
          const serviceLabels = {json.dumps(SERVICE_SUBCATEGORY_LABELS)};
          const designOrder = {json.dumps({key: index for index, key in enumerate(DESIGN_SUBCATEGORY_ORDER)})};
          const designLabels = {json.dumps(DESIGN_SUBCATEGORY_LABELS)};
          if (this.activeCategory.key === "service") {{
            Object.keys(serviceOrder).forEach((key) => {{
              subcategoryMap.set(key, {{
                key,
                label: serviceLabels[key] || key,
                count: 0,
              }});
            }});
          }} else if (this.activeCategory.key === "dev") {{
            Object.keys(devOrder).forEach((key) => {{
              subcategoryMap.set(key, {{
                key,
                label: devLabels[key] || key,
                count: 0,
              }});
            }});
          }} else if (this.activeCategory.key === "design") {{
            Object.keys(designOrder).forEach((key) => {{
              subcategoryMap.set(key, {{
                key,
                label: designLabels[key] || key,
                count: 0,
              }});
            }});
          }}
          this.categoryIssues.forEach((issue) => {{
            const key = issue.categoryKey || issue.category;
            if (!subcategoryMap.has(key)) {{
              subcategoryMap.set(key, {{
                key,
                label: issue.category,
                count: 0,
              }});
            }}
            subcategoryMap.get(key).count += 1;
          }});
          const subcategories = Array.from(subcategoryMap.values());
          if (this.activeCategory.key === "service") {{
            return subcategories.sort((a, b) => (serviceOrder[a.key] ?? 99) - (serviceOrder[b.key] ?? 99));
          }}
          if (this.activeCategory.key === "dev") {{
            return subcategories.sort((a, b) => (devOrder[a.key] ?? 99) - (devOrder[b.key] ?? 99));
          }}
          if (this.activeCategory.key === "design") {{
            return subcategories.sort((a, b) => (designOrder[a.key] ?? 99) - (designOrder[b.key] ?? 99));
          }}
          return subcategories;
        }},
        visibleIssues() {{
          if (!this.activeCategory) return this.report.issues;
          if (!this.activeSubcategory) return this.categoryIssues;
          return this.categoryIssues.filter((issue) => (issue.categoryKey || issue.category) === this.activeSubcategory);
        }},
        currentListRoute() {{
          if (this.validListRoute(this.route)) return this.route;
          return "/";
        }},
        detailReturnRoute() {{
          const routeParam = this.routeReturnParam();
          if (routeParam) return routeParam;
          if (this.activeIssue && this.activeIssue.areaKey) return `/category/${{encodeURIComponent(this.activeIssue.areaKey)}}`;
          return "/";
        }},
      }},
      mounted() {{
        this.syncDocumentState();
        this.syncHeaderCategoryState();
        window.addEventListener("popstate", this.updateRoute);
      }},
      unmounted() {{
        document.body.classList.remove("is-story-open");
        window.removeEventListener("popstate", this.updateRoute);
      }},
      methods: {{
        basePath() {{
          const path = window.location.pathname.replace(/\\/+$/, "") || "/";
          return path === "/magazine" || path.startsWith("/magazine/") ? "/magazine" : "";
        }},
        currentRoute() {{
          const base = this.basePath();
          const path = window.location.pathname;
          const routePath = base && (path === base || path.startsWith(`${{base}}/`)) ? path.slice(base.length) || "/" : path || "/";
          return `${{routePath}}${{window.location.search || ""}}`;
        }},
        withBasePath(path) {{
          const base = this.basePath();
          if (!path || path === "/") return base || "/";
          return `${{base}}${{path}}`;
        }},
        updateRoute() {{
          this.route = this.currentRoute();
          this.syncDocumentState();
          this.syncHeaderCategoryState();
          window.scrollTo({{ top: 0, left: 0, behavior: "instant" }});
        }},
        syncDocumentState() {{
          document.body.classList.toggle("is-story-open", Boolean(this.activeIssue));
          document.querySelectorAll(".header-back-link").forEach((link) => {{
            link.setAttribute("href", this.activeIssue ? this.withBasePath(this.detailReturnRoute) : this.withBasePath("/"));
          }});
        }},
        syncHeaderCategoryState() {{
          document.querySelectorAll(".header-category-nav a").forEach((link) => {{
            const key = link.dataset.categoryNav || "";
            const isActive = key === this.activeCategoryKey;
            link.classList.toggle("is-active", isActive);
            if (isActive) {{
              link.setAttribute("aria-current", "page");
            }} else {{
              link.removeAttribute("aria-current");
            }}
          }});
        }},
        categoryPath(categoryKey) {{
          return this.withBasePath(`/category/${{encodeURIComponent(categoryKey)}}`);
        }},
        subcategoryPath(categoryKey, subcategory) {{
          return this.withBasePath(`/category/${{encodeURIComponent(categoryKey)}}/${{encodeURIComponent(subcategory)}}`);
        }},
        storyRoute(issue) {{
          return `${{this.withBasePath(issue.route || `/articles/${{issue.number}}`)}}?from=${{encodeURIComponent(this.currentListRoute)}}`;
        }},
        validListRoute(route) {{
          return route === "/" || route === "" || /^\\/category\\/(service|design|dev|uiux)(?:\\/[^?&]+)?$/.test(route || "");
        }},
        routeReturnParam() {{
          const match = this.route.match(/[?&]from=([^&]+)/);
          if (!match) return "";
          const route = decodeURIComponent(match[1]);
          return this.validListRoute(route) ? route : "";
        }},
        goToList() {{
          window.location.href = this.withBasePath(this.detailReturnRoute);
        }},
        plainText(htmlText) {{
          const node = document.createElement("span");
          node.innerHTML = htmlText || "";
          return node.textContent || node.innerText || "";
        }},
        async shareIssue(issue) {{
          if (!issue) return;
          this.shareStatus = "";
          const shareData = {{
            title: `${{issue.platform}} | Magazine`,
            text: this.plainText(issue.takeawayHtml),
            url: issue.articleUrl || window.location.href,
          }};

          if (navigator.share) {{
            try {{
              await navigator.share(shareData);
              return;
            }} catch (error) {{
              if (error && error.name === "AbortError") return;
            }}
          }}

          if (navigator.clipboard && window.isSecureContext) {{
            await navigator.clipboard.writeText(shareData.url);
            this.shareStatus = "링크 복사됨";
            window.setTimeout(() => {{
              this.shareStatus = "";
            }}, 1600);
          }}
        }},
        formatSummaryItem(item) {{
          const text = String(item);
          const match = text.match(/^([^:：]{{2,18}})[:：]\\s*(.+)$/);
          if (!match) return `<span class="summary-value summary-note">${{text}}</span>`;
          return `<span class="summary-key">${{match[1]}}</span><span class="summary-value">${{match[2]}}</span>`;
        }},
        summaryItemClass(item) {{
          const text = String(item);
          return /^([^:：]{{2,18}})[:：]\\s*(.+)$/.test(text) ? "" : "summary-note-row";
        }},
        isSummaryFact(item) {{
          const text = String(item);
          const match = text.match(/^([^:：]{{2,18}})[:：]\\s*(.+)$/);
          return !match || !["업데이트", "서비스 맥락", "기술 맥락", "변경 전", "변경 후"].includes(match[1]);
        }},
        summaryCoreItems(items) {{
          return items.filter((item) => !this.isSummaryFact(item));
        }},
        summaryFactItems(items) {{
          return items.filter((item) => this.isSummaryFact(item));
        }},
      }},
    }}).mount("#app");
  </script>
"""
    return html_shell(
        "CTTD Trend Magazine",
        body,
        "home",
        render_header_category_nav(report, "home"),
        description=home_description,
        image=home_image,
        url=absolute_site_url(),
        og_title=report.title,
        image_alt="CTTD Trend Magazine",
    )


def section_display_title(title: str) -> str:
    if title == "인사이트":
        return "인사이트"
    if title in DETAIL_SECTION_TITLES:
        return "인사이트"
    return title


def section_class_name(title: str) -> str:
    return "article-section is-deep-dive" if title in DETAIL_SECTION_TITLES else "article-section"


def section_blocks(title: str, items: list[str]) -> list[dict[str, str]]:
    if not is_detail_section(title):
        return [{"kind": "list", "html": clean_inline(item)} for item in items]

    return [
        {"kind": kind, "html": clean_inline(text)}
        for kind, text in (split_section_block(item) for item in items)
        if text.strip()
    ]


def render_reference_links(issue: Issue | None) -> str:
    if not issue:
        return ""
    links = issue_reference_links(issue)
    if not links:
        return ""
    return "".join(
        '<a class="source-url" href="'
        + html.escape(link["url"], quote=True)
        + '" target="_blank" rel="noreferrer">'
        + f'<span class="source-label">{clean_inline(link["label"])}:</span> '
        + f"{clean_inline(link['title'])}</a>"
        for link in links
        if link["url"]
    )


def render_section_content(title: str, items: list[str], issue: Issue | None = None) -> str:
    if not is_detail_section(title):
        core_items, fact_items = split_summary_items(items)
        facts_html = (
            f"""
              <div class="summary-facts">
                <ul class="summary-fact-list">
                  {''.join(f'<li{summary_item_class_attr(item)}>{format_summary_item(item)}</li>' for item in fact_items)}
                </ul>
              </div>
            """
            if fact_items
            else ""
        )
        return f"""
              <ul class="summary-list">
                {''.join(f'<li{summary_item_class_attr(item)}>{format_summary_item(item)}</li>' for item in core_items)}
              </ul>
              {facts_html}
        """

    html_parts: list[str] = ['<div class="section-prose">']
    list_open = False

    def close_list() -> None:
        nonlocal list_open
        if list_open:
            html_parts.append("</ul>")
            list_open = False

    for block in section_blocks(title, items):
        kind = block["kind"]
        content = block["html"]

        if kind == "list":
            if not list_open:
                html_parts.append('<ul class="prose-list">')
                list_open = True
            html_parts.append(f"<li>{content}</li>")
            continue

        close_list()
        if kind == "quote":
            html_parts.append(f"<blockquote>{content}</blockquote>")
        elif kind == "subhead":
            html_parts.append(f"<h3>{content}</h3>")
        else:
            html_parts.append(f"<p>{content}</p>")

    close_list()
    html_parts.append("</div>")
    return "\n".join(html_parts)


def report_payload(report: Report) -> dict[str, object]:
    issues = []
    for issue in report.issues:
        facts = [
            {
                "label": "발행날짜" if key == "날짜" else key,
                "valueHtml": clean_inline(issue_display_date(report) if key == "날짜" else value),
            }
            for key, value in issue.meta.items()
            if not is_hidden_fact_key(key)
        ]
        issues.append(
            {
                "number": issue.number.zfill(2),
                "platform": issue.platform,
                "areaKey": issue_area_key(issue),
                "area": issue_area_label(issue),
                "categoryKey": issue_category_key(issue),
                "category": issue_category_label(issue),
                "date": issue_display_date(report),
                "route": issue_route(issue),
                "href": issue_href(report, issue),
                "articleUrl": absolute_site_url(issue_href(report, issue)),
                "image": issue.image,
                "imageCaption": issue.image_caption,
                "tags": issue.tags,
                "takeawayHtml": clean_inline(issue_display_title(issue)),
                "deckHtml": clean_inline(issue_display_description(issue)),
                "facts": facts,
                "sourceUrl": issue.meta.get("출처 URL", ""),
                "sourceTitle": issue_source_title(issue),
                "referenceLinks": issue_reference_links(issue),
                "sections": [
                    {
                        "title": section_display_title(title),
                        "className": section_class_name(title),
                        "prose": is_detail_section(title),
                        "blocks": section_blocks(title, items),
                        "itemsHtml": [clean_inline(item) for item in items],
                    }
                    for title, items in issue.sections.items()
                ],
            }
        )
    return {
        "slug": report.slug,
        "issues": issues,
    }


def render_compact_link(report: Report, issue: Issue) -> str:
    return f"""
    <a class="compact-link" href="{issue_href(report, issue)}">
      <span>{issue.number.zfill(2)}</span>
      <strong>{clean_inline(issue.platform)}</strong>
      <em>{clean_inline(issue.meta.get("출처", ""))}</em>
    </a>
    """


def render_article(report: Report, issue: Issue) -> str:
    tags = " ".join(f"<span>#{clean_inline(tag)}</span>" for tag in issue.tags)
    facts = "\n".join(
        f"<li><span>{clean_inline('발행날짜' if key == '날짜' else key)}</span>{clean_inline(issue_display_date(report) if key == '날짜' else value)}</li>"
        for key, value in issue.meta.items()
        if not is_hidden_fact_key(key)
    )
    source_url = issue.meta.get("출처 URL", "")
    source_title = issue_source_title(issue)
    section_html = []
    for title, items in issue.sections.items():
        section_title = section_display_title(title)
        section_class = section_class_name(title)
        section_html.append(
            f"""
            <section class="{section_class}">
              <h2>{clean_inline(section_title)}</h2>
              {render_section_content(title, items, issue)}
            </section>
            """
        )

    image = (
        f"""
        <figure class="article-image">
          <img src="{html.escape(issue.image, quote=True)}" alt="{html.escape(issue.image_caption or issue.platform, quote=True)}">
          <figcaption>{clean_inline(issue.image_caption)}</figcaption>
        </figure>
        """
        if issue.image
        else ""
    )
    source_link = (
        '<a class="source-url" '
        f'href="{html.escape(source_url, quote=True)}" target="_blank" rel="noreferrer">'
        f'<span class="source-label">출처:</span> {html.escape(source_title)}</a>'
        if source_url
        else ""
    )
    reference_links = render_reference_links(issue)
    source_notes = (
        f'<div class="source-link-list">{source_link}{reference_links}</div>'
        if source_link or reference_links
        else ""
    )
    body = f"""
  <main class="article-main">
    <article class="article-layout">
      <header class="article-hero">
        <p class="article-brand">{clean_inline(issue.platform)}</p>
        <h1>{clean_inline(issue_display_title(issue))}</h1>
        <p class="article-deck">{clean_inline(issue_display_description(issue))}</p>
        <div class="article-meta-row">
          <div class="article-meta">
            <time>{clean_inline(issue_display_date(report))}</time>
            <span aria-hidden="true">|</span>
            <span class="category-label">{issue_category_label(issue)}</span>
          </div>
          <button class="article-share-button" type="button" data-share-title="{html.escape(issue.platform, quote=True)} | Magazine" data-share-text="{html.escape(issue_display_title(issue), quote=True)}" aria-label="공유하기" title="공유하기">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <path d="M8.6 10.7 15.4 6.3" />
              <path d="M8.6 13.3 15.4 17.7" />
            </svg>
          </button>
        </div>
      </header>
      <div class="article-body">
        {image}
        {''.join(section_html)}
        <footer class="article-footer">
          <div class="tag-row">{tags}</div>
          {source_notes}
        </footer>
        <div class="article-list-actions">
          <a class="article-list-link" href="../">목록보기</a>
        </div>
      </div>
    </article>
  </main>
  <script>
    document.querySelectorAll(".article-share-button[data-share-title]").forEach((button) => {{
      button.addEventListener("click", async () => {{
        const shareData = {{
          title: button.dataset.shareTitle || document.title,
          text: button.dataset.shareText || "",
          url: window.location.href,
        }};

        if (navigator.share) {{
          try {{
            await navigator.share(shareData);
            return;
          }} catch (error) {{
            if (error && error.name === "AbortError") return;
          }}
        }}

        if (navigator.clipboard && window.isSecureContext) {{
          await navigator.clipboard.writeText(shareData.url);
          button.setAttribute("aria-label", "링크 복사됨");
          button.setAttribute("title", "링크 복사됨");
          window.setTimeout(() => {{
            button.setAttribute("aria-label", "공유하기");
            button.setAttribute("title", "공유하기");
          }}, 1600);
        }}
      }});
    }});
  </script>
        """
    return html_shell(
        f"{issue.platform} | CTTD Trend Magazine",
        body,
        "article",
        render_header_category_nav(report, "article"),
        description=issue_display_description(issue),
        image=issue.image or SITE_OG_IMAGE,
        url=absolute_site_url(issue_href(report, issue)),
        page_type="article",
        og_title=f"{issue.platform} | {issue_display_title(issue)}",
        image_alt=issue.image_caption or issue.platform,
    )


def write_site(report: Report) -> None:
    ASSETS_DIR.mkdir(parents=True, exist_ok=True)

    if ARTICLES_DIR.exists():
        for old_article in ARTICLES_DIR.glob("*.html"):
            old_article.unlink()

    (SITE_DIR / "index.html").write_text(render_index(report), encoding="utf-8")


def latest_report() -> Path:
    reports = sorted(REPORTS_DIR.glob("*.md"))
    if not reports:
        raise FileNotFoundError("reports/ 안에 Markdown 리포트가 없습니다.")
    return reports[-1]


def main() -> None:
    args = parse_args()
    report_path = Path(args.report) if args.report else latest_report()
    if not report_path.is_absolute():
        report_path = ROOT / report_path
    write_site(parse_report(report_path))
    print(f"Built site from {report_path}")
    print(f"Open {SITE_DIR / 'index.html'}")


if __name__ == "__main__":
    main()
