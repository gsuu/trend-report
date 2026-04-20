#!/usr/bin/env python3
from __future__ import annotations

import argparse
import html
import json
import re
from dataclasses import dataclass, field
from html.parser import HTMLParser
from pathlib import Path
from urllib.error import URLError
from urllib.request import Request, urlopen


ROOT = Path(__file__).resolve().parents[1]
REPORTS_DIR = ROOT / "reports"
SITE_DIR = ROOT / "site"
ASSETS_DIR = SITE_DIR / "assets"
ARTICLES_DIR = SITE_DIR / "articles"
SHOW_SUBSCRIBE_LINK = False


CATEGORY_LABELS = {
    "fashion": "fashion",
    "ecommerce": "ecommerce",
    "department_store": "department",
    "beauty": "beauty",
    "book_content": "book",
    "jp_fashion": "fashion",
    "jp_ecommerce": "ecommerce",
}

DETAIL_SECTION_TITLES = {"매거진 상세", "사이트 매거진 상세", "웹사이트 상세", "매거진 인사이트"}
SECTION_BLOCK_PATTERN = re.compile(r"^@@(?P<kind>quote|subhead|paragraph|list)@@(?P<text>.*)")
SUMMARY_LABEL_PATTERN = re.compile(r"^(?P<label>[^:：]{2,18})[:：]\s*(?P<value>.+)$")
CORE_SUMMARY_LABELS = {"업데이트", "서비스 맥락", "변경 전", "변경 후"}
HIDDEN_FACT_KEYS = {"출처 URL", "서비스 URL"}
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


def slugify(value: str) -> str:
    slug = re.sub(r"[^0-9a-zA-Z가-힣]+", "-", value.lower()).strip("-")
    return slug or "article"


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

    tags = re.findall(r"#([^\s#]+)", rest)
    title = re.sub(r"#[^\s#]+", "", rest).strip() or platform
    return number, platform, title, tags


def parse_report(path: Path) -> Report:
    lines = path.read_text(encoding="utf-8").splitlines()
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

            continue

        if current_issue and current_section:
            if is_detail_section(current_section):
                current_issue.sections.setdefault(current_section, []).append(section_block("paragraph", line))
            else:
                current_issue.sections.setdefault(current_section, []).append(line)

    slug = path.stem.replace("-uiux-web-service-weekly-trend-report", "")
    return Report(path, slug, title, period, summary, issues, next_week)


def html_shell(title: str, body: str, active: str = "") -> str:
    home_href = "../index.html#magazine" if active == "article" else "#magazine"
    stylesheet = "../assets/styles.css" if active == "article" else "assets/styles.css"
    logo = "../assets/cttd-logo.svg" if active == "article" else "assets/cttd-logo.svg"
    body_class = ' class="is-article-page"' if active == "article" else ""
    subscribe_link = ""
    if SHOW_SUBSCRIBE_LINK:
        subscribe_href = "mailto:project@cttd.co.kr?subject=CTTD%20Trend%20Magazine%20Subscribe"
        subscribe_link = f"""      <a class="subscribe-link" href="{subscribe_href}" aria-label="Subscribe">
        <span>Subscribe</span>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 6h16v12H4z" />
          <path d="m4 7 8 6 8-6" />
        </svg>
      </a>
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
  <meta name="description" content="CTTD UIUX/Web Service Weekly Trend Magazine">
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
{header_actions}\
  </header>
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
    return f"articles/{report.slug}-story-{issue.number.zfill(2)}.html"


def issue_route(issue: Issue) -> str:
    return f"#/story/{issue.number.zfill(2)}"


def issue_takeaway(issue: Issue) -> str:
    detail_quote = issue_detail_quote(issue)
    if detail_quote:
        return detail_quote

    for section_name in ("인사이트", "서비스 변화 요약", "핵심 업데이트", "변경 전/후"):
        items = issue.sections.get(section_name, [])
        if items:
            return strip_brief_label(items[0])
    return issue.title or issue.platform


def issue_deck(issue: Issue) -> str:
    items = issue.sections.get("서비스 변화 요약", []) or issue.sections.get("핵심 업데이트", [])
    if items:
        return strip_brief_label(items[0])
    return issue.meta.get("출처", "")


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
    for label in ("업데이트", "핵심 업데이트", "서비스 맥락"):
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
    category = CATEGORY_LABELS.get(issue.category, issue.category)
    row_class = "issue-row is-compact" if compact else "issue-row"
    return f"""
    <article class="{row_class}">
      <a class="issue-number" href="{issue_href(report, issue)}">{issue.number.zfill(2)}</a>
      <div class="issue-main">
        <p>{clean_inline(category)} / {clean_inline(issue.platform)} / {clean_inline(issue_display_date(report))}</p>
        <h3><a href="{issue_href(report, issue)}">{clean_inline(issue_takeaway(issue))}</a></h3>
      </div>
      <div class="tag-row">{tags}</div>
    </article>
    """


def render_latest_card(report: Report, issue: Issue) -> str:
    tags = " ".join(f"<span>#{clean_inline(tag)}</span>" for tag in issue.tags[:2])
    category = CATEGORY_LABELS.get(issue.category, issue.category)
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
      <h3><a href="{issue_href(report, issue)}">{clean_inline(issue_takeaway(issue))}</a></h3>
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
    category = CATEGORY_LABELS.get(issue.category, issue.category)
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
        <h2><a href="{issue_href(report, issue)}">{clean_inline(issue_takeaway(issue))}</a></h2>
        <p class="story-date">{clean_inline(issue_display_date(report))}</p>
      </div>
    </article>
    """


def render_index(report: Report) -> str:
    payload_json = json.dumps(report_payload(report), ensure_ascii=False).replace("</", "<\\/")

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
        </div>
      </article>

      <section v-else key="home" id="magazine" class="magazine-home">
        <section class="guide-grid" aria-label="아티클 목록">
          <article v-for="issue in report.issues" :key="issue.number" class="guide-card">
            <a :href="issue.route">
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
          route: window.location.hash || "#magazine",
          shareStatus: "",
        }};
      }},
      computed: {{
        activeIssue() {{
          const match = this.route.match(/^#\\/story\\/(\\d+)/);
          if (!match) return null;
          return this.report.issues.find((issue) => issue.number === match[1]) || null;
        }},
      }},
      mounted() {{
        this.syncDocumentState();
        window.addEventListener("hashchange", this.updateRoute);
      }},
      unmounted() {{
        document.body.classList.remove("is-story-open");
        window.removeEventListener("hashchange", this.updateRoute);
      }},
      methods: {{
        updateRoute() {{
          this.route = window.location.hash || "#magazine";
          this.syncDocumentState();
          window.scrollTo({{ top: 0, left: 0, behavior: "instant" }});
        }},
        syncDocumentState() {{
          document.body.classList.toggle("is-story-open", Boolean(this.activeIssue));
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
          return !match || !["업데이트", "서비스 맥락", "변경 전", "변경 후"].includes(match[1]);
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
    return html_shell("CTTD Trend Magazine", body, "home")


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
                "category": CATEGORY_LABELS.get(issue.category, issue.category),
                "date": issue_display_date(report),
                "route": issue_route(issue),
                "image": issue.image,
                "imageCaption": issue.image_caption,
                "tags": issue.tags,
                "takeawayHtml": clean_inline(issue_takeaway(issue)),
                "deckHtml": clean_inline(issue_deck(issue)),
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
        <h1>{clean_inline(issue_takeaway(issue))}</h1>
        <p class="article-deck">{clean_inline(issue_deck(issue))}</p>
        <div class="article-meta-row">
          <div class="article-meta">
            <time>{clean_inline(issue_display_date(report))}</time>
            <span aria-hidden="true">|</span>
            <span class="category-label">{CATEGORY_LABELS.get(issue.category, issue.category)}</span>
          </div>
          <button class="article-share-button" type="button" data-share-title="{html.escape(issue.platform, quote=True)} | Magazine" data-share-text="{html.escape(issue_takeaway(issue), quote=True)}" aria-label="공유하기" title="공유하기">
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
    return html_shell(f"{issue.platform} | CTTD Trend Magazine", body, "article")


def write_site(report: Report) -> None:
    ASSETS_DIR.mkdir(parents=True, exist_ok=True)
    ARTICLES_DIR.mkdir(parents=True, exist_ok=True)

    for old_article in ARTICLES_DIR.glob("*.html"):
        old_article.unlink()

    (SITE_DIR / "index.html").write_text(render_index(report), encoding="utf-8")
    for issue in report.issues:
        article_path = ARTICLES_DIR / f"{report.slug}-story-{issue.number.zfill(2)}.html"
        article_path.write_text(render_article(report, issue), encoding="utf-8")


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
