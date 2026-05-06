"""Refresh broken image URLs in public/data/magazine.json.

For each issue, HEAD-check the image URL. If unreachable or non-image, re-extract
og:image from the source URL, then fall back to platform-domain candidates.

Adds a "관련 서비스: <platform>" marker to issue.sourceTitle when a fallback is used.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path
from urllib.error import URLError, HTTPError
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts" / "tracking"))

from fill_missing_images import (  # noqa: E402
    ImageMetaParser,
    PLATFORM_FALLBACK_DOMAINS,
    USER_AGENT,
    app_store_image,
    fetch_text,
    resolve_image,
)

MAGAZINE_JSON = ROOT / "public" / "data" / "magazine.json"

CONTENT_TYPES_OK = ("image/jpeg", "image/png", "image/gif", "image/webp", "image/avif", "image/svg+xml")


def head_check(url: str, timeout: float = 6.0) -> tuple[bool, str]:
    """Return (is_image, content_type). is_image=True if HEAD/GET shows an image content type."""
    if not url or not url.startswith("https://"):
        return False, ""
    try:
        request = Request(url, method="HEAD", headers={"User-Agent": USER_AGENT, "Accept": "image/*,*/*;q=0.5"})
        with urlopen(request, timeout=timeout) as response:
            ctype = (response.headers.get_content_type() or "").lower()
            if ctype.startswith("image/"):
                return True, ctype
            # Some servers do not support HEAD properly; retry with GET (range)
    except (URLError, HTTPError, OSError):
        pass
    try:
        request = Request(url, headers={"User-Agent": USER_AGENT, "Accept": "image/*,*/*;q=0.5", "Range": "bytes=0-256"})
        with urlopen(request, timeout=timeout) as response:
            ctype = (response.headers.get_content_type() or "").lower()
            return ctype.startswith("image/"), ctype
    except (URLError, HTTPError, OSError):
        return False, ""


def candidate_image_urls(issue: dict) -> list[tuple[str, str]]:
    """Return (url, label) candidates: primary 출처 URL, then platform fallbacks."""
    candidates: list[tuple[str, str]] = []
    seen: set[str] = set()
    primary = (issue.get("sourceUrl") or "").strip()
    if primary.startswith("https://"):
        candidates.append((primary, "primary"))
        seen.add(primary)
    platform = issue.get("platform") or ""
    for fallback in PLATFORM_FALLBACK_DOMAINS.get(platform, []):
        if fallback not in seen:
            candidates.append((fallback, platform))
            seen.add(fallback)
    return candidates


def refresh_image(issue: dict) -> tuple[str, str] | None:
    """Return (new_image_url, related_service_label) or None if nothing better was found."""
    for url, label in candidate_image_urls(issue):
        new_image = resolve_image(url)
        if not new_image:
            continue
        ok, _ = head_check(new_image)
        if not ok:
            continue
        related = "" if label == "primary" else label
        return new_image, related
    return None


def update_issue(issue: dict) -> bool:
    """Returns True if the issue's image was changed."""
    image = (issue.get("image") or "").strip()
    if image:
        ok, _ = head_check(image)
        if ok:
            return False
    refreshed = refresh_image(issue)
    if not refreshed:
        return False
    new_image, related = refreshed
    issue["image"] = new_image
    if related and not (issue.get("imageCaption") or "").strip():
        issue["imageCaption"] = f"{related} 공식 사이트 이미지 (관련 서비스)"
    if related:
        existing_source = (issue.get("sourceTitle") or "").strip()
        marker = f"관련 서비스: {related}"
        if marker not in existing_source:
            issue["sourceTitle"] = f"{existing_source} / {marker}" if existing_source else marker
    return True


def main(argv: list[str]) -> int:
    issue_filter = argv[1] if len(argv) > 1 else None
    data = json.loads(MAGAZINE_JSON.read_text(encoding="utf-8"))
    issues = data["report"]["issues"]
    target = [i for i in issues if not issue_filter or i.get("issueSlug") == issue_filter]
    print(f"Checking {len(target)} issues" + (f" in {issue_filter}" if issue_filter else ""))
    refreshed = 0
    failed = []
    for issue in target:
        try:
            changed = update_issue(issue)
        except Exception as exc:  # pragma: no cover - exploratory script
            failed.append((issue.get("number"), str(exc)))
            continue
        if changed:
            refreshed += 1
            print(f"  refreshed [{issue.get('number')}] {issue.get('platform')} -> {issue['image'][:80]}")
    if refreshed:
        MAGAZINE_JSON.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(f"updated {MAGAZINE_JSON}: {refreshed} issue(s)")
    else:
        print("no changes")
    if failed:
        print("\nfailed checks:")
        for number, msg in failed:
            print(f"  - {number}: {msg}")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
