// 카드 썸네일/본문 이미지 유틸. App.vue에서 분리.
import { plainText } from "./content.js";

function imageAspectRatio(issue) {
  const seed = Number.parseInt(String(issue.number || "1"), 10) || 1;
  const ratios = [0.72, 0.82, 0.92, 1.05, 1.16, 1.28];
  if (/app store|앱 화면|screenshot|screen/i.test(issue.imageCaption || "")) {
    return seed % 2 === 0 ? 0.74 : 0.82;
  }
  if (/logo|icon|아이콘/i.test(issue.imageCaption || issue.image || "")) {
    return 1;
  }
  return ratios[seed % ratios.length];
}

export function estimateCardHeight(issue) {
  const titleLength = plainText(issue.takeawayHtml).length;
  const deckLength = plainText(issue.deckHtml).length;
  const imageHeight = issue.image ? 320 / imageAspectRatio(issue) : 0;
  return imageHeight + 120 + titleLength * 2.4 + deckLength * 1.15;
}

export function optimizedImageUrl(value = "", width = 900) {
  if (!value) return "";
  try {
    const url = new URL(value);
    const host = url.hostname;
    if (host === "cdn.sanity.io") {
      url.searchParams.set("w", String(width));
      url.searchParams.set("q", "72");
      url.searchParams.set("fit", "max");
      url.searchParams.set("auto", "format");
      return url.href;
    }
    if (host === "images.ctfassets.net") {
      url.searchParams.set("w", String(width));
      url.searchParams.set("q", "80");
      url.searchParams.set("fm", "webp");
      return url.href;
    }
    return value;
  } catch {
    return value;
  }
}

export function capTallThumbnail(event) {
  const image = event.currentTarget;
  const thumb = image.closest(".guide-thumb, .guide-list-thumb");
  if (!thumb || !image.naturalWidth || !image.naturalHeight) return;
  thumb.classList.toggle("is-ratio-capped", image.naturalWidth / image.naturalHeight < 0.75);
}

export function hideBrokenImage(event) {
  const image = event.currentTarget;
  const frame = image.closest(".article-image, .guide-thumb, .guide-list-thumb");
  const listLink = image.closest(".guide-list-card a");
  if (listLink) listLink.classList.remove("has-thumb");
  if (frame) {
    frame.remove();
    return;
  }
  image.remove();
}
