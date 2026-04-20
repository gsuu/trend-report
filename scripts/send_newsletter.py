#!/usr/bin/env python3
from __future__ import annotations

import argparse
import html
import os
import re
import smtplib
import ssl
from email.message import EmailMessage
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PREVIEW_DIR = ROOT / "newsletters"
SITE_MARK_COLOR = "rgba(238, 255, 72, 0.34)"
SITE_MARK_FALLBACK_COLOR = "#f9ffc1"
SITE_MARK_BACKGROUND = f"background:{SITE_MARK_FALLBACK_COLOR};background:{SITE_MARK_COLOR}"
SITE_MARK_BORDER_LEFT = f"border-left:4px solid {SITE_MARK_FALLBACK_COLOR};border-left:4px solid {SITE_MARK_COLOR}"
TEST_RECIPIENT = "jisuk@cttd.co.kr"
FINAL_RECIPIENT = "cxd@cttd.co.kr"
PRODUCTION_MAGAZINE_BASE_URL = "https://email.cttd.co.kr/magazine"
EMAIL_LOGO_ASSET_NAME = "cttd-logo-email.png"
EMAIL_LOGO_CONTENT_ID = "cttd-logo-email@cttd"


SECTION_LABELS = {
    "서비스 변화 요약": "BRIEF",
    "핵심 업데이트": "UPDATE",
    "핵심 수치": "METRIC",
    "핵심 캠페인": "CAMPAIGN",
    "인사이트": "INSIGHT",
    "체크 포인트": "POINT",
    "팩트": "FACT",
    "수치·팩트": "FACT",
    "업데이트 상세": "DETAIL",
    "수치": "METRIC",
    "해석": "INSIGHT",
    "Product 포인트": "PRODUCT",
    "디자인 관찰 포인트": "DESIGN",
    "UI/UX 또는 서비스 변화": "UX CHANGE",
    "변경 전/후": "BEFORE / AFTER",
    "검증 필요": "CHECK",
    "캠페인 구조": "CAMPAIGN",
    "전략 포인트": "STRATEGY",
}

NEWSLETTER_SKIP_SECTIONS = {"매거진 상세", "사이트 매거진 상세", "웹사이트 상세", "매거진 인사이트"}
NEWSLETTER_HEADLINE_SECTIONS = {"서비스 변화 요약", "핵심 업데이트"}
NEWSLETTER_DESCRIPTION_LABELS = {"서비스 맥락", "변경 후"}
NEWSLETTER_DETAIL_SUMMARY_SECTIONS = {"매거진 인사이트", "인사이트"}
DEV_SECTION_HEADING_REPLACEMENTS = {
    "Frontend Development 관점": "프론트엔드 개발 전문가 관점",
    "개발자는 무엇을 덜 해도 될까": "실무에 어떻게 적용할 수 있을까",
    "클라이언트에게 던질 질문": "같이 보면 좋은 기술",
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
    "html",
    "css",
    "javascript",
    "web_accessibility",
    "ai",
    "tool",
    "data_api",
)
DEVELOP_SUBCATEGORY_CLASSIFICATION_ORDER = (
    "html",
    "ai",
    "web_accessibility",
    "css",
    "data_api",
    "tool",
    "javascript",
)
DEVELOP_SUBCATEGORY_LABELS = {
    "html": "HTML",
    "css": "CSS",
    "javascript": "JAVASCRIPT",
    "web_accessibility": "웹접근성",
    "ai": "AI",
    "tool": "TOOL",
    "data_api": "DATA/API",
}
DEVELOP_SUBCATEGORY_KEYWORDS = {
    "html": {
        "html",
        "dom",
        "markup",
        "semantic_html",
        "semantics",
        "document",
        "web_components",
        "custom_elements",
        "마크업",
        "시맨틱",
        "시맨틱_html",
        "웹컴포넌트",
    },
    "css": {
        "css",
        "cssgridlanes",
        "css_grid_lanes",
        "grid",
        "grid_lanes",
        "layout",
        "style",
        "styles",
        "responsive",
        "animation",
        "레이아웃",
        "반응형",
        "스타일",
        "애니메이션",
    },
    "javascript": {
        "javascript",
        "js",
        "typescript",
        "ts",
        "type_script",
        "es2025",
        "temporal",
        "node",
        "nodejs",
        "node_js",
        "eslint",
        "lint",
        "next",
        "nextjs",
        "next_js",
        "react",
        "vue",
        "svelte",
        "framework",
        "frontend",
        "frontend_development",
        "front_end",
        "fe",
        "web_development",
        "web_develop",
        "adapterapi",
        "adapter_api",
        "opennext",
        "runtime",
        "component",
        "components",
        "프론트",
        "프론트엔드",
        "웹개발",
        "컴포넌트",
    },
    "web_accessibility": {
        "accessibility",
        "a11y",
        "wcag",
        "screen_reader",
        "web_accessibility",
        "웹접근성",
        "접근성",
        "스크린리더",
    },
    "ai": {
        "ai",
        "ai_development",
        "code_assistant",
        "copilot",
        "llm",
        "ai_coding",
        "ai_assisted_development",
        "agent",
        "agent_devtools",
        "agent_dev_tools",
        "agentdevtools",
        "agents",
        "ai개발",
        "ai개발도구",
        "코딩어시스턴트",
    },
    "tool": {
        "tool",
        "tools",
        "tooling",
        "quality",
        "test",
        "testing",
        "qa",
        "ci",
        "cd",
        "build",
        "deploy",
        "release",
        "monitoring",
        "observability",
        "e2e",
        "eslint",
        "lint",
        "devtools",
        "dev_tools",
        "agentdevtools",
        "agent_devtools",
        "agent_dev_tools",
        "browserlogforwarding",
        "browser_log_forwarding",
        "테스트",
        "품질",
        "도구",
        "툴",
        "빌드",
        "배포",
        "모니터링",
    },
    "data_api": {
        "data",
        "api",
        "data_api",
        "graphql",
        "rest",
        "server",
        "backend",
        "database",
        "db",
        "auth",
        "webtransport",
        "web_transport",
        "node",
        "nodejs",
        "node_js",
        "runtime",
        "데이터",
        "서버",
        "백엔드",
        "인증",
    },
}
DEVELOP_DETECTION_EXCLUDED_KEYWORDS = {"ai", "llm"}
DEVELOP_DETECTION_KEYS = DEVELOP_CATEGORY_KEYS.union(
    {
        keyword
        for category_key, keywords in DEVELOP_SUBCATEGORY_KEYWORDS.items()
        for keyword in keywords
        if keyword not in DEVELOP_DETECTION_EXCLUDED_KEYWORDS
    }
)


def load_env_file(path: Path) -> None:
    if not path.exists():
        return

    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue

        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip("\"'")
        if key and key not in os.environ:
            os.environ[key] = value


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Markdown 리포트를 뉴스레터 HTML로 만들고 메일로 발송합니다.")
    parser.add_argument("report", help="발송할 Markdown 리포트 경로")
    parser.add_argument("--subject", help="메일 제목. 없으면 리포트 제목을 사용합니다.")
    parser.add_argument("--to", action="append", default=[], help="수신자 이메일. 쉼표 구분 또는 여러 번 입력 가능")
    parser.add_argument("--subscribers", help="수신자 목록 txt 파일")
    parser.add_argument("--magazine-base-url", help="매거진 공개 URL. 없으면 MAGAZINE_BASE_URL 환경변수 또는 로컬 미리보기 링크를 사용합니다.")
    parser.add_argument(
        "--audience",
        choices=("general", "dev", "develop", "all"),
        default="general",
        help="뉴스레터 대상. general은 dev 이슈 제외, dev는 dev 이슈만, all은 전체 이슈를 포함합니다. develop은 호환용 별칭입니다.",
    )
    parser.add_argument(
        "--stage",
        choices=("preview", "test", "final"),
        default="preview",
        help="발송 단계. preview는 미리보기만, test는 테스트 수신자, final은 최종 수신자로 발송합니다.",
    )
    parser.add_argument("--approved", action="store_true", help="테스트 메일 확인 후 최종 발송을 승인합니다. --stage final에서 필요합니다.")
    parser.add_argument("--send", action="store_true", help="실제 메일을 발송합니다. 없으면 HTML 미리보기만 생성합니다.")
    args = parser.parse_args()
    args.audience = normalize_audience(args.audience)
    return args


def normalize_audience(audience: str) -> str:
    if audience == "develop":
        return "dev"
    return audience


def resolve_magazine_base_url(value: str | None, stage: str) -> str:
    if value:
        return value.strip()
    if stage in {"test", "final"}:
        return os.getenv("MAGAZINE_BASE_URL", PRODUCTION_MAGAZINE_BASE_URL).strip()
    return os.getenv("MAGAZINE_BASE_URL", "").strip()


def read_subscribers(path: str | None) -> list[str]:
    if not path:
        return []

    subscribers_path = Path(path)
    emails: list[str] = []
    for line in subscribers_path.read_text(encoding="utf-8").splitlines():
        value = line.strip()
        if value and not value.startswith("#"):
            emails.append(value)
    return emails


def split_recipients(values: list[str]) -> list[str]:
    emails: list[str] = []
    for value in values:
        emails.extend(email.strip() for email in value.split(",") if email.strip())
    return emails


def extract_title(markdown: str, fallback: str) -> str:
    for line in markdown.splitlines():
        if line.startswith("# "):
            return line[2:].strip()
    return fallback


def report_slug(report_path: Path) -> str:
    return report_path.stem.replace("-uiux-web-service-weekly-trend-report", "")


def split_issue_heading(heading: str) -> tuple[str, str, list[str]]:
    match = re.match(r"(?P<number>\d+)\.\s*(?P<body>.+)", heading)
    number = match.group("number") if match else "0"
    body = match.group("body") if match else heading
    platform_match = re.match(r"\[(?P<platform>[^\]]+)\]\s*(?P<rest>.*)", body)

    if platform_match:
        platform = platform_match.group("platform")
        rest = platform_match.group("rest")
    else:
        platform = body
        rest = body

    tags = re.findall(r"#([^\s#]+)", rest)
    return number, platform, tags


def clean_newsletter_headline(text: str) -> str:
    headline = clean_newsletter_text(text)
    for label in ("업데이트", "핵심 업데이트", "서비스 맥락"):
        prefix = f"{label}:"
        if headline.startswith(prefix):
            headline = headline[len(prefix):].strip()
            break
    return headline.rstrip(".")


def clean_newsletter_text(text: str) -> str:
    content = re.sub(r"`([^`]+)`", r"\1", text.strip())
    return re.sub(r"\s+", " ", content).rstrip(".")


def clean_newsletter_summary_text(text: str) -> str:
    content = re.sub(r"`([^`]+)`", r"\1", text.strip())
    return re.sub(r"\s+", " ", content).strip()


def trim_newsletter_summary(parts: list[str], limit: int = 128) -> str:
    summary = " ".join(clean_newsletter_summary_text(part) for part in parts if part.strip())
    if len(summary) <= limit:
        return summary

    return summary[:limit].rsplit(" ", 1)[0].rstrip(" .") + "..."


def split_newsletter_label(text: str) -> tuple[str, str]:
    content = clean_newsletter_text(text)
    if ":" not in content:
        return "", content

    label, value = content.split(":", 1)
    return label.strip(), value.strip()


def normalize_develop_token(value: str) -> str:
    content = re.sub(r"`([^`]+)`", r"\1", value.strip().lower())
    content = content.replace("#", "")
    content = re.sub(r"[\s./\-]+", "_", content)
    content = re.sub(r"[^0-9a-z가-힣_]+", "_", content)
    return re.sub(r"_+", "_", content).strip("_")


def develop_tokens(categories: list[str], tags: list[str]) -> set[str]:
    tokens: set[str] = set()
    for value in categories + tags:
        for part in re.split(r"[,/|>·]+", value):
            token = normalize_develop_token(part)
            if not token:
                continue
            tokens.add(token)
            tokens.update(segment for segment in token.split("_") if segment)
    return tokens


def develop_subcategory_key(categories: list[str], tags: list[str]) -> str:
    tokens = develop_tokens(categories, tags)
    for category_key in DEVELOP_SUBCATEGORY_CLASSIFICATION_ORDER:
        if tokens.intersection(DEVELOP_SUBCATEGORY_KEYWORDS.get(category_key, set())):
            return category_key
    return "javascript"


def develop_subcategory_label(categories: list[str], tags: list[str]) -> str:
    category_key = develop_subcategory_key(categories, tags)
    return DEVELOP_SUBCATEGORY_LABELS.get(category_key, DEVELOP_SUBCATEGORY_LABELS["javascript"])


def validate_dev_article_headings(source: Path, markdown: str) -> None:
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

    for line_number, raw_line in enumerate(markdown.splitlines(), 1):
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

    close_tracked_sections(len(markdown.splitlines()) + 1)

    if errors:
        raise SystemExit(
            f"{source}: DEV 아티클 형식이 현재 템플릿과 다릅니다.\n"
            + "\n".join(errors)
        )


def parse_newsletter_items(markdown: str, audience: str = "general") -> list[dict[str, object]]:
    audience = normalize_audience(audience)
    items: list[dict[str, object]] = []
    current: dict[str, object] | None = None
    current_section = ""
    current_category = ""

    def append_current() -> None:
        nonlocal current
        if current is None:
            return

        audience_categories = [
            str(current.get("sectionCategory") or ""),
            str(current.get("category") or ""),
            str(current.get("platform") or ""),
        ]
        classification_categories = [
            *audience_categories,
            str(current.get("headline") or ""),
            str(current.get("description") or ""),
        ]
        tags = [str(tag) for tag in current.get("tags", [])]
        if not should_include_issue_for_audience(audience_categories, tags, audience):
            current = None
            return

        summary_parts = current.pop("detailSummaryParts", [])
        if isinstance(summary_parts, list):
            current["detailSummary"] = trim_newsletter_summary([str(part) for part in summary_parts])
        if audience == "dev":
            current["audienceCategory"] = develop_subcategory_label(classification_categories, tags)
        current.pop("sectionCategory", None)
        current.pop("category", None)
        items.append(current)
        current = None

    for raw_line in markdown.splitlines():
        line = raw_line.strip()

        if line.startswith("### ") and not line.startswith("#### "):
            current_category = line[4:].strip()
            continue

        if line.startswith("#### "):
            heading = line[5:].strip()
            if not re.match(r"\d+\.\s*", heading):
                continue

            append_current()

            number, platform, tags = split_issue_heading(heading)
            current = {
                "number": number,
                "platform": platform,
                "tags": tags,
                "sectionCategory": current_category,
                "category": "",
                "headline": "",
                "description": "",
                "detailSummaryParts": [],
            }
            current_section = ""
            continue

        if current is None:
            continue

        if not current_section and line.startswith("- "):
            label, value = split_newsletter_label(line[2:])
            if label.lower() in {"카테고리", "category"}:
                current["category"] = value
            continue

        if line.startswith("##### "):
            current_section = line[6:].strip()
            continue

        if current_section in NEWSLETTER_HEADLINE_SECTIONS and line.startswith("- "):
            label, value = split_newsletter_label(line[2:])
            if not current["headline"]:
                current["headline"] = clean_newsletter_headline(line[2:])
            if label in NEWSLETTER_DESCRIPTION_LABELS and not current["description"]:
                current["description"] = value
            continue

        if current_section in NEWSLETTER_DETAIL_SUMMARY_SECTIONS:
            summary_parts = current["detailSummaryParts"]
            if (
                isinstance(summary_parts, list)
                and len(summary_parts) < 2
                and line
                and not line.startswith(">")
                and not line.startswith("#")
                and not line.startswith("- ")
            ):
                summary_parts.append(line)

    append_current()

    return items


def should_include_issue_for_audience(categories: str | list[str], tags: list[str], audience: str) -> bool:
    audience = normalize_audience(audience)
    if isinstance(categories, str):
        categories = [categories]
    is_develop = any(is_develop_issue(category, tags) for category in categories)
    if audience == "dev":
        return is_develop
    if audience == "all":
        return True
    return not is_develop


def audience_label(audience: str) -> str:
    audience = normalize_audience(audience)
    return {
        "general": "일반",
        "dev": "Dev",
        "all": "전체",
    }.get(audience, audience)


def audience_description(audience: str) -> str:
    audience = normalize_audience(audience)
    if audience == "dev":
        return "Dev 이슈"
    if audience == "all":
        return "전체 대상 UIUX/Web Service 이슈"
    return "UIUX/Web Service 이슈"


def audience_kicker(audience: str) -> str:
    audience = normalize_audience(audience)
    if audience == "dev":
        return "Weekly Dev Intelligence"
    return "Weekly Design Intelligence"


def audience_title(default_title: str, audience: str) -> str:
    audience = normalize_audience(audience)
    if audience == "dev":
        date_match = re.match(r"^(\[[^\]]+\])", default_title)
        prefix = f"{date_match.group(1)} " if date_match else ""
        return f"{prefix}Dev Weekly Trend Report"
    if audience != "general":
        return f"{default_title} - {audience_label(audience)}"
    return default_title


def is_develop_issue(category: str, tags: list[str]) -> bool:
    tokens = develop_tokens([category], tags)
    return bool(tokens.intersection(DEVELOP_DETECTION_KEYS))


def magazine_href(report_path: Path, number: str, magazine_base_url: str | None) -> str:
    slug = report_slug(report_path)
    article_name = f"{slug}-story-{number.zfill(2)}.html"
    base_url = (magazine_base_url or os.getenv("MAGAZINE_BASE_URL", "")).strip()

    if base_url:
        return f"{base_url.rstrip('/')}/articles/{article_name}"

    return f"../site/articles/{article_name}"


def magazine_asset_href(asset_name: str, magazine_base_url: str | None) -> str:
    base_url = (magazine_base_url or os.getenv("MAGAZINE_BASE_URL", "")).strip()
    if base_url:
        return f"{base_url.rstrip('/')}/assets/{asset_name}"

    return f"../site/assets/{asset_name}"


def email_logo_path() -> Path:
    return ROOT / "site" / "assets" / EMAIL_LOGO_ASSET_NAME


def use_inline_email_logo(newsletter_html: str) -> str:
    return re.sub(
        rf'(<img\s+src=")(?:[^"]*/)?assets/{re.escape(EMAIL_LOGO_ASSET_NAME)}(" width="124" alt="CTTD")',
        rf"\1cid:{EMAIL_LOGO_CONTENT_ID}\2",
        newsletter_html,
        count=1,
    )


def attach_inline_email_logo(message: EmailMessage) -> None:
    logo_path = email_logo_path()
    if not logo_path.exists():
        raise SystemExit(f"이메일 로고 파일이 없습니다: {logo_path}")

    html_part = message.get_payload()[-1]
    html_part.add_related(
        logo_path.read_bytes(),
        maintype="image",
        subtype="png",
        cid=f"<{EMAIL_LOGO_CONTENT_ID}>",
        filename=EMAIL_LOGO_ASSET_NAME,
        disposition="inline",
    )


def inline_markdown_to_html(text: str) -> str:
    escaped = html.escape(text)
    linked = re.sub(
        r"\[([^\]]+)\]\(([^)]+)\)",
        lambda match: f'<a href="{html.escape(match.group(2), quote=True)}">{match.group(1)}</a>',
        escaped,
    )
    return re.sub(
        r"`([^`]+)`",
        lambda match: (
            f'<span class="highlight" style="color:#111111;{SITE_MARK_BACKGROUND};padding:0 3px;">'
            f"{match.group(1)}</span>"
        ),
        linked,
    )


def list_item_to_html(text: str) -> str:
    content = inline_markdown_to_html(text)
    if ":" not in content:
        return content

    label, value = content.split(":", 1)
    if len(label) > 18:
        return content

    return f'<span class="label">{label}:</span>{value}'


def meta_item_to_html(text: str) -> str:
    content = inline_markdown_to_html(text)
    if ":" not in content:
        return content

    label, value = content.split(":", 1)
    return (
        '<span class="meta-label">'
        f"{label}"
        '</span>'
        '<span class="meta-value">'
        f"{value.strip()}"
        '</span>'
    )


def attach_source_url(parts: list[str], url: str) -> None:
    escaped_url = html.escape(url.strip(), quote=True)
    for index in range(len(parts) - 1, -1, -1):
        part = parts[index]
        if "출처" not in part:
            continue

        source_text_match = re.search(r"(<tr><td[^>]*>출처</td><td class=\"meta-value\"[^>]*>)(.*?)(</td></tr>)", part)
        if not source_text_match:
            source_text_match = re.search(r"(<li><span class=\"meta-label\">출처</span><span class=\"meta-value\">)(.*?)(</span></li>)", part)
        if not source_text_match:
            source_text_match = re.search(r"(<li><span class=\"label\">출처:</span>\s*)(.*?)(</li>)", part)
        if source_text_match:
            prefix, source_text, suffix = source_text_match.groups()
            parts[index] = f'{prefix}<a href="{escaped_url}">{source_text}</a>{suffix}'
        return


def image_to_html(url: str, caption: str) -> str:
    escaped_url = html.escape(url.strip(), quote=True)
    escaped_caption = html.escape(caption.strip() or "서비스 업데이트 이미지")
    return (
        '<table class="item-image" role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" '
        'style="max-width:360px;margin:4px auto 16px;">'
        '<tr><td align="center" style="padding:0;">'
        f'<img src="{escaped_url}" alt="{escaped_caption}" style="display:block;width:auto;max-width:100%;height:auto;margin:0 auto;border:0;">'
        '</td></tr>'
        f'<tr><td align="center" style="padding:8px 0 0;color:#777777;font-size:11px;line-height:1.5;text-align:center;font-family:Arial,Apple SD Gothic Neo,Malgun Gothic,sans-serif;">{escaped_caption}</td></tr>'
        '</table>'
    )


def markdown_to_html(markdown: str) -> str:
    lines = markdown.splitlines()
    parts: list[str] = []
    in_list = False
    current_list_class = "content-list"
    list_role = "summary"
    open_article = False
    pending_image_url = ""
    pending_image_caption = ""
    summary_brief_open = False
    summary_brief_sections = {"서비스 변화 요약", "핵심 업데이트", "핵심 캠페인", "변경 전/후"}
    fact_note_sections = {"수치·팩트", "팩트", "핵심 수치"}
    skip_section = False

    def close_article() -> None:
        nonlocal open_article, pending_image_url, pending_image_caption
        flush_image()
        close_summary_brief()
        if open_article:
            parts.append("</td></tr></table>")
            open_article = False
        pending_image_url = ""
        pending_image_caption = ""

    def open_list() -> None:
        nonlocal in_list, current_list_class
        if not in_list:
            if list_role == "meta":
                current_list_class = "meta-list"
            elif list_role == "fact":
                current_list_class = "fact-note"
            else:
                current_list_class = "content-list"
            if current_list_class == "meta-list":
                parts.append(
                    '<table class="meta-list" role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" '
                    'style="margin:0 0 14px;background:transparent;">'
                )
            elif current_list_class == "fact-note":
                parts.append(
                    '<table class="fact-note" role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" '
                    'style="margin:-6px 0 14px;">'
                )
            else:
                parts.append(
                    '<table class="content-list" role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" '
                    'style="margin:0 0 14px;">'
                )
            in_list = True

    def close_list() -> None:
        nonlocal in_list, current_list_class
        if in_list:
            parts.append("</table>")
            in_list = False
            current_list_class = "content-list"

    def is_item_heading(text: str) -> bool:
        return bool(re.match(r"^\d+\.|\[", text))

    def append_section_heading(section_title: str) -> None:
        flush_image()
        close_summary_brief()
        section_label = SECTION_LABELS.get(section_title, "NOTE")
        parts.append(
            '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:18px 0 8px;">'
            '<tr><td style="padding:0;color:#111111;font-size:12px;line-height:1.4;font-weight:700;letter-spacing:0.04em;font-family:Arial,Apple SD Gothic Neo,Malgun Gothic,sans-serif;">'
            f'<span class="section-kicker" style="display:inline-block;margin-right:8px;padding:3px 6px;background:#111111;color:#ffffff;font-size:10px;line-height:1;font-weight:700;letter-spacing:0.08em;">{section_label}</span>'
            f'<span class="section-title" style="color:#111111;font-size:12px;font-weight:700;letter-spacing:0.04em;">{inline_markdown_to_html(section_title)}</span>'
            '</td></tr></table>'
        )

    def flush_image() -> None:
        nonlocal pending_image_url, pending_image_caption
        if pending_image_url:
            close_list()
            parts.append(image_to_html(pending_image_url, pending_image_caption))
            pending_image_url = ""
            pending_image_caption = ""

    def should_group_summary_section(section_title: str) -> bool:
        return section_title in summary_brief_sections

    def open_summary_brief() -> None:
        nonlocal summary_brief_open, list_role
        if not summary_brief_open:
            parts.append(
                '<table class="summary-brief" role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" '
                f'style="margin:12px 0 16px;background:#ffffff;{SITE_MARK_BORDER_LEFT};">'
                '<tr><td style="padding:12px 14px;">'
            )
            summary_brief_open = True
        list_role = "content"

    def close_summary_brief() -> None:
        nonlocal summary_brief_open
        if summary_brief_open:
            close_list()
            parts.append("</td></tr></table>")
            summary_brief_open = False

    for raw_line in lines:
        line = raw_line.strip()

        if skip_section and not line.startswith("#"):
            continue

        if not line:
            close_list()
            continue

        if line == "---":
            close_list()
            close_article()
            continue

        if line.startswith("##### "):
            skip_section = False
            close_list()
            flush_image()
            list_role = "content"
            section_title = line[6:]
            if section_title in NEWSLETTER_SKIP_SECTIONS:
                close_summary_brief()
                skip_section = True
                continue
            if should_group_summary_section(section_title):
                open_summary_brief()
                continue
            if section_title in fact_note_sections:
                close_summary_brief()
                list_role = "fact"
                continue
            append_section_heading(section_title)
            continue

        if line.startswith("#### "):
            skip_section = False
            close_list()
            flush_image()
            title = line[5:]
            if title in NEWSLETTER_SKIP_SECTIONS:
                close_summary_brief()
                skip_section = True
                continue
            if should_group_summary_section(title):
                open_summary_brief()
                continue
            if title in fact_note_sections:
                close_summary_brief()
                list_role = "fact"
                continue
            if is_item_heading(title):
                close_article()
                parts.append(
                    '<table class="item-box" role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" '
                    'style="margin:0 0 14px;background:#f7f7f7;">'
                    '<tr><td style="padding:20px 22px 18px;">'
                )
                open_article = True
                list_role = "meta"
                parts.append(
                    '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 14px;">'
                    f'<tr><td style="padding:0;color:#111111;font-size:18px;line-height:1.42;font-weight:700;font-family:Arial,Apple SD Gothic Neo,Malgun Gothic,sans-serif;">{inline_markdown_to_html(title)}</td></tr>'
                    '</table>'
                )
                continue

            list_role = "content"
            append_section_heading(title)
            continue

        if line.startswith("### "):
            skip_section = False
            close_list()
            flush_image()
            close_summary_brief()
            title = line[4:]
            if is_item_heading(title):
                close_article()
                parts.append(
                    '<table class="item-box" role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" '
                    'style="margin:0 0 14px;background:#f7f7f7;">'
                    '<tr><td style="padding:20px 22px 18px;">'
                )
                open_article = True
                list_role = "meta"
                parts.append(
                    '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 14px;">'
                    f'<tr><td style="padding:0;color:#111111;font-size:18px;line-height:1.42;font-weight:700;font-family:Arial,Apple SD Gothic Neo,Malgun Gothic,sans-serif;">{inline_markdown_to_html(title)}</td></tr>'
                    '</table>'
                )
                continue

            close_article()
            list_role = "summary"
            continue

        if line.startswith("## "):
            skip_section = False
            close_list()
            flush_image()
            close_summary_brief()
            close_article()
            list_role = "summary"
            parts.append(
                '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:48px 0 18px;background:#111111;">'
                f'<tr><td style="padding:13px 16px;color:#ffffff;font-size:18px;line-height:1.35;font-weight:800;font-family:Arial,Apple SD Gothic Neo,Malgun Gothic,sans-serif;">{inline_markdown_to_html(line[3:])}</td></tr>'
                '</table>'
            )
            continue

        if line.startswith("# "):
            skip_section = False
            close_list()
            flush_image()
            close_summary_brief()
            close_article()
            list_role = "summary"
            parts.append(
                '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 28px;">'
                f'<tr><td style="padding:0;color:#111111;font-size:36px;line-height:1.08;font-weight:800;font-family:Arial,Apple SD Gothic Neo,Malgun Gothic,sans-serif;">{inline_markdown_to_html(line[2:])}</td></tr>'
                '</table>'
            )
            continue

        if line.startswith("- "):
            item_text = line[2:]
            if item_text.startswith("출처 URL:"):
                attach_source_url(parts, item_text.split(":", 1)[1])
                continue
            if item_text.startswith("이미지 설명:"):
                pending_image_caption = item_text.split(":", 1)[1].strip()
                continue
            if item_text.startswith("이미지:"):
                pending_image_url = item_text.split(":", 1)[1].strip()
                continue

            open_list()
            item_html = meta_item_to_html(item_text) if current_list_class == "meta-list" else list_item_to_html(item_text)
            if current_list_class == "meta-list":
                label_match = re.search(r'<span class="meta-label">(.*?)</span><span class="meta-value">(.*?)</span>', item_html)
                if label_match:
                    label, value = label_match.groups()
                    parts.append(
                        '<tr>'
                        f'<td style="padding:5px 8px 5px 0;color:#777777;font-size:10px;line-height:1.2;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;font-family:Arial,Apple SD Gothic Neo,Malgun Gothic,sans-serif;white-space:nowrap;">{label}</td>'
                        f'<td class="meta-value" style="padding:5px 12px 5px 0;color:#111111;font-size:12px;line-height:1.2;font-weight:700;font-family:Arial,Apple SD Gothic Neo,Malgun Gothic,sans-serif;">{value}</td>'
                        '</tr>'
                    )
                else:
                    parts.append(f'<tr><td colspan="2" style="padding:5px 0;color:#111111;font-size:12px;line-height:1.2;font-family:Arial,Apple SD Gothic Neo,Malgun Gothic,sans-serif;">{item_html}</td></tr>')
            elif current_list_class == "fact-note":
                parts.append(f'<tr><td style="padding:0 0 3px;color:#777777;font-size:12px;line-height:1.5;font-family:Arial,Apple SD Gothic Neo,Malgun Gothic,sans-serif;">{item_html}</td></tr>')
            else:
                parts.append(
                    '<tr>'
                    '<td width="18" style="width:18px;padding:9px 0 0;vertical-align:top;"><span style="display:block;width:5px;height:5px;background:#111111;"></span></td>'
                    f'<td style="padding:3px 0;color:#222222;font-size:14px;line-height:1.62;font-family:Arial,Apple SD Gothic Neo,Malgun Gothic,sans-serif;">{item_html}</td>'
                    '</tr>'
                )
            continue

        close_list()
        flush_image()
        close_summary_brief()
        parts.append(
            '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 10px;">'
            f'<tr><td style="padding:0;color:#222222;font-size:14px;line-height:1.66;font-family:Arial,Apple SD Gothic Neo,Malgun Gothic,sans-serif;">{inline_markdown_to_html(line)}</td></tr>'
            '</table>'
        )

    close_list()
    close_article()
    return "\n".join(parts)


def render_newsletter_item(
    report_path: Path,
    item: dict[str, object],
    magazine_base_url: str | None,
    display_number: int,
) -> str:
    number = str(item["number"])
    platform = str(item["platform"])
    headline = str(item.get("headline") or "").strip()
    description = str(item.get("description") or "").strip()
    detail_summary = str(item.get("detailSummary") or "").strip()
    title = f"[{platform}] {headline}" if headline else f"[{platform}]"
    href = html.escape(magazine_href(report_path, number, magazine_base_url), quote=True)
    tags = "".join(
        f'<span style="display:inline-block;margin:0 5px 5px 0;padding:4px 7px;{SITE_MARK_BACKGROUND};color:#111111;font-size:11px;line-height:1.2;font-family:Arial,Apple SD Gothic Neo,Malgun Gothic,sans-serif;">'
        f"#{html.escape(str(tag))}"
        "</span>"
        for tag in item["tags"]  # type: ignore[index]
    )
    description_html = ""
    if description:
        description_html = (
            '<div style="margin:6px 0 0;color:#555555;font-size:13px;line-height:1.55;'
            'font-family:Arial,Apple SD Gothic Neo,Malgun Gothic,sans-serif;">'
            f"{inline_markdown_to_html(description)}</div>"
        )
    detail_summary_html = ""
    if detail_summary:
        detail_summary_html = (
            '<div style="margin:10px 0 0;padding:10px 0 0;border-top:1px solid #eeeeee;'
            'color:#333333;font-size:13px;line-height:1.58;'
            'font-family:Arial,Apple SD Gothic Neo,Malgun Gothic,sans-serif;">'
            f"{inline_markdown_to_html(detail_summary)} "
            f'<a href="{href}" style="color:#111111;text-decoration:underline;text-underline-offset:3px;">더보기</a>'
            '</div>'
        )

    return (
        '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" '
        'style="margin:0;border-bottom:1px solid #eeeeee;">'
        '<tr>'
        f'<td width="42" style="width:42px;padding:16px 14px 16px 0;color:#777777;font-size:12px;line-height:1.2;font-weight:800;font-family:Arial,Apple SD Gothic Neo,Malgun Gothic,sans-serif;vertical-align:top;">{display_number:02d}</td>'
        '<td style="padding:14px 0 16px;vertical-align:top;">'
        f'<a href="{href}" style="display:block;color:#111111;font-size:17px;line-height:1.42;font-weight:700;text-decoration:none;font-family:Arial,Apple SD Gothic Neo,Malgun Gothic,sans-serif;">{html.escape(title)}</a>'
        f"{description_html}"
        f"{detail_summary_html}"
        f'<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:8px 0 0;"><tr><td>{tags}</td></tr></table>'
        '</td>'
        '</tr>'
        '</table>'
    )


def render_newsletter_category_heading(label: str) -> str:
    return (
        '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" '
        'style="margin:24px 0 6px;">'
        '<tr>'
        f'<td width="15" style="width:15px;padding:0 8px 0 0;vertical-align:middle;"><span style="display:inline-block;width:7px;height:7px;{SITE_MARK_BACKGROUND};"></span></td>'
        f'<td style="padding:0;color:#111111;font-size:14px;line-height:1.35;font-weight:800;letter-spacing:0.02em;font-family:Arial,Apple SD Gothic Neo,Malgun Gothic,sans-serif;">{html.escape(label)}</td>'
        '</tr></table>'
    )


def group_develop_newsletter_items(items: list[dict[str, object]]) -> list[tuple[str, list[dict[str, object]]]]:
    grouped: dict[str, list[dict[str, object]]] = {}
    for item in items:
        label = str(item.get("audienceCategory") or DEVELOP_SUBCATEGORY_LABELS["javascript"])
        grouped.setdefault(label, []).append(item)

    ordered_labels = [DEVELOP_SUBCATEGORY_LABELS[key] for key in DEVELOP_SUBCATEGORY_ORDER]
    return [(label, grouped[label]) for label in ordered_labels if label in grouped]


def render_develop_newsletter_body(
    report_path: Path,
    items: list[dict[str, object]],
    magazine_base_url: str | None,
) -> str:
    parts: list[str] = []
    display_number = 1
    for _, category_items in group_develop_newsletter_items(items):
        for item in category_items:
            parts.append(render_newsletter_item(report_path, item, magazine_base_url, display_number))
            display_number += 1

    return "\n".join(parts)


def render_newsletter(
    title: str,
    markdown: str,
    report_path: Path,
    magazine_base_url: str | None = None,
    audience: str = "general",
    items: list[dict[str, object]] | None = None,
) -> str:
    audience = normalize_audience(audience)
    if items is None:
        items = parse_newsletter_items(markdown, audience)
    if audience == "dev":
        body = render_develop_newsletter_body(report_path, items, magazine_base_url)
    else:
        body = "\n".join(
            render_newsletter_item(report_path, item, magazine_base_url, index)
            for index, item in enumerate(items, start=1)
        )
    if not body:
        body = (
            '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" '
            'style="margin:0;border-top:1px solid #eeeeee;border-bottom:1px solid #eeeeee;">'
            '<tr><td style="padding:24px 0;color:#555555;font-size:14px;line-height:1.6;'
            'font-family:Arial,Apple SD Gothic Neo,Malgun Gothic,sans-serif;">'
            f"{html.escape(audience_label(audience))} 대상에 포함되는 이슈가 없습니다."
            '</td></tr></table>'
        )
    logo_src = html.escape(magazine_asset_href(EMAIL_LOGO_ASSET_NAME, magazine_base_url), quote=True)
    kicker = html.escape(audience_kicker(audience))
    return f"""<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{html.escape(title)}</title>
  <style>
    body {{
      margin: 0;
      background: #ffffff;
      color: #111111;
      font-family: Arial, 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif;
    }}
    main {{
      max-width: 760px;
      margin: 0 auto;
      padding: 44px 24px 52px;
    }}
    .issue-label {{
      margin: 0 0 18px;
      color: #111111;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }}
    .newsletter-frame {{
      border-top: 4px solid #111111;
      padding: 36px 0 24px;
    }}
    h1 {{
      margin: 0 0 28px;
      color: #111111;
      font-size: 36px;
      line-height: 1.08;
      font-weight: 800;
      letter-spacing: 0;
    }}
    h2 {{
      margin: 48px 0 18px;
      padding: 13px 16px;
      background: #111111;
      font-size: 18px;
      line-height: 1.35;
      font-weight: 800;
      letter-spacing: 0;
      color: #ffffff;
    }}
    h3 {{
      margin: 0 0 14px;
      padding: 0;
      color: #111111;
      font-size: 18px;
      line-height: 1.42;
      font-weight: 700;
      letter-spacing: 0;
    }}
    h4 {{
      margin: 18px 0 8px;
      color: #111111;
      font-size: 12px;
      line-height: 1.4;
      font-weight: 700;
      letter-spacing: 0.04em;
    }}
    .section-kicker {{
      display: inline-block;
      margin-right: 8px;
      padding: 3px 6px;
      background: #111111;
      color: #ffffff;
      font-size: 10px;
      line-height: 1;
      font-weight: 700;
      letter-spacing: 0.08em;
      vertical-align: 1px;
    }}
    .section-title {{
      color: #111111;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.04em;
    }}
    p {{
      margin: 0 0 10px;
      color: #222222;
      font-size: 14px;
      line-height: 1.66;
    }}
    ul {{
      margin: 0 0 14px;
      padding: 0;
      list-style: none;
    }}
    li {{
      margin: 0;
      color: #222222;
      font-size: 14px;
      line-height: 1.62;
    }}
    .meta-list {{
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 14px;
      padding: 0;
      background: transparent;
    }}
    .meta-list li {{
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 5px 8px;
      background: #ffffff;
      color: #111111;
      font-size: 12px;
      line-height: 1.2;
    }}
    .content-list li {{
      position: relative;
      padding: 3px 0 3px 18px;
    }}
    .content-list li:before {{
      content: "";
      position: absolute;
      left: 0;
      top: 13px;
      width: 5px;
      height: 5px;
      background: #111111;
    }}
    .fact-note {{
      margin: -6px 0 14px;
      padding: 0;
    }}
    .fact-note li {{
      margin: 0 0 3px;
      padding: 0;
      color: #777777;
      font-size: 12px;
      line-height: 1.5;
    }}
    .fact-note .label {{
      color: #777777;
      font-weight: 400;
    }}
    .label {{
      display: inline;
      color: #555555;
      font-weight: 400;
    }}
    .meta-list .label {{
      display: inline-block;
      min-width: 72px;
    }}
    .meta-label {{
      color: #777777;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }}
    .meta-value {{
      color: #111111;
      font-size: 12px;
      font-weight: 700;
    }}
    .item-box {{
      margin: 0 0 14px;
      padding: 20px 22px 18px;
      background: #f7f7f7;
    }}
    .item-image {{
      max-width: 360px;
      margin: 4px auto 16px;
      padding: 0;
    }}
    .item-image img {{
      display: block;
      width: auto;
      max-width: 100%;
      height: auto;
      margin: 0 auto;
    }}
    .item-image figcaption {{
      margin: 8px 0 0;
      color: #777777;
      font-size: 11px;
      line-height: 1.5;
      text-align: center;
    }}
    .summary-brief {{
      margin: 12px 0 16px;
      padding: 12px 14px;
      background: #ffffff;
      box-shadow: inset 4px 0 0 {SITE_MARK_FALLBACK_COLOR};
      box-shadow: inset 4px 0 0 {SITE_MARK_COLOR};
    }}
    .summary-brief .content-list {{
      margin-bottom: 5px;
    }}
    .summary-brief .content-list:last-child {{
      margin-bottom: 0;
    }}
    .item-box h4:first-of-type {{
      margin-top: 14px;
    }}
    a {{
      color: #111111;
      text-decoration: underline;
      text-underline-offset: 3px;
    }}
    .highlight {{
      color: #111111;
      font-family: Arial, 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif;
      font-weight: inherit;
      {SITE_MARK_BACKGROUND};
      padding: 0 3px;
    }}
    hr {{
      margin: 34px 0;
      border: 0;
      border-top: 1px solid #111111;
    }}
    .footer {{
      margin: 18px 0 0;
      color: #777777;
      font-size: 12px;
      line-height: 1.6;
    }}
    @media screen and (max-width: 520px) {{
      main {{
        padding: 28px 18px 40px;
      }}
      h1 {{
        font-size: 28px;
      }}
    }}
  </style>
</head>
<body>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="display:none;max-height:0;overflow:hidden;">
    <tr><td>UIUX/Web Service 주간 트렌드 리포트</td></tr>
  </table>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#ffffff;">
    <tr>
      <td align="center" style="padding:44px 24px 52px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:760px;margin:0 auto;">
          <tr>
            <td style="padding:0 0 14px;">
              <img src="{logo_src}" width="124" alt="CTTD" style="display:block;width:124px;max-width:124px;height:auto;border:0;outline:none;text-decoration:none;">
            </td>
          </tr>
          <tr>
            <td style="padding:0 0 18px;color:#111111;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;font-family:Arial,Apple SD Gothic Neo,Malgun Gothic,sans-serif;">
              {kicker}
            </td>
          </tr>
          <tr>
            <td style="padding:36px 0 24px;border-top:4px solid #111111;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 24px;">
                <tr>
                  <td style="padding:0 0 8px;color:#111111;font-size:34px;line-height:1.1;font-weight:800;font-family:Arial,Apple SD Gothic Neo,Malgun Gothic,sans-serif;">
                    {html.escape(title)}
                  </td>
                </tr>
                <tr>
                  <td style="padding:0;color:#666666;font-size:13px;line-height:1.6;font-family:Arial,Apple SD Gothic Neo,Malgun Gothic,sans-serif;">
                    이번 주 매거진에 업데이트된 {html.escape(audience_description(audience))}입니다. 상세 내용은 각 매거진 링크에서 확인하세요.
                  </td>
                </tr>
              </table>
              {body}
            </td>
          </tr>
          <tr>
            <td style="padding:18px 0 0;color:#777777;font-size:12px;line-height:1.6;font-family:Arial,Apple SD Gothic Neo,Malgun Gothic,sans-serif;">
              이 메일은 CTTD Newsletter 팀에서 발송되었습니다.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""


def markdown_to_plain_text(markdown: str) -> str:
    text = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", r"\1 (\2)", markdown)
    text = re.sub(r"^#{1,6}\s*", "", text, flags=re.MULTILINE)
    return text


def newsletter_plain_text(
    title: str,
    markdown: str,
    report_path: Path,
    magazine_base_url: str | None,
    audience: str = "general",
    items: list[dict[str, object]] | None = None,
) -> str:
    audience = normalize_audience(audience)
    lines = [title, ""]
    if items is None:
        items = parse_newsletter_items(markdown, audience)
    if not items:
        lines.append(f"{audience_label(audience)} 대상에 포함되는 이슈가 없습니다.")
        return "\n".join(lines)

    def append_item(item: dict[str, object], display_number: int) -> None:
        platform = str(item["platform"])
        headline = str(item.get("headline") or "").strip()
        description = str(item.get("description") or "").strip()
        item_title = f"[{platform}] {headline}" if headline else f"[{platform}]"
        tags = " ".join(f"#{tag}" for tag in item["tags"])  # type: ignore[index]
        href = magazine_href(report_path, str(item["number"]), magazine_base_url)
        lines.append(f"{display_number:02d}. {item_title}")
        if description:
            lines.append(description)
        detail_summary = str(item.get("detailSummary") or "").strip()
        if detail_summary:
            lines.append(f"{detail_summary} 더보기: {href}")
        if tags:
            lines.append(tags)
        lines.append(href)
        lines.append("")

    if audience == "dev":
        display_number = 1
        for _, category_items in group_develop_newsletter_items(items):
            for item in category_items:
                append_item(item, display_number)
                display_number += 1
    else:
        for display_number, item in enumerate(items, start=1):
            append_item(item, display_number)

    return "\n".join(lines)


def save_preview(report_path: Path, newsletter_html: str, audience: str = "general") -> Path:
    audience = normalize_audience(audience)
    PREVIEW_DIR.mkdir(exist_ok=True)
    suffix = "" if audience == "general" else f"-{audience}"
    output_path = PREVIEW_DIR / f"{report_path.stem}{suffix}.html"
    output_path.write_text(newsletter_html, encoding="utf-8")
    if audience == "dev":
        legacy_output_path = PREVIEW_DIR / f"{report_path.stem}-develop.html"
        legacy_output_path.write_text(newsletter_html, encoding="utf-8")
    return output_path


def resolve_recipients(args: argparse.Namespace) -> list[str]:
    if args.stage == "test":
        return [TEST_RECIPIENT]
    if args.stage == "final":
        return [FINAL_RECIPIENT]

    recipients = split_recipients(args.to) + read_subscribers(args.subscribers)
    return sorted(set(recipients))


def enforce_send_stage(args: argparse.Namespace, recipients: list[str], magazine_base_url: str) -> None:
    if not args.send:
        return

    if args.stage == "preview":
        if FINAL_RECIPIENT in recipients:
            raise SystemExit(
                f"{FINAL_RECIPIENT} 최종 발송은 --stage final --approved 조합에서만 가능합니다. "
                "먼저 --stage test로 테스트 메일을 보내고 확인을 받으세요."
            )
        return

    if magazine_base_url.rstrip("/") != PRODUCTION_MAGAZINE_BASE_URL:
        raise SystemExit(f"{args.stage} 발송에는 MAGAZINE_BASE_URL={PRODUCTION_MAGAZINE_BASE_URL} 이 필요합니다.")

    if args.stage == "test" and recipients != [TEST_RECIPIENT]:
        raise SystemExit(f"테스트 발송 수신자는 {TEST_RECIPIENT}만 허용됩니다.")

    if args.stage == "final":
        if not args.approved:
            raise SystemExit("최종 발송에는 테스트 메일 확인 후 --approved를 명시해야 합니다.")
        if recipients != [FINAL_RECIPIENT]:
            raise SystemExit(f"최종 발송 수신자는 {FINAL_RECIPIENT}만 허용됩니다.")


def smtp_config() -> dict[str, str | int | bool]:
    required = ["SMTP_HOST", "SMTP_FROM"]
    missing = [key for key in required if not os.getenv(key)]
    if missing:
        raise SystemExit(f"필수 SMTP 환경변수가 없습니다: {', '.join(missing)}")

    port = int(os.getenv("SMTP_PORT", "587"))
    use_ssl = os.getenv("SMTP_SSL", "").lower() == "true" or port == 465

    return {
        "host": os.environ["SMTP_HOST"],
        "port": port,
        "user": os.getenv("SMTP_USER", ""),
        "password": os.getenv("SMTP_PASSWORD", ""),
        "sender": os.environ["SMTP_FROM"],
        "use_tls": os.getenv("SMTP_TLS", "true").lower() != "false" and not use_ssl,
        "use_ssl": use_ssl,
    }


def send_email(subject: str, sender: str, recipients: list[str], plain_text: str, newsletter_html: str) -> None:
    config = smtp_config()

    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = sender
    message["To"] = ", ".join(recipients)
    message.set_content(plain_text)
    message.add_alternative(use_inline_email_logo(newsletter_html), subtype="html")
    attach_inline_email_logo(message)

    if config["use_ssl"]:
        with smtplib.SMTP_SSL(str(config["host"]), int(config["port"]), context=ssl.create_default_context()) as smtp:
            if config["user"]:
                smtp.login(str(config["user"]), str(config["password"]))
            smtp.send_message(message)
        return

    if config["use_tls"]:
        with smtplib.SMTP(str(config["host"]), int(config["port"])) as smtp:
            smtp.starttls(context=ssl.create_default_context())
            if config["user"]:
                smtp.login(str(config["user"]), str(config["password"]))
            smtp.send_message(message)
        return

    with smtplib.SMTP(str(config["host"]), int(config["port"])) as smtp:
        if config["user"]:
            smtp.login(str(config["user"]), str(config["password"]))
        smtp.send_message(message)


def main() -> None:
    load_env_file(ROOT / ".env")

    args = parse_args()
    report_path = Path(args.report)
    markdown = report_path.read_text(encoding="utf-8")
    validate_dev_article_headings(report_path, markdown)
    title = args.subject or audience_title(extract_title(markdown, report_path.stem), args.audience)
    subject = args.subject or title
    magazine_base_url = resolve_magazine_base_url(args.magazine_base_url, args.stage)

    if args.send and not magazine_base_url:
        raise SystemExit(
            "뉴스레터 발송에는 매거진 사이트 공개 URL이 필요합니다. "
            "--magazine-base-url 또는 MAGAZINE_BASE_URL을 설정하세요."
        )

    newsletter_items = parse_newsletter_items(markdown, args.audience)
    if args.send and not newsletter_items:
        raise SystemExit(f"{audience_label(args.audience)} 대상에 포함되는 이슈가 없어 발송을 중단합니다.")

    newsletter_html = render_newsletter(
        title,
        markdown,
        report_path,
        magazine_base_url or None,
        args.audience,
        newsletter_items,
    )
    preview_path = save_preview(report_path, newsletter_html, args.audience)

    recipients = resolve_recipients(args)
    enforce_send_stage(args, recipients, magazine_base_url)

    if not args.send:
        print(f"미리보기 생성: {preview_path}")
        if args.stage in {"test", "final"}:
            print(f"{args.stage} 단계 수신자: {', '.join(recipients)}")
        return

    if not recipients:
        raise SystemExit("수신자가 없습니다. --to 또는 --subscribers를 입력하세요.")

    sender = os.getenv("SMTP_FROM", "")
    plain_text = newsletter_plain_text(title, markdown, report_path, magazine_base_url or None, args.audience, newsletter_items)
    send_email(subject, sender, recipients, plain_text, newsletter_html)
    print(f"발송 완료: {len(recipients)}명")


if __name__ == "__main__":
    main()
