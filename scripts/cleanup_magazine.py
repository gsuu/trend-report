"""One-shot cleanup for magazine.json + magazine-report.md.

1. Strip "CTTD 위클리 리포트" citation phrases (we no longer want this self-reference).
2. In 점검 질문 sections, rewrite first-person 우리/우리 X usages to third-person targeting.
"""

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MAGAZINE_JSON = ROOT / "public" / "data" / "magazine.json"
MAGAZINE_REPORT = ROOT / "runs" / "2026-05-06" / "magazine" / "magazine-report.md"

# CTTD citation phrases to delete. Order matters — longer/specific first.
CTTD_PATTERNS = [
    re.compile(r"\(출처:\s*([^)]*?),\s*CTTD 위클리 리포트\)"),  # ", CTTD 위클리 리포트" inside (출처: ...)
    re.compile(r"\s*\(\s*CTTD 위클리 리포트[^)]*\)"),  # "(CTTD 위클리 리포트 ...)" anywhere
    re.compile(r"\s*\/\s*CTTD 위클리 리포트\(인용 보도\)"),  # " / CTTD 위클리 리포트(인용 보도)"
    re.compile(r",\s*CTTD 위클리 리포트"),  # standalone ", CTTD 위클리 리포트"
    re.compile(r"\s*CTTD 위클리 리포트\(인용 보도\)"),  # standalone "CTTD 위클리 리포트(인용 보도)"
]

# 점검 질문에서 1인칭 → 제3자 타겟
# 우리 X / 우리(는|가|의|에서|...) 같은 명사 결합부터 처리.
GUMGEOM_PATTERNS = [
    (re.compile(r"우리 서비스에서는"), "서비스에서는"),
    (re.compile(r"우리 서비스에서"), "서비스에서"),
    (re.compile(r"우리 서비스"), "서비스"),
    (re.compile(r"우리 사이트에서는"), "사이트에서는"),
    (re.compile(r"우리 사이트에서"), "사이트에서"),
    (re.compile(r"우리 사이트"), "사이트"),
    (re.compile(r"우리 앱에서는"), "앱에서는"),
    (re.compile(r"우리 앱에서"), "앱에서"),
    (re.compile(r"우리 앱"), "앱"),
    (re.compile(r"우리 팀에서는"), "팀에서는"),
    (re.compile(r"우리 팀에서"), "팀에서"),
    (re.compile(r"우리 팀"), "팀"),
    (re.compile(r"우리 조직에서는"), "조직에서는"),
    (re.compile(r"우리 조직"), "조직"),
    (re.compile(r"우리 회사에서는"), "회사에서는"),
    (re.compile(r"우리 회사"), "회사"),
    (re.compile(r"우리 디자인 시스템"), "디자인 시스템"),
    (re.compile(r"우리 카드 컴포넌트"), "카드 컴포넌트"),
    (re.compile(r"우리 운영 도구"), "운영 도구"),
    (re.compile(r"우리 추천 카드"), "추천 카드"),
    (re.compile(r"우리 매거진"), "매거진"),
    # 일반화: "우리 X" 패턴은 "X"로 대체. "우리 집" 같은 사용자 인용은 위에서 placeholder로 보호됨.
    (re.compile(r"우리\s+([가-힣A-Za-z])"), r"\1"),
    # 단독 우리(는/가/...): 3인칭 "독자"로 대체.
    (re.compile(r"우리는"), "독자는"),
    (re.compile(r"우리가"), "독자가"),
    (re.compile(r"우리를"), "독자를"),
    (re.compile(r"우리의"), "각자의"),
    (re.compile(r"우리에서"), "각자의 환경에서"),
    (re.compile(r"우리에"), "독자에"),
    (re.compile(r"우리도"), "독자도"),
    (re.compile(r"우리와"), "독자와"),
    (re.compile(r"우리"), "독자"),
]

QUOTED_USER_PHRASE_GUARDS = [
    "우리 집",  # 사용자 발화 인용은 보존
    "우리집",
]

def strip_cttd(text: str) -> str:
    out = text
    # First: "(출처: X, CTTD 위클리 리포트)" → "(출처: X)"
    out = CTTD_PATTERNS[0].sub(lambda m: f"(출처: {m.group(1).strip()})", out)
    # Second: any "(CTTD 위클리 리포트 ...)" parenthetical
    out = CTTD_PATTERNS[1].sub("", out)
    # Slash-separated CTTD reference
    out = CTTD_PATTERNS[2].sub("", out)
    # Trailing ", CTTD 위클리 리포트" not in parens
    out = CTTD_PATTERNS[3].sub("", out)
    # Standalone "CTTD 위클리 리포트(인용 보도)"
    out = CTTD_PATTERNS[4].sub("", out)
    # Collapse double spaces
    out = re.sub(r"  +", " ", out)
    return out


def rewrite_third_person(text: str) -> str:
    if "우리" not in text:
        return text
    # Protect quoted user phrases that should stay as-is.
    placeholders = {}
    protected = text
    for idx, phrase in enumerate(QUOTED_USER_PHRASE_GUARDS):
        token = f"\x00G{idx}\x00"
        protected = protected.replace(phrase, token)
        placeholders[token] = phrase
    for pattern, repl in GUMGEOM_PATTERNS:
        protected = pattern.sub(repl, protected)
    # Restore placeholders
    for token, phrase in placeholders.items():
        protected = protected.replace(token, phrase)
    return protected


def clean_blocks(blocks, in_gumgeom_zone_initial=False):
    in_zone = in_gumgeom_zone_initial
    for block in blocks:
        kind = block.get("kind")
        html = block.get("html", "")
        if kind == "subhead":
            in_zone = "점검 질문" in html
        else:
            html = strip_cttd(html)
            if in_zone and kind in {"paragraph", "list", "highlight", "quote"}:
                html = rewrite_third_person(html)
        block["html"] = html
    return blocks


def clean_items_html(items, has_gumgeom):
    in_zone = False
    cleaned = []
    for item in items:
        text = item
        if isinstance(text, str):
            if text.startswith("@@subhead@@"):
                title = text[len("@@subhead@@"):]
                in_zone = "점검 질문" in title
                cleaned.append(text)
                continue
            text = strip_cttd(text)
            if in_zone and (text.startswith("@@paragraph@@") or text.startswith("@@list@@") or text.startswith("@@highlight@@") or text.startswith("@@quote@@")):
                # Find body part after marker
                m = re.match(r"^(@@\w+@@)(.*)$", text, flags=re.S)
                if m:
                    text = m.group(1) + rewrite_third_person(m.group(2))
                else:
                    text = rewrite_third_person(text)
        cleaned.append(text)
    return cleaned


def clean_section(section):
    blocks = section.get("blocks") or []
    has_gumgeom = any(
        block.get("kind") == "subhead" and "점검 질문" in block.get("html", "")
        for block in blocks
    )
    section["blocks"] = clean_blocks(blocks)
    items = section.get("itemsHtml")
    if isinstance(items, list):
        section["itemsHtml"] = clean_items_html(items, has_gumgeom)


def clean_issue(issue):
    if isinstance(issue.get("deckHtml"), str):
        issue["deckHtml"] = strip_cttd(issue["deckHtml"])
    if isinstance(issue.get("takeawayHtml"), str):
        issue["takeawayHtml"] = strip_cttd(issue["takeawayHtml"])
    if isinstance(issue.get("sourceTitle"), str):
        issue["sourceTitle"] = strip_cttd(issue["sourceTitle"])
    facts = issue.get("facts") or []
    for fact in facts:
        if isinstance(fact.get("valueHtml"), str):
            fact["valueHtml"] = strip_cttd(fact["valueHtml"])
    for section in issue.get("sections") or []:
        clean_section(section)
    # Top-level (overview) sections
    for section in issue.get("overviewSections") or []:
        clean_section(section)


def clean_magazine_json(path: Path):
    data = json.loads(path.read_text(encoding="utf-8"))
    issues = (data.get("report") or {}).get("issues") or data.get("issues") or []
    for issue in issues:
        clean_issue(issue)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"updated {path}")


def clean_markdown(path: Path):
    if not path.exists():
        return
    text = path.read_text(encoding="utf-8")
    # Strip CTTD references everywhere in markdown.
    text = strip_cttd(text)
    # In 점검 질문 sections, rewrite 우리 lines.
    new_lines = []
    in_zone = False
    for line in text.splitlines():
        stripped = line.lstrip()
        if stripped.startswith("##"):
            in_zone = "점검 질문" in stripped
        if in_zone and "우리" in line and not stripped.startswith("##"):
            line = rewrite_third_person(line)
        new_lines.append(line)
    path.write_text("\n".join(new_lines) + ("\n" if text.endswith("\n") else ""), encoding="utf-8")
    print(f"updated {path}")


if __name__ == "__main__":
    clean_magazine_json(MAGAZINE_JSON)
    clean_markdown(MAGAZINE_REPORT)
