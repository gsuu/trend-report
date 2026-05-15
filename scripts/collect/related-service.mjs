// scripts/collect/related-service.mjs
// 아티클의 platform과 매칭되는 서비스를 찾아 issue.sections에 정보 섹션 추가

import { findService } from "./registry.mjs";

/**
 * issue에 '관련 서비스 정보' 섹션을 추가 (in-place)
 * @param {Object} issue
 * @returns {boolean} attached?
 */
export function attachRelatedService(issue) {
  const svc = findService(issue.originalPlatform || issue.platform);
  if (!svc) return false;

  // 이미 같은 섹션이 있으면 skip
  if (issue.sections?.some((s) => s.title === "관련 서비스 정보")) return false;

  const blocks = [];

  if (svc.description) {
    blocks.push({ kind: "list", html: `<strong>${escapeHtml(svc.name)}</strong> — ${escapeHtml(svc.description)}` });
  }
  if (svc.website) {
    blocks.push({
      kind: "list",
      html: `공식 사이트: <a href="${svc.website}" target="_blank" rel="noopener">${escapeHtml(svc.website)}</a>`,
    });
  }
  if (svc.appstoreId) {
    const appUrl = `https://apps.apple.com/kr/app/id${svc.appstoreId}`;
    blocks.push({
      kind: "list",
      html: `iOS 앱: <a href="${appUrl}" target="_blank" rel="noopener">App Store에서 보기</a>`,
    });
  }

  if (!blocks.length) return false;

  issue.sections = issue.sections || [];
  issue.sections.push({
    title: "관련 서비스 정보",
    className: "article-section is-related-service",
    prose: false,
    blocks,
  });
  return true;
}

function escapeHtml(s = "") {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
