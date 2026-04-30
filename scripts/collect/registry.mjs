// scripts/collect/registry.mjs
// 서비스 레지스트리 — 아티클 platform 매칭 → 공식 사이트/앱/설명 첨부에 사용

export const SERVICE_REGISTRY = {
  // ─── 한국 UIUX 케이스 스터디 매체 ───
  "토스": { name: "토스", website: "https://toss.im", appstoreId: "839333328", description: "통합 금융 서비스. 디자인·UX 케이스 스터디로 유명한 토스팀 블로그 운영." },
  "토스 (Toss) 블로그": { name: "토스 (Toss) 블로그", website: "https://blog.toss.im", description: "토스팀 공식 블로그 — UIUX 개선 사례·디자인 시스템 케이스." },
  "우아한형제들": { name: "우아한형제들", website: "https://woowahan.com", description: "배달의민족 운영. 기술·디자인 블로그에 UI/UX 사례 자주 발행." },
  "우아한형제들 기술블로그": { name: "우아한형제들 기술블로그", website: "https://techblog.woowahan.com", description: "배달의민족 기술·디자인 블로그." },
  "카카오 디자인": { name: "카카오 디자인", website: "https://kakao.design", description: "카카오 디자인팀 공식 블로그 — 서비스 디자인·디자인 시스템 사례." },
  "당근 디자인": { name: "당근 디자인", website: "https://medium.com/daangn", description: "당근(구 당근마켓) 디자인팀 — 로컬 커뮤니티 서비스 UX 케이스." },
  "당근": { name: "당근", website: "https://www.daangn.com", description: "한국 1위 로컬 커뮤니티·중고거래 서비스." },
  "LINE 디자인": { name: "LINE 디자인", website: "https://line.design", description: "LINE 디자인팀 — 글로벌 메신저·콘텐츠 서비스 UX 사례." },
  "라인": { name: "라인 (LINE)", website: "https://linecorp.com", description: "글로벌 메신저·콘텐츠 플랫폼 (네이버 자회사)." },

  // ─── 한국 패션·라이프스타일·커머스 ───
  "무신사": { name: "무신사", website: "https://www.musinsa.com", appstoreId: "504871470", description: "한국 대표 패션 플랫폼 — 스트리트·캐주얼·럭셔리 통합 마켓." },
  "29CM": { name: "29CM", website: "https://shop.29cm.co.kr", appstoreId: "1163428215", description: "취향 기반 라이프스타일 커머스 — 큐레이션·콘텐츠 중심." },
  "W컨셉": { name: "W컨셉", website: "https://www.wconcept.co.kr", appstoreId: "538237042", description: "디자이너·컨템포러리 패션 셀렉트숍." },
  "지그재그": { name: "지그재그", website: "https://zigzag.kr", appstoreId: "944755472", description: "여성 패션 쇼핑몰 모음 앱 — Z세대 중심." },
  "에이블리": { name: "에이블리", website: "https://m.a-bly.com", appstoreId: "1361177404", description: "여성 패션 커머스 — 셀러·인플루언서 기반." },
  "자주": { name: "자주(JAJU)", website: "https://www.jaju.co.kr", appstoreId: "1437893693", description: "신세계 라이프스타일 브랜드 — 의류·홈웨어·생활용품." },
  "JAJU": { name: "자주(JAJU)", website: "https://www.jaju.co.kr", appstoreId: "1437893693", description: "신세계 라이프스타일 브랜드 — 의류·홈웨어·생활용품." },
  "자주(JAJU)": { name: "자주(JAJU)", website: "https://www.jaju.co.kr", appstoreId: "1437893693", description: "신세계 라이프스타일 브랜드 — 의류·홈웨어·생활용품." },
  "쿠팡": { name: "쿠팡", website: "https://www.coupang.com", appstoreId: "454434967", description: "한국 최대 종합 이커머스 — 로켓배송·로켓프레시 운영." },
  "오늘의집": { name: "오늘의집", website: "https://ohou.se", appstoreId: "1029830063", description: "라이프스타일 커머스 — 인테리어 콘텐츠·UGC 결합 쇼핑." },
  "컬리": { name: "컬리", website: "https://www.kurly.com", appstoreId: "1018769995", description: "프리미엄 신선식품 커머스 — 마켓컬리·뷰티컬리 운영." },
  "신세계": { name: "신세계", website: "https://www.shinsegae.com", description: "한국 대표 종합 유통 그룹 — 백화점·이마트·SSG·자주 등." },
  "신세계그룹": { name: "신세계그룹", website: "https://www.shinsegae.com", description: "한국 대표 종합 유통 그룹." },
  "이마트24": { name: "이마트24", website: "https://www.emart24.co.kr", description: "신세계그룹 편의점 브랜드." },
  "스타벅스": { name: "스타벅스 코리아", website: "https://www.starbucks.co.kr", description: "신세계그룹 운영 카페 체인." },
  "배달의민족": { name: "배달의민족", website: "https://www.baemin.com", appstoreId: "378084485", description: "한국 1위 배달 플랫폼 (우아한형제들)." },
  "쿠팡이츠": { name: "쿠팡이츠", website: "https://www.coupangeats.com", appstoreId: "1454432141", description: "쿠팡 배달 서비스." },

  // ─── 한국 플랫폼·콘텐츠 ───
  "네이버": { name: "네이버", website: "https://www.naver.com", appstoreId: "393499958", description: "한국 최대 검색·콘텐츠 플랫폼." },
  "카카오톡": { name: "카카오톡", website: "https://www.kakao.com", appstoreId: "362057947", description: "한국 1위 메신저 (카카오)." },
  "카카오": { name: "카카오", website: "https://www.kakaocorp.com", description: "메신저·콘텐츠·핀테크·모빌리티 플랫폼 그룹." },
  "토스": { name: "토스", website: "https://toss.im", appstoreId: "839333328", description: "통합 금융 서비스 (비바리퍼블리카)." },

  // ─── 글로벌 AI·테크 ───
  "OpenAI": { name: "OpenAI", website: "https://openai.com", description: "ChatGPT·DALL·E·Sora 등 AI 모델 개발사." },
  "Anthropic": { name: "Anthropic", website: "https://www.anthropic.com", description: "Claude AI 모델 개발사 — Constitutional AI 접근법." },
  "Figma": { name: "Figma", website: "https://www.figma.com", description: "협업 기반 인터페이스 디자인 도구." },
  "Adobe": { name: "Adobe", website: "https://www.adobe.com", description: "크리에이티브 소프트웨어 — Photoshop·Illustrator·Firefly." },
  "Dropbox": { name: "Dropbox", website: "https://www.dropbox.com", description: "클라우드 파일 동기화·협업 도구." },
  "Salesforce": { name: "Salesforce", website: "https://www.salesforce.com", description: "엔터프라이즈 CRM·Slack 운영." },
  "Salesforce × Google Cloud": { name: "Salesforce", website: "https://www.salesforce.com", description: "엔터프라이즈 CRM·Slack 운영." },
  "Spotify": { name: "Spotify", website: "https://www.spotify.com", description: "글로벌 음원·팟캐스트 스트리밍." },
  "Spotify × Anthropic": { name: "Spotify", website: "https://www.spotify.com", description: "글로벌 음원·팟캐스트 스트리밍." },
  "네이버 × Criteo": { name: "Criteo", website: "https://www.criteo.com", description: "프랑스 기반 글로벌 광고 테크 — 다이내믹 리타겟팅." },

  // ─── 리서치·미디어 ───
  "Nielsen Norman Group": { name: "Nielsen Norman Group", website: "https://www.nngroup.com", description: "Jakob Nielsen·Don Norman 설립 UX 리서치 컨설팅." },
  "Smashing Magazine": { name: "Smashing Magazine", website: "https://www.smashingmagazine.com", description: "프론트엔드·UX 디자인 매거진." },
  "DIGITAL iNSIGHT": { name: "DIGITAL iNSIGHT", website: "https://ditoday.com", description: "디지털 마케팅·UIUX·서비스 한국 매체." },
  "오픈서베이": { name: "오픈서베이", website: "https://www.opensurvey.co.kr", description: "한국 모바일 리서치 플랫폼." },
  "CJ메조미디어": { name: "CJ메조미디어", website: "https://www.mezzomedia.co.kr", description: "CJ ENM 자회사 디지털 광고 미디어렙." },
  "Dev.to": { name: "Dev.to", website: "https://dev.to", description: "개발자 커뮤니티·블로그 플랫폼." },
  "CSS-Tricks": { name: "CSS-Tricks", website: "https://css-tricks.com", description: "CSS·프론트엔드 테크닉 매체 (DigitalOcean 인수)." },
  "web.dev": { name: "web.dev", website: "https://web.dev", description: "Google 운영 웹 표준·성능 가이드." },
  "JavaScript Weekly": { name: "JavaScript Weekly", website: "https://javascriptweekly.com", description: "Cooperpress 운영 JS 주간 뉴스레터." },
  "European Union": { name: "European Union", website: "https://european-union.europa.eu", description: "EU 공식 채널 — Accessibility Act(EAA) 등 규정." },
};

/**
 * Platform 이름으로 서비스 검색 — exact, case-insensitive, partial match
 * @param {string} platform
 * @returns {Object|null}
 */
export function findService(platform) {
  if (!platform) return null;
  if (SERVICE_REGISTRY[platform]) return SERVICE_REGISTRY[platform];
  const lp = platform.toLowerCase().trim();
  for (const [k, v] of Object.entries(SERVICE_REGISTRY)) {
    if (k.toLowerCase() === lp) return v;
  }
  for (const [k, v] of Object.entries(SERVICE_REGISTRY)) {
    if (lp.includes(k.toLowerCase()) || k.toLowerCase().includes(lp)) return v;
  }
  return null;
}
