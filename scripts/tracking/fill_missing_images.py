#!/usr/bin/env python3
from __future__ import annotations

import argparse
import html
import json
import re
from html.parser import HTMLParser
from pathlib import Path
from typing import Iterable
from urllib.error import URLError
from urllib.parse import parse_qs, urlencode, urljoin, urlsplit
from urllib.request import Request, urlopen


ISSUE_HEADING_PATTERN = re.compile(r"^#{3,4}\s+\d+(?:-\d+)?\.\s+")
APP_STORE_ID_PATTERN = re.compile(r"/id(\d+)")
URL_PATTERN = re.compile(r"https?://[^\s)]+")
USER_AGENT = "Mozilla/5.0 (compatible; trend-report-image-fill/1.0)"


class ImageMetaParser(HTMLParser):
    def __init__(self, base_url: str) -> None:
        super().__init__()
        self.base_url = base_url
        self.meta_images: list[str] = []
        self.link_images: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attrs_dict = {key.lower(): value or "" for key, value in attrs}
        if tag == "meta":
            meta_key = (attrs_dict.get("property") or attrs_dict.get("name") or attrs_dict.get("itemprop") or "").lower()
            content = attrs_dict.get("content", "").strip()
            if meta_key in {"og:image", "og:image:url", "twitter:image", "twitter:image:src", "image"}:
                self.add_image(content, source="meta")
        elif tag == "link":
            rel = attrs_dict.get("rel", "").lower()
            if "image_src" in rel:
                self.add_image(attrs_dict.get("href", "").strip(), source="link")

    @property
    def images(self) -> list[str]:
        return [*self.meta_images, *self.link_images]

    def add_image(self, value: str, source: str) -> None:
        if not value or value.startswith("data:"):
            return

        image_url = urljoin(self.base_url, html.unescape(value))
        bucket = self.meta_images if source == "meta" else self.link_images
        if image_url.startswith("https://") and image_url not in self.images:
            bucket.append(image_url)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Markdown 리포트/수집 파일의 빈 이미지 URL을 공식 출처 기준으로 채웁니다.")
    parser.add_argument("files", nargs="+", help="이미지를 채울 Markdown 파일")
    parser.add_argument("--dry-run", action="store_true", help="파일을 수정하지 않고 채울 수 있는 항목만 출력합니다.")
    return parser.parse_args()


def fetch_text(url: str, limit: int = 600_000) -> str:
    request = Request(url, headers={"User-Agent": USER_AGENT, "Accept-Language": "ko,en;q=0.8,ja;q=0.7"})
    with urlopen(request, timeout=8) as response:
        charset = response.headers.get_content_charset() or "utf-8"
        return response.read(limit).decode(charset, errors="replace")


def fetch_json(url: str) -> dict[str, object]:
    return json.loads(fetch_text(url))


def app_store_country(url: str) -> str:
    parts = [part for part in urlsplit(url).path.split("/") if part]
    if parts and len(parts[0]) == 2:
        return parts[0].lower()
    return "kr"


def app_store_image(url: str) -> str:
    match = APP_STORE_ID_PATTERN.search(urlsplit(url).path)
    if not match:
        return ""

    query = urlencode({"id": match.group(1), "country": app_store_country(url)})
    lookup_url = f"https://itunes.apple.com/lookup?{query}"
    data = fetch_json(lookup_url)
    results = data.get("results")
    if not isinstance(results, list) or not results:
        return ""

    result = results[0]
    if not isinstance(result, dict):
        return ""

    for key in ("screenshotUrls", "ipadScreenshotUrls", "artworkUrl512", "artworkUrl100"):
        value = result.get(key)
        if isinstance(value, list):
            for item in value:
                if isinstance(item, str) and item.startswith("https://"):
                    return item
        if isinstance(value, str) and value.startswith("https://"):
            return value

    return ""


def meta_image(url: str) -> str:
    document = fetch_text(url)
    parser = ImageMetaParser(url)
    parser.feed(document)
    return parser.images[0] if parser.images else ""


def resolve_image(url: str) -> str:
    if not url:
        return ""

    try:
        if "apps.apple.com" in urlsplit(url).netloc:
            return app_store_image(url) or meta_image(url)
        return meta_image(url)
    except (OSError, UnicodeError, URLError, json.JSONDecodeError):
        return ""


def is_issue_heading(line: str) -> bool:
    return bool(ISSUE_HEADING_PATTERN.match(line.strip()))


def issue_blocks(lines: list[str]) -> Iterable[tuple[int, int]]:
    start: int | None = None
    for index, line in enumerate(lines):
        stripped = line.strip()
        if is_issue_heading(stripped):
            if start is not None:
                yield start, index
            start = index
            continue

        if start is not None and (stripped.startswith("## ") or stripped.startswith("### ")):
            yield start, index
            start = None
    if start is not None:
        yield start, len(lines)


def metadata_lines(block: list[str]) -> Iterable[tuple[int, str]]:
    for index, line in enumerate(block):
        if index > 0 and line.strip().startswith("#### "):
            break
        yield index, line


def field_value(line: str, field: str) -> str:
    prefix = f"- {field}:"
    stripped = line.strip()
    if not stripped.startswith(prefix):
        return ""
    return stripped[len(prefix) :].strip()


def extract_markdown_url(value: str) -> str:
    markdown_link = re.search(r"\[[^\]]+\]\((https?://[^)]+)\)", value)
    if markdown_link:
        return markdown_link.group(1).strip()

    plain_url = URL_PATTERN.search(value)
    return plain_url.group(0).strip() if plain_url else ""


def candidate_urls(block: list[str]) -> list[str]:
    urls: list[str] = []
    preferred_fields = ("출처 URL", "이미지 출처")

    for field in preferred_fields:
        for _, line in metadata_lines(block):
            value = field_value(line, field)
            if not value:
                continue
            url = extract_markdown_url(value)
            if url.startswith("https://") and url not in urls:
                urls.append(url)

    return urls


def platform_name(heading: str) -> str:
    match = re.search(r"\[([^\]]+)\]", heading)
    if match:
        return match.group(1).strip()
    return "서비스"


def fill_block(block: list[str], image_url: str) -> list[str]:
    next_block = list(block)
    image_index = -1
    caption_index = -1
    source_index = -1

    for index, line in metadata_lines(next_block):
        if field_value(line, "출처 URL"):
            source_index = index
        if image_index < 0 and line.strip().startswith("- 이미지:"):
            image_index = index
        if caption_index < 0 and line.strip().startswith("- 이미지 설명:"):
            caption_index = index

    if image_index >= 0:
        next_block[image_index] = f"- 이미지: {image_url}"
    else:
        insert_at = caption_index if caption_index >= 0 else source_index + 1
        next_block.insert(insert_at, f"- 이미지: {image_url}")
        if caption_index >= insert_at:
            caption_index += 1

    if caption_index < 0:
        caption = f"{platform_name(next_block[0])} 공식 원문 이미지"
        next_block.insert((image_index if image_index >= 0 else source_index) + 2, f"- 이미지 설명: {caption}")
    elif not field_value(next_block[caption_index], "이미지 설명"):
        next_block[caption_index] = f"- 이미지 설명: {platform_name(next_block[0])} 공식 원문 이미지"

    return next_block


def fill_caption(block: list[str]) -> list[str]:
    next_block = list(block)
    for index, line in metadata_lines(next_block):
        if line.strip().startswith("- 이미지 설명:") and not field_value(line, "이미지 설명"):
            next_block[index] = f"- 이미지 설명: {platform_name(next_block[0])} 공식 원문 이미지"
            break
    return next_block


def has_blank_caption(block: list[str]) -> bool:
    for _, line in metadata_lines(block):
        if line.strip().startswith("- 이미지 설명:") and not field_value(line, "이미지 설명"):
            return True
    return False


def block_has_image(block: list[str]) -> bool:
    for _, line in metadata_lines(block):
        value = field_value(line, "이미지")
        if value:
            return True
    return False


def update_file(path: Path, dry_run: bool) -> tuple[int, int, list[str]]:
    lines = path.read_text(encoding="utf-8").splitlines()
    replacements: dict[tuple[int, int], list[str]] = {}
    filled_images = 0
    filled_captions = 0
    unresolved: list[str] = []

    for start, end in issue_blocks(lines):
        block = lines[start:end]
        if block_has_image(block):
            if has_blank_caption(block):
                replacements[(start, end)] = fill_caption(block)
                filled_captions += 1
            continue

        urls = candidate_urls(block)
        image_url = ""
        for url in urls:
            image_url = resolve_image(url)
            if image_url:
                break

        if image_url:
            replacements[(start, end)] = fill_block(block, image_url)
            filled_images += 1
        else:
            unresolved.append(block[0].strip())

    if replacements and not dry_run:
        updated: list[str] = []
        cursor = 0
        for (start, end), block in sorted(replacements.items()):
            updated.extend(lines[cursor:start])
            updated.extend(block)
            cursor = end
        updated.extend(lines[cursor:])
        path.write_text("\n".join(updated) + "\n", encoding="utf-8")

    return filled_images, filled_captions, unresolved


def main() -> None:
    args = parse_args()
    total_filled = 0
    total_captions = 0
    total_unresolved: list[str] = []

    for value in args.files:
        path = Path(value)
        filled, captions, unresolved = update_file(path, args.dry_run)
        total_filled += filled
        total_captions += captions
        total_unresolved.extend(f"{path}: {heading}" for heading in unresolved)
        action = "채울 수 있음" if args.dry_run else "채움"
        print(f"{path}: 이미지 {filled}개, 이미지 설명 {captions}개 {action}")

    if total_unresolved:
        print("\n이미지를 찾지 못한 항목:")
        for item in total_unresolved:
            print(f"- {item}")

    if total_filled == 0 and total_captions == 0 and not total_unresolved:
        print("이미지 누락 항목이 없습니다.")


if __name__ == "__main__":
    main()
