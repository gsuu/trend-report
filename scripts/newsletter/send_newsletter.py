#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import hmac
import html
import json
import os
import re
import smtplib
import ssl
import subprocess
import urllib.parse
import urllib.request
from copy import copy
from email.message import EmailMessage
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
PREVIEW_DIR = ROOT / "newsletters"
SITE_MARK_COLOR = "rgba(238, 255, 72, 0.34)"
SITE_MARK_FALLBACK_COLOR = "#f9ffc1"
SITE_MARK_BACKGROUND = f"background:{SITE_MARK_FALLBACK_COLOR};background:{SITE_MARK_COLOR}"
SITE_MARK_BORDER_LEFT = f"border-left:4px solid {SITE_MARK_FALLBACK_COLOR};border-left:4px solid {SITE_MARK_COLOR}"
TEST_RECIPIENT = "jisuk@cttd.co.kr"
PRODUCTION_SITE_URL = "https://magazine.cttd.co.kr"
EMAIL_LOGO_ASSET_NAME = "cttd-logo-email.png"
EMAIL_LOGO_CONTENT_ID = "cttd-logo-email@cttd"
NEWSLETTER_TEMPLATE_PATH = ROOT / "templates" / "newsletter.html"
REPORT_DATA_PATH = ROOT / "src" / "data" / "report.json"
SUBSCRIBER_EMAIL_PROPERTIES = ("Email", "이메일", "이름", "Name")
SUBSCRIBER_STATUS_PROPERTIES = ("Status", "상태")
SUBSCRIBER_AUDIENCE_PROPERTIES = ("Audience", "구독분야", "뉴스레터")
SUBSCRIPTION_AUDIENCES = ("service", "design", "dev")
SUBSCRIPTION_AUDIENCE_LABELS = {
    "service": "Service",
    "design": "Design",
    "dev": "DEV",
}
WEB_TREND_TITLE = "Weekly Web Trends"
NEWSLETTER_SECTION_PATTERN = re.compile(
    r"<!-- section:(?P<name>[a-z0-9_-]+) -->\s*(?P<body>.*?)\s*<!-- /section:(?P=name) -->",
    re.DOTALL,
)


SECTION_LABELS = {
    "서비스 변화 요약": "BRIEF",
    "기술 변화 요약": "TECH BRIEF",
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
NEWSLETTER_HEADLINE_SECTIONS = {"서비스 변화 요약", "기술 변화 요약", "핵심 업데이트"}
NEWSLETTER_DESCRIPTION_LABELS = {"서비스 맥락", "기술 맥락", "변경 후"}
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
    "ai",
    "html",
    "css",
    "javascript",
    "web_accessibility",
    "tool",
    "data_api",
)
DEVELOP_SUBCATEGORY_CLASSIFICATION_ORDER = (
    "ai",
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
        "custom_element",
        "custom_elements",
        "template",
        "popover",
        "dialog",
        "details",
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
        "container_query",
        "container_queries",
        "anchor_positioning",
        "view_transition",
        "scroll_driven_animation",
        "baseline",
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
        "es2026",
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
        "astro",
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
        "design_system",
        "storybook",
        "프론트",
        "프론트엔드",
        "웹개발",
        "컴포넌트",
        "디자인시스템",
    },
    "web_accessibility": {
        "accessibility",
        "a11y",
        "wcag",
        "aria",
        "screen_reader",
        "screenreader",
        "web_accessibility",
        "inert",
        "focus",
        "keyboard",
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
        "agentic",
        "agent_devtools",
        "agent_dev_tools",
        "agentdevtools",
        "agents",
        "mcp",
        "model_context_protocol",
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
        "chrome",
        "chromium",
        "firefox",
        "mozilla",
        "safari",
        "webkit",
        "ios",
        "ipados",
        "browser",
        "browserlogforwarding",
        "browser_log_forwarding",
        "테스트",
        "품질",
        "도구",
        "툴",
        "빌드",
        "배포",
        "모니터링",
        "브라우저",
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


def load_env_files() -> None:
    for env_path in (ROOT / ".env.local", ROOT / ".env"):
        load_env_file(env_path)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="현재 Notion DB 데이터를 뉴스레터 HTML로 만들고 메일로 발송합니다.")
    parser.add_argument("report", nargs="?", help="호환용 인자입니다. 메일 내용은 항상 현재 Notion DB 기준으로 생성합니다.")
    parser.add_argument("--subject", help="메일 제목. 없으면 리포트 제목을 사용합니다.")
    parser.add_argument("--to", action="append", default=[], help="수신자 이메일. 쉼표 구분 또는 여러 번 입력 가능")
    parser.add_argument("--subscribers", help="수신자 목록 txt 파일")
    parser.add_argument("--magazine-base-url", help="매거진 공개 URL. 없으면 SITE_URL 환경변수 또는 로컬 미리보기 링크를 사용합니다.")
    parser.add_argument(
        "--audience",
        choices=("service", "design", "general", "uiux", "service-design", "service_design", "dev", "develop", "all", "subscriptions"),
        default="general",
        help=(
            "뉴스레터 대상. service는 Service, design은 Design, general/uiux는 Service+Design, "
            "dev는 DEV, all은 전체 이슈를 포함합니다. subscriptions는 구독자가 선택한 카테고리 글을 한 메일에 담아 발송합니다."
        ),
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
    if audience in {"uiux", "service-design", "service_design"}:
        return "general"
    return audience


def resolve_magazine_base_url(value: str | None, stage: str) -> str:
    if value:
        return value.strip()
    if stage in {"test", "final"}:
        return os.getenv("SITE_URL", os.getenv("MAGAZINE_BASE_URL", PRODUCTION_SITE_URL)).strip()
    return os.getenv("SITE_URL", os.getenv("MAGAZINE_BASE_URL", "")).strip()


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


def final_recipients_for_audience(audience: str) -> list[str]:
    notion_subscribers = notion_newsletter_subscribers(audience)
    if not notion_subscribers:
        raise SystemExit("최종 발송 수신자는 Notion 구독자 DB에서만 가져옵니다. 활성 구독자가 없습니다.")
    return notion_subscribers


def split_recipients(values: list[str]) -> list[str]:
    emails: list[str] = []
    for value in values:
        emails.extend(email.strip() for email in value.split(",") if email.strip())
    return emails


def normalize_email(value: str) -> str:
    return value.strip().lower()


def unique_emails(values: list[str]) -> list[str]:
    return sorted({normalize_email(value) for value in values if normalize_email(value)})


def unsubscribe_secret() -> str:
    secrets = unsubscribe_secrets()
    return secrets[0] if secrets else ""


def unsubscribe_secrets() -> list[str]:
    raw_fallbacks = os.getenv("NEWSLETTER_UNSUBSCRIBE_SECRETS", "")
    candidates = [
        os.getenv("NEWSLETTER_UNSUBSCRIBE_SECRET", ""),
        *(secret.strip() for secret in raw_fallbacks.split(",")),
        os.getenv("CRON_SECRET", ""),
    ]
    secrets: list[str] = []
    for secret in candidates:
        if secret and secret not in secrets:
            secrets.append(secret)
    return secrets


def unsubscribe_url(email: str, magazine_base_url: str | None) -> str:
    secret = unsubscribe_secret()
    normalized_email = normalize_email(email)
    if not secret or not normalized_email:
        return ""

    signature = hmac.new(secret.encode("utf-8"), normalized_email.encode("utf-8"), hashlib.sha256).hexdigest()
    base_url = (magazine_base_url or os.getenv("SITE_URL", PRODUCTION_SITE_URL)).rstrip("/")
    query = urllib.parse.urlencode({"email": normalized_email, "sig": signature})
    return f"{base_url}/api/unsubscribe?{query}"


def ensure_unsubscribe_links_enabled() -> None:
    if not unsubscribe_secret():
        raise SystemExit("뉴스레터 발송에는 NEWSLETTER_UNSUBSCRIBE_SECRET 또는 CRON_SECRET 환경변수가 필요합니다.")


def notion_request(path: str, payload: dict[str, object] | None = None) -> dict[str, object]:
    token = os.getenv("NOTION_TOKEN", os.getenv("NOTION_API_KEY", ""))
    if not token:
        return {}

    data = json.dumps(payload).encode("utf-8") if payload is not None else None
    request = urllib.request.Request(
        f"https://api.notion.com/v1/{path}",
        data=data,
        headers={
            "Authorization": f"Bearer {token}",
            "Notion-Version": "2022-06-28",
            "Content-Type": "application/json",
        },
        method="POST" if payload is not None else "GET",
    )
    with urllib.request.urlopen(request, timeout=20) as response:
        return json.loads(response.read().decode("utf-8"))


def notion_property_text(properties: dict[str, object], names: tuple[str, ...]) -> str:
    prop = next((properties[name] for name in names if name in properties), None)
    if not isinstance(prop, dict):
        return ""

    prop_type = prop.get("type")
    if prop_type == "title":
        return "".join(item.get("plain_text", "") for item in prop.get("title", []) if isinstance(item, dict)).strip()
    if prop_type == "rich_text":
        return "".join(item.get("plain_text", "") for item in prop.get("rich_text", []) if isinstance(item, dict)).strip()
    if prop_type == "email":
        return str(prop.get("email") or "").strip()
    if prop_type == "select":
        selected = prop.get("select")
        return str(selected.get("name", "") if isinstance(selected, dict) else "").strip()
    return ""


def notion_property_tags(properties: dict[str, object], names: tuple[str, ...]) -> list[str]:
    prop = next((properties[name] for name in names if name in properties), None)
    if isinstance(prop, dict) and prop.get("type") == "multi_select":
        return [str(item.get("name", "")).strip() for item in prop.get("multi_select", []) if isinstance(item, dict) and item.get("name")]
    text = notion_property_text(properties, names)
    return [item.strip() for item in text.split(",") if item.strip()]


def subscriber_database_id() -> str:
    database_id = os.getenv("NEWSLETTER_SUBSCRIBERS_DATABASE_ID", "").strip()
    if not database_id:
        raise SystemExit("NEWSLETTER_SUBSCRIBERS_DATABASE_ID 환경변수가 필요합니다.")
    return database_id


def subscriber_audience_matches(audience: str, values: list[str]) -> bool:
    if not values:
        return True
    normalized_values = {normalize_develop_token(value) for value in values}
    audience = normalize_audience(audience)
    if audience == "dev":
        expected = {"dev", "develop", "development", "frontend"}
    elif audience == "design":
        expected = {"design", "service_design", "uiux", "ui_ux", "general"}
    elif audience == "service":
        expected = {"service", "service_design", "uiux", "ui_ux", "general"}
    else:
        expected = {"uiux", "ui_ux", "service", "design", "service_design", "general"}
    return bool(normalized_values.intersection(expected))


def expand_subscriber_audiences(values: list[str]) -> tuple[str, ...]:
    if not values:
        return SUBSCRIPTION_AUDIENCES
    normalized_values = {normalize_develop_token(value) for value in values}
    selected: set[str] = set()
    if normalized_values.intersection({"service", "service_design", "uiux", "ui_ux", "general"}):
        selected.add("service")
    if normalized_values.intersection({"design", "service_design", "uiux", "ui_ux", "general"}):
        selected.add("design")
    if normalized_values.intersection({"dev", "develop", "development", "frontend"}):
        selected.add("dev")
    return tuple(audience for audience in SUBSCRIPTION_AUDIENCES if audience in selected)


def concrete_audiences(audience: str) -> tuple[str, ...]:
    audience = normalize_audience(audience)
    if audience == "subscriptions":
        return SUBSCRIPTION_AUDIENCES
    return (audience,)


def notion_newsletter_subscribers(audience: str) -> list[str]:
    if not os.getenv("NOTION_TOKEN", os.getenv("NOTION_API_KEY", "")):
        return []

    database_id = subscriber_database_id()
    pages: list[dict[str, object]] = []
    cursor = None
    while True:
        payload: dict[str, object] = {"page_size": 100}
        if cursor:
            payload["start_cursor"] = cursor
        data = notion_request(f"databases/{database_id}/query", payload)
        pages.extend(page for page in data.get("results", []) if isinstance(page, dict))
        cursor = data.get("next_cursor") if data.get("has_more") else None
        if not cursor:
            break

    emails: list[str] = []
    for page in pages:
        properties = page.get("properties", {})
        if not isinstance(properties, dict):
            continue
        status = normalize_develop_token(notion_property_text(properties, SUBSCRIBER_STATUS_PROPERTIES) or "active")
        if status in {"unsubscribed", "inactive", "해지"}:
            continue
        if not subscriber_audience_matches(audience, notion_property_tags(properties, SUBSCRIBER_AUDIENCE_PROPERTIES)):
            continue
        email = normalize_email(notion_property_text(properties, SUBSCRIBER_EMAIL_PROPERTIES))
        if email:
            emails.append(email)
    return unique_emails(emails)


def notion_newsletter_subscriber_records() -> list[dict[str, object]]:
    if not os.getenv("NOTION_TOKEN", os.getenv("NOTION_API_KEY", "")):
        return []

    database_id = subscriber_database_id()
    pages: list[dict[str, object]] = []
    cursor = None
    while True:
        payload: dict[str, object] = {"page_size": 100}
        if cursor:
            payload["start_cursor"] = cursor
        data = notion_request(f"databases/{database_id}/query", payload)
        pages.extend(page for page in data.get("results", []) if isinstance(page, dict))
        cursor = data.get("next_cursor") if data.get("has_more") else None
        if not cursor:
            break

    records: list[dict[str, object]] = []
    seen: set[str] = set()
    for page in pages:
        properties = page.get("properties", {})
        if not isinstance(properties, dict):
            continue
        status = normalize_develop_token(notion_property_text(properties, SUBSCRIBER_STATUS_PROPERTIES) or "active")
        if status in {"unsubscribed", "inactive", "해지"}:
            continue
        email = normalize_email(notion_property_text(properties, SUBSCRIBER_EMAIL_PROPERTIES))
        if not email or email in seen:
            continue
        audiences = expand_subscriber_audiences(notion_property_tags(properties, SUBSCRIBER_AUDIENCE_PROPERTIES))
        if not audiences:
            continue
        records.append({"email": email, "audiences": audiences})
        seen.add(email)
    return records


def extract_title(markdown: str, fallback: str) -> str:
    for line in markdown.splitlines():
        if line.startswith("# "):
            return line[2:].strip()
    return fallback


def report_slug(report_path: Path) -> str:
    return report_path.stem.replace("-uiux-web-service-weekly-trend-report", "")


def split_issue_heading(heading: str) -> tuple[str, str, str, list[str]]:
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
    title = re.sub(r"#[^\s#]+", "", rest).strip()
    return number, platform, title, tags


def clean_newsletter_headline(text: str) -> str:
    headline = clean_newsletter_text(text)
    for label in ("업데이트", "핵심 업데이트", "기술 맥락", "서비스 맥락"):
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


def normalize_newsletter_label(label: str) -> str:
    return re.sub(r"\s+", " ", label.strip().lower())


def normalize_source_url(url: str) -> str:
    return url.strip().rstrip("/")


def html_to_plain_text(value: str) -> str:
    text = re.sub(r"<[^>]+>", "", html.unescape(value or ""))
    return re.sub(r"\s+", " ", text).strip()


def load_report_issue_index() -> dict[str, dict[str, object]]:
    if not REPORT_DATA_PATH.exists():
        return {}

    try:
        payload = json.loads(REPORT_DATA_PATH.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return {}

    issues = payload.get("issues", [])
    if not isinstance(issues, list):
        return {}

    issue_index: dict[str, dict[str, object]] = {}
    for issue in issues:
        if not isinstance(issue, dict):
            continue
        source_url = normalize_source_url(str(issue.get("sourceUrl") or ""))
        if source_url:
            issue_index[source_url] = issue
    return issue_index


def fetch_current_notion_report() -> dict[str, object]:
    command = ["node", "scripts/legacy/fetch_notion.mjs"]
    try:
        subprocess.run(command, cwd=ROOT, check=True)
    except FileNotFoundError as exc:
        raise SystemExit("Notion 데이터를 가져오려면 npm 실행 파일이 필요합니다.") from exc
    except subprocess.CalledProcessError as exc:
        raise SystemExit(f"Notion 데이터 동기화에 실패했습니다: {' '.join(command)}") from exc

    if not REPORT_DATA_PATH.exists():
        raise SystemExit("Notion 데이터 파일을 찾지 못했습니다: src/data/report.json")

    try:
        payload = json.loads(REPORT_DATA_PATH.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise SystemExit("Notion 데이터 JSON을 읽지 못했습니다.") from exc

    if not isinstance(payload, dict):
        raise SystemExit("Notion 데이터 JSON 형식이 올바르지 않습니다.")
    return payload


def latest_issue_date(report: dict[str, object]) -> str:
    issues = report.get("issues", [])
    if not isinstance(issues, list):
        return ""
    dates = sorted({
        str(issue.get("date") or "")[:10]
        for issue in issues
        if isinstance(issue, dict) and str(issue.get("date") or "")[:10]
    })
    return dates[-1] if dates else ""


def filter_report_to_latest_issue_date(report: dict[str, object]) -> dict[str, object]:
    latest_date = latest_issue_date(report)
    if not latest_date:
        return report
    issues = report.get("issues", [])
    if not isinstance(issues, list):
        return report
    filtered_issues = [
        issue
        for issue in issues
        if isinstance(issue, dict) and str(issue.get("date") or "")[:10] == latest_date
    ]
    return {
        **report,
        "issues": filtered_issues,
        "newsletterDate": latest_date,
    }


def section_text_summary(sections: object, limit: int = 128) -> str:
    if not isinstance(sections, list):
        return ""
    parts: list[str] = []
    for section in sections:
        if not isinstance(section, dict):
            continue
        title = str(section.get("title") or "")
        if title not in {"매거진 인사이트", "인사이트"}:
            continue
        blocks = section.get("blocks")
        if not isinstance(blocks, list):
            continue
        for block in blocks:
            if not isinstance(block, dict):
                continue
            kind = str(block.get("kind") or "")
            if kind not in {"paragraph", "quote"}:
                continue
            text = html_to_plain_text(str(block.get("html") or ""))
            if text:
                parts.append(text)
            if len(parts) >= 2:
                break
        if parts:
            break
    return trim_newsletter_summary(parts, limit)


def notion_report_items(report: dict[str, object], audience: str) -> list[dict[str, object]]:
    audience = normalize_audience(audience)
    raw_issues = report.get("issues", [])
    if not isinstance(raw_issues, list):
        return []

    items: list[dict[str, object]] = []
    for issue in raw_issues:
        if not isinstance(issue, dict):
            continue
        tags = [str(tag) for tag in issue.get("tags", [])] if isinstance(issue.get("tags"), list) else []
        audience_categories = [
            str(issue.get("areaKey") or issue.get("area") or ""),
            str(issue.get("categoryKey") or issue.get("category") or ""),
            str(issue.get("platform") or ""),
        ]
        classification_categories = [
            *audience_categories,
            html_to_plain_text(str(issue.get("takeawayHtml") or "")),
            html_to_plain_text(str(issue.get("deckHtml") or "")),
        ]
        if not should_include_issue_for_audience(audience_categories, tags, audience):
            continue

        item = {
            "number": str(issue.get("number") or len(items) + 1).zfill(2),
            "platform": str(issue.get("platform") or "CTTD"),
            "tags": tags,
            "area": str(issue.get("area") or issue.get("areaKey") or ""),
            "category": str(issue.get("categoryKey") or issue.get("category") or ""),
            "headline": html_to_plain_text(str(issue.get("takeawayHtml") or "")),
            "description": html_to_plain_text(str(issue.get("deckHtml") or "")),
            "detailSummary": section_text_summary(issue.get("sections")),
            "sourceUrl": str(issue.get("sourceUrl") or ""),
        }
        if audience == "dev":
            item["audienceCategory"] = develop_subcategory_label(classification_categories, tags)
        items.append(item)
    return items


def apply_report_issue_content(items: list[dict[str, object]]) -> list[dict[str, object]]:
    issue_index = load_report_issue_index()
    if not issue_index:
        return items

    for item in items:
        source_url = normalize_source_url(str(item.get("sourceUrl") or ""))
        if not source_url:
            continue
        report_issue = issue_index.get(source_url)
        if not report_issue:
            continue

        headline = html_to_plain_text(str(report_issue.get("takeawayHtml") or ""))
        description = html_to_plain_text(str(report_issue.get("deckHtml") or ""))
        if headline:
            item["headline"] = headline
        if description:
            item["description"] = description

    return items


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
    current_area = ""
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
        current.pop("headlineSource", None)
        items.append(current)
        current = None

    for raw_line in markdown.splitlines():
        line = raw_line.strip()

        if line.startswith("## ") and not line.startswith("### "):
            current_area = line[3:].strip()
            continue

        if line.startswith("### ") and not line.startswith("#### "):
            current_category = line[4:].strip()
            continue

        if line.startswith("#### "):
            heading = line[5:].strip()
            if not re.match(r"\d+\.\s*", heading):
                continue

            append_current()

            number, platform, heading_title, tags = split_issue_heading(heading)
            current = {
                "number": number,
                "platform": platform,
                "tags": tags,
                "area": current_area,
                "sectionCategory": current_category,
                "category": "",
                "headline": clean_newsletter_headline(heading_title),
                "headlineSource": "heading" if heading_title else "",
                "description": "",
                "detailSummaryParts": [],
            }
            current_section = ""
            continue

        if current is None:
            continue

        if not current_section and line.startswith("- "):
            label, value = split_newsletter_label(line[2:])
            normalized_label = normalize_newsletter_label(label)
            if normalized_label in {"카테고리", "category"}:
                current["category"] = value
            elif normalized_label in {"출처 url", "source url"}:
                current["sourceUrl"] = value
            continue

        if line.startswith("##### "):
            current_section = line[6:].strip()
            continue

        if current_section in NEWSLETTER_HEADLINE_SECTIONS and line.startswith("- "):
            label, value = split_newsletter_label(line[2:])
            if not current["headline"]:
                current["headline"] = clean_newsletter_headline(line[2:])
                current["headlineSource"] = "summary"
            if label in NEWSLETTER_DESCRIPTION_LABELS and not current["description"]:
                current["description"] = value
            continue

        if current_section in NEWSLETTER_DETAIL_SUMMARY_SECTIONS:
            if line.startswith("> ") and current.get("headlineSource") != "heading":
                current["headline"] = clean_newsletter_headline(line[2:])
                current["headlineSource"] = "insight"
                continue
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

    return apply_report_issue_content(items)


def should_include_issue_for_audience(categories: str | list[str], tags: list[str], audience: str) -> bool:
    audience = normalize_audience(audience)
    if isinstance(categories, str):
        categories = [categories]
    primary_area = normalize_develop_token(categories[0]) if categories else ""
    if primary_area in DEVELOP_CATEGORY_KEYS:
        return audience == "dev" or audience == "all"
    if primary_area in DESIGN_CATEGORY_KEYS:
        return audience in {"design", "general", "all"}
    if primary_area in SERVICE_CATEGORY_KEYS:
        return audience in {"service", "general", "all"}

    is_develop = any(is_develop_issue(category, tags) for category in categories)
    tokens = develop_tokens(categories, tags)
    is_design = bool(tokens.intersection(DESIGN_CATEGORY_KEYS))
    if audience == "dev":
        return is_develop
    if audience == "design":
        return not is_develop and is_design
    if audience == "service":
        return not is_develop and not is_design
    if audience == "all":
        return True
    return not is_develop


def audience_label(audience: str) -> str:
    audience = normalize_audience(audience)
    return {
        "service": "Service",
        "design": "Design",
        "general": "Service/Design",
        "dev": "Dev",
        "all": "전체",
    }.get(audience, audience)


def audience_description(audience: str) -> str:
    audience = normalize_audience(audience)
    if audience == "service":
        return "Service 이슈"
    if audience == "design":
        return "Design 이슈"
    if audience == "dev":
        return "Dev 이슈"
    if audience == "all":
        return "전체 대상 UIUX/Web Service 이슈"
    return "UIUX/Web Service 이슈"


def audience_kicker(audience: str) -> str:
    audience = normalize_audience(audience)
    if audience == "service":
        return "Weekly Service Intelligence"
    if audience == "design":
        return "Weekly Design Intelligence"
    if audience == "dev":
        return "Weekly Dev Intelligence"
    return "Weekly Design Intelligence"


def audience_display_title(audience: str) -> str:
    return WEB_TREND_TITLE


def load_newsletter_template_sections() -> dict[str, str]:
    content = NEWSLETTER_TEMPLATE_PATH.read_text(encoding="utf-8")
    sections = {match.group("name"): match.group("body") for match in NEWSLETTER_SECTION_PATTERN.finditer(content)}
    required = {"shell", "card", "empty"}
    missing = required.difference(sections)
    if missing:
        raise SystemExit(f"뉴스레터 템플릿 섹션이 없습니다: {', '.join(sorted(missing))}")
    return sections


def fill_newsletter_template(template: str, values: dict[str, str]) -> str:
    rendered = template
    for key, value in values.items():
        rendered = rendered.replace(f"{{{{{key}}}}}", value)
    return rendered


def audience_title(default_title: str, audience: str) -> str:
    audience = normalize_audience(audience)
    if audience in {"service", "design", "general", "dev"}:
        return audience_display_title(audience)
    if audience != "general":
        return f"{default_title} - {audience_label(audience)}"
    return default_title


def audience_subject(audience: str) -> str:
    return f"[CTTD] {WEB_TREND_TITLE}"


def is_develop_issue(category: str, tags: list[str]) -> bool:
    tokens = develop_tokens([category], tags)
    return bool(tokens.intersection(DEVELOP_DETECTION_KEYS))


def magazine_href(report_path: Path, number: str, magazine_base_url: str | None) -> str:
    base_url = (magazine_base_url or os.getenv("SITE_URL", os.getenv("MAGAZINE_BASE_URL", ""))).strip()

    if base_url:
        return f"{base_url.rstrip('/')}/articles/{number.zfill(2)}"

    return f"../site/articles/{number.zfill(2)}"


def magazine_asset_href(asset_name: str, magazine_base_url: str | None) -> str:
    base_url = (magazine_base_url or os.getenv("SITE_URL", os.getenv("MAGAZINE_BASE_URL", ""))).strip()
    if base_url:
        return f"{base_url.rstrip('/')}/assets/{asset_name}"

    return f"../site/assets/{asset_name}"


def email_logo_path() -> Path:
    return ROOT / "public" / "assets" / EMAIL_LOGO_ASSET_NAME


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
    summary_brief_sections = {"서비스 변화 요약", "기술 변화 요약", "핵심 업데이트", "핵심 캠페인", "변경 전/후"}
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
    card_template: str | None = None,
) -> str:
    number = str(item["number"])
    platform = str(item["platform"])
    category = str(item.get("category") or item.get("area") or "").strip()
    headline = str(item.get("headline") or "").strip()
    description = str(item.get("description") or "").strip()
    detail_summary = str(item.get("detailSummary") or "").strip()
    title = f"[{platform}] {headline}" if headline else f"[{platform}]"
    raw_href = str(item.get("externalUrl") or "")
    if not raw_href:
        raw_href = magazine_href(report_path, number, magazine_base_url)
    href = html.escape(raw_href, quote=True)
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

    category_html = ""
    if category:
        category_html = (
            '<div style="margin:0 0 6px;color:#777777;font-size:11px;line-height:1.3;font-weight:700;'
            'letter-spacing:0.08em;text-transform:uppercase;'
            'font-family:Arial,Apple SD Gothic Neo,Malgun Gothic,sans-serif;">'
            f"{html.escape(category)}</div>"
        )

    template = card_template or load_newsletter_template_sections()["card"]
    return fill_newsletter_template(
        template,
        {
            "DISPLAY_NUMBER": f"{display_number:02d}",
            "AREA_BLOCK": category_html,
            "HREF": href,
            "TITLE": html.escape(title),
            "DESCRIPTION_BLOCK": description_html,
            "DETAIL_SUMMARY_BLOCK": detail_summary_html,
            "TAGS": tags,
        },
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
    card_template = load_newsletter_template_sections()["card"]
    parts: list[str] = []
    display_number = 1
    for _, category_items in group_develop_newsletter_items(items):
        for item in category_items:
            parts.append(render_newsletter_item(report_path, item, magazine_base_url, display_number, card_template))
            display_number += 1

    return "\n".join(parts)


def render_combined_newsletter_body(
    report_path: Path,
    items_by_audience: dict[str, list[dict[str, object]]],
    audiences: tuple[str, ...],
    magazine_base_url: str | None,
) -> str:
    card_template = load_newsletter_template_sections()["card"]
    parts: list[str] = []
    display_number = 1
    for audience in audiences:
        audience_items = items_by_audience.get(audience, [])
        if not audience_items:
            continue
        parts.append(render_newsletter_category_heading(SUBSCRIPTION_AUDIENCE_LABELS.get(audience, audience_label(audience))))
        for item in audience_items:
            parts.append(render_newsletter_item(report_path, item, magazine_base_url, display_number, card_template))
            display_number += 1
    return "\n".join(parts)


def render_combined_newsletter(
    report_path: Path,
    magazine_base_url: str | None,
    items_by_audience: dict[str, list[dict[str, object]]],
    audiences: tuple[str, ...],
    recipient_email: str = "",
) -> str:
    templates = load_newsletter_template_sections()
    body = render_combined_newsletter_body(report_path, items_by_audience, audiences, magazine_base_url)
    if not body:
        body = fill_newsletter_template(
            templates["empty"],
            {
                "EMPTY_MESSAGE": "선택한 카테고리에 포함되는 이슈가 없습니다.",
            },
        )

    selected_labels = ", ".join(SUBSCRIPTION_AUDIENCE_LABELS.get(audience, audience_label(audience)) for audience in audiences)
    return fill_newsletter_template(
        templates["shell"],
        {
            "PAGE_TITLE": html.escape(WEB_TREND_TITLE),
            "PREHEADER": "UIUX/Web Service 주간 트렌드 리포트",
            "LOGO_SRC": html.escape(magazine_asset_href(EMAIL_LOGO_ASSET_NAME, magazine_base_url), quote=True),
            "KICKER": "NEWSLETTER",
            "DISPLAY_TITLE": WEB_TREND_TITLE,
            "DESCRIPTION": html.escape(
                f"이번 주 매거진에 업데이트된 {selected_labels or '선택한 카테고리'} 이슈입니다. 상세 내용은 각 매거진 링크에서 확인하세요."
            ),
            "BODY": body,
            "FOOTER": newsletter_footer_html(recipient_email, magazine_base_url),
        },
    )


def render_newsletter(
    title: str,
    markdown: str,
    report_path: Path,
    magazine_base_url: str | None = None,
    audience: str = "general",
    items: list[dict[str, object]] | None = None,
    recipient_email: str = "",
) -> str:
    audience = normalize_audience(audience)
    templates = load_newsletter_template_sections()
    if items is None:
        items = parse_newsletter_items(markdown, audience)
    if audience == "dev":
        body = render_develop_newsletter_body(report_path, items, magazine_base_url)
    else:
        body = "\n".join(
            render_newsletter_item(report_path, item, magazine_base_url, index, templates["card"])
            for index, item in enumerate(items, start=1)
        )
    if not body:
        body = fill_newsletter_template(
            templates["empty"],
            {
                "EMPTY_MESSAGE": f"{html.escape(audience_label(audience))} 대상에 포함되는 이슈가 없습니다.",
            },
        )

    logo_src = html.escape(magazine_asset_href(EMAIL_LOGO_ASSET_NAME, magazine_base_url), quote=True)
    kicker = html.escape(audience_kicker(audience))
    display_title = html.escape(audience_display_title(audience))
    description = html.escape(
        f"이번 주 매거진에 업데이트된 {audience_description(audience)}입니다. 상세 내용은 각 매거진 링크에서 확인하세요."
    )
    return fill_newsletter_template(
        templates["shell"],
        {
            "PAGE_TITLE": html.escape(title),
            "PREHEADER": "UIUX/Web Service 주간 트렌드 리포트",
            "LOGO_SRC": logo_src,
            "KICKER": kicker,
            "DISPLAY_TITLE": display_title,
            "DESCRIPTION": description,
            "BODY": body,
            "FOOTER": newsletter_footer_html(recipient_email, magazine_base_url),
        },
    )


def newsletter_footer_html(recipient_email: str, magazine_base_url: str | None) -> str:
    link = unsubscribe_url(recipient_email, magazine_base_url)
    if not link:
        return "이 메일은 CTTD Newsletter 시스템에서 발송되었습니다."
    return (
        "이 메일은 CTTD Newsletter 시스템에서 발송되었습니다.<br>"
        "수신을 원하지 않으시면 "
        f'<a href="{html.escape(link, quote=True)}" style="color:#555555;font-weight:700;text-decoration:underline;text-underline-offset:3px;">구독 해지</a>'
        "를 눌러주세요."
    )


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
    recipient_email: str = "",
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
        area = str(item.get("area") or "").strip()
        headline = str(item.get("headline") or "").strip()
        description = str(item.get("description") or "").strip()
        item_title = f"[{platform}] {headline}" if headline else f"[{platform}]"
        tags = " ".join(f"#{tag}" for tag in item["tags"])  # type: ignore[index]
        href = str(item.get("externalUrl") or "")
        if not href:
            href = magazine_href(report_path, str(item["number"]), magazine_base_url)
        lines.append(f"{display_number:02d}. {item_title}")
        if area:
            lines.append(area)
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

    unsubscribe_link = unsubscribe_url(recipient_email, magazine_base_url)
    if unsubscribe_link:
        lines.append(f"구독 해지: {unsubscribe_link}")

    return "\n".join(lines)


def combined_newsletter_plain_text(
    report_path: Path,
    magazine_base_url: str | None,
    items_by_audience: dict[str, list[dict[str, object]]],
    audiences: tuple[str, ...],
    recipient_email: str = "",
) -> str:
    lines = [WEB_TREND_TITLE, ""]
    display_number = 1

    def append_item(item: dict[str, object], number: int) -> None:
        platform = str(item["platform"])
        headline = str(item.get("headline") or "").strip()
        description = str(item.get("description") or "").strip()
        item_title = f"[{platform}] {headline}" if headline else f"[{platform}]"
        href = str(item.get("externalUrl") or "")
        if not href:
            href = magazine_href(report_path, str(item["number"]), magazine_base_url)
        lines.append(f"{number:02d}. {item_title}")
        if description:
            lines.append(description)
        lines.append(href)
        lines.append("")

    for audience in audiences:
        audience_items = items_by_audience.get(audience, [])
        if not audience_items:
            continue
        lines.append(f"## {SUBSCRIPTION_AUDIENCE_LABELS.get(audience, audience_label(audience))}")
        lines.append("")
        for item in audience_items:
            append_item(item, display_number)
            display_number += 1

    if display_number == 1:
        lines.append("선택한 카테고리에 포함되는 이슈가 없습니다.")

    unsubscribe_link = unsubscribe_url(recipient_email, magazine_base_url)
    if unsubscribe_link:
        lines.append(f"구독 해지: {unsubscribe_link}")
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
        return final_recipients_for_audience(args.audience)

    recipients = split_recipients(args.to) + read_subscribers(args.subscribers)
    return sorted(set(recipients))


def resolve_subscription_records(args: argparse.Namespace) -> list[dict[str, object]]:
    if args.stage == "test":
        return [{"email": TEST_RECIPIENT, "audiences": SUBSCRIPTION_AUDIENCES}]
    if args.stage == "final":
        records = notion_newsletter_subscriber_records()
        if not records:
            raise SystemExit("최종 발송 수신자는 Notion 구독자 DB에서만 가져옵니다. 활성 구독자가 없습니다.")
        return records
    recipients = split_recipients(args.to) + read_subscribers(args.subscribers)
    return [{"email": email, "audiences": SUBSCRIPTION_AUDIENCES} for email in unique_emails(recipients)]


def audience_args(args: argparse.Namespace, audience: str) -> argparse.Namespace:
    next_args = copy(args)
    next_args.audience = audience
    return next_args


def enforce_send_stage(args: argparse.Namespace, recipients: list[str], magazine_base_url: str) -> None:
    if not args.send:
        return

    if args.stage == "preview":
        return

    if magazine_base_url.rstrip("/") != PRODUCTION_SITE_URL:
        raise SystemExit(f"{args.stage} 발송에는 SITE_URL={PRODUCTION_SITE_URL} 이 필요합니다.")

    if args.stage == "test" and recipients != [TEST_RECIPIENT]:
        raise SystemExit(f"테스트 발송 수신자는 {TEST_RECIPIENT}만 허용됩니다.")

    if args.stage == "final":
        if not args.approved:
            raise SystemExit("최종 발송에는 테스트 메일 확인 후 --approved를 명시해야 합니다.")
        expected_recipients = final_recipients_for_audience(args.audience)
        if recipients != expected_recipients:
            raise SystemExit("최종 발송 수신자는 Notion 구독자 DB의 활성 구독자 목록과 일치해야 합니다.")


def enforce_subscription_send_stage(args: argparse.Namespace, records: list[dict[str, object]], magazine_base_url: str) -> None:
    if not args.send:
        return

    if args.stage == "preview":
        return

    if magazine_base_url.rstrip("/") != PRODUCTION_SITE_URL:
        raise SystemExit(f"{args.stage} 발송에는 SITE_URL={PRODUCTION_SITE_URL} 이 필요합니다.")

    emails = [str(record.get("email") or "") for record in records]
    if args.stage == "test" and emails != [TEST_RECIPIENT]:
        raise SystemExit(f"테스트 발송 수신자는 {TEST_RECIPIENT}만 허용됩니다.")

    if args.stage == "final" and not args.approved:
        raise SystemExit("최종 발송에는 테스트 메일 확인 후 --approved를 명시해야 합니다.")


def newsletter_title_for_audience(default_title: str, args: argparse.Namespace, audience: str) -> str:
    if args.subject and args.audience != "subscriptions":
        return args.subject
    if args.subject:
        return f"{args.subject} - {audience_label(audience)}"
    return audience_title(default_title, audience)


def newsletter_subject_for_audience(args: argparse.Namespace, audience: str) -> str:
    if args.subject and args.audience != "subscriptions":
        return args.subject
    if args.subject:
        return f"{args.subject} - {audience_label(audience)}"
    return audience_subject(audience)


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
    load_env_files()

    args = parse_args()
    notion_report = filter_report_to_latest_issue_date(fetch_current_notion_report())
    slug = str(notion_report.get("slug") or "notion-current")
    report_path = Path(args.report) if args.report else Path(f"{slug}-notion.md")
    markdown = f"# {notion_report.get('title') or 'CTTD Trend Magazine'}\n"
    default_title = str(notion_report.get("title") or "CTTD Trend Magazine")
    magazine_base_url = resolve_magazine_base_url(args.magazine_base_url, args.stage)

    if args.send and not magazine_base_url:
        raise SystemExit(
            "뉴스레터 발송에는 매거진 사이트 공개 URL이 필요합니다. "
            "--magazine-base-url 또는 SITE_URL을 설정하세요."
        )
    if args.send:
        ensure_unsubscribe_links_enabled()

    if args.audience == "subscriptions":
        items_by_audience = {
            audience: notion_report_items(notion_report, audience)
            for audience in SUBSCRIPTION_AUDIENCES
        }
        records = resolve_subscription_records(args)
        enforce_subscription_send_stage(args, records, magazine_base_url)
        preview_html = render_combined_newsletter(
            report_path,
            magazine_base_url or None,
            items_by_audience,
            SUBSCRIPTION_AUDIENCES,
        )
        preview_path = save_preview(report_path, preview_html, "subscriptions")

        if not args.send:
            print(f"구독 카테고리 통합 미리보기 생성: {preview_path}")
            if args.stage in {"test", "final"}:
                print(f"{args.stage} 단계 수신자: {', '.join(str(record.get('email') or '') for record in records)}")
            return

        if not records:
            raise SystemExit("수신자가 없습니다. --to 또는 --subscribers를 입력하세요.")

        sender = os.getenv("SMTP_FROM", "")
        sent_count = 0
        for record in records:
            recipient = str(record.get("email") or "")
            audiences = tuple(str(audience) for audience in record.get("audiences", SUBSCRIPTION_AUDIENCES))  # type: ignore[arg-type]
            if not recipient or not any(items_by_audience.get(audience) for audience in audiences):
                continue
            recipient_html = render_combined_newsletter(
                report_path,
                magazine_base_url or None,
                items_by_audience,
                audiences,
                recipient,
            )
            plain_text = combined_newsletter_plain_text(
                report_path,
                magazine_base_url or None,
                items_by_audience,
                audiences,
                recipient,
            )
            send_email(f"[CTTD] {WEB_TREND_TITLE}", sender, [recipient], plain_text, recipient_html)
            sent_count += 1
        if not sent_count:
            raise SystemExit("선택한 카테고리에 포함되는 이슈가 있는 수신자가 없습니다.")
        print(f"통합 발송 완료: {sent_count}명")
        return

    work_items: list[dict[str, object]] = []
    for audience in concrete_audiences(args.audience):
        scoped_args = audience_args(args, audience)
        title = newsletter_title_for_audience(default_title, args, audience)
        subject = newsletter_subject_for_audience(args, audience)
        newsletter_items = notion_report_items(notion_report, audience)
        if args.send and not newsletter_items:
            raise SystemExit(f"{audience_label(audience)} 대상에 포함되는 이슈가 없어 발송을 중단합니다.")

        newsletter_html = render_newsletter(
            title,
            markdown,
            report_path,
            magazine_base_url or None,
            audience,
            newsletter_items,
        )
        preview_path = save_preview(report_path, newsletter_html, audience)
        recipients = resolve_recipients(scoped_args)
        enforce_send_stage(scoped_args, recipients, magazine_base_url)
        work_items.append({
            "audience": audience,
            "title": title,
            "subject": subject,
            "items": newsletter_items,
            "preview_path": preview_path,
            "recipients": recipients,
        })

    if not args.send:
        for item in work_items:
            print(f"{audience_label(str(item['audience']))} 미리보기 생성: {item['preview_path']}")
            if args.stage in {"test", "final"}:
                recipients = item["recipients"]
                print(f"{audience_label(str(item['audience']))} {args.stage} 단계 수신자: {', '.join(recipients)}")
        return

    sender = os.getenv("SMTP_FROM", "")
    sent_count = 0
    for item in work_items:
        audience = str(item["audience"])
        recipients = item["recipients"]
        if not recipients:
            raise SystemExit(f"{audience_label(audience)} 수신자가 없습니다. --to 또는 --subscribers를 입력하세요.")
        for recipient in recipients:
            recipient_html = render_newsletter(
                str(item["title"]),
                markdown,
                report_path,
                magazine_base_url or None,
                audience,
                item["items"],  # type: ignore[arg-type]
                recipient,
            )
            plain_text = newsletter_plain_text(
                str(item["title"]),
                markdown,
                report_path,
                magazine_base_url or None,
                audience,
                item["items"],  # type: ignore[arg-type]
                recipient,
            )
            send_email(str(item["subject"]), sender, [recipient], plain_text, recipient_html)
            sent_count += 1
        print(f"{audience_label(audience)} 발송 완료: {len(recipients)}명")
    print(f"전체 발송 완료: {sent_count}건")


if __name__ == "__main__":
    main()
