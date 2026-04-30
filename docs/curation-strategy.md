# 큐레이션 전략

이 문서는 매거진 회차별 큐레이션 폭과 깊이를 유지하기 위한 운영 가이드입니다. 자동 수집([news-tracking/*.json](../news-tracking/))과 수동 모니터링이 어떻게 분담되는지, 한국 서비스/디자인 콘텐츠를 어떻게 발굴하는지 정리합니다.

[docs/magazine-writing-standard.md](magazine-writing-standard.md)의 자체 완결 요약·잠금 소제목 셋 표준을 함께 따릅니다.

## 자동 수집 한계와 수동 모니터링이 필요한 이유

자동 수집은 RSS·페이지 스크래핑에 의존하기 때문에 다음 영역에서 누락이 발생합니다.

- **한국 PR 뉴스룸 노이즈**: 무신사·쿠팡·신세계·컬리 등 뉴스룸은 캠페인·콜라보·매장 오픈 보도가 압도적으로 많고, 실제 화면·플로우 변화가 직접 확인되는 항목은 일부에 그칩니다.
- **RSS 미지원 한국 디자인 블로그**: pxd·디자인스펙트럼·카카오 디자인·라인 디자인 등은 RSS가 누락되거나 별도 URL을 쓰는 경우가 많아 자동 수집이 놓칩니다.
- **한국 앱 릴리즈 노트**: App Store / Google Play 릴리즈 노트는 가장 신호 강도가 높은 UIUX 변화 출처지만 RSS로 노출되지 않습니다.
- **공식 컨퍼런스 영상 설명란**: TOSS Slash·SK SLASH·NAVER DEVIEW·KakaoTech Conference 등의 발표 자료는 영상 페이지에 설명/슬라이드 링크 형태로 존재하지만 RSS가 없습니다.

따라서 매주 회차마다 **자동 수집 결과 + 수동 monitoring 체크리스트** 두 축으로 큐레이션합니다.

## 자동 수집 소스 ([news-tracking/](../news-tracking/))

### Service ([service-sources.json](../news-tracking/service-sources.json))

| 소스 | 유형 | 특성 |
|------|------|------|
| 신세계그룹/쿠팡/컬리/오늘의집/네이버 뉴스룸 | RSS | PR 위주, 캠페인 비중 높음 — 화면 변화 항목만 채택 |
| 무신사·CJ올리브영·카카오·당근·야놀자 보도자료 | 페이지 스크랩 | 같음 |
| Spotify Newsroom | RSS | 글로벌 통합 UX·AI 협업 사례 자주 |
| 토스 테크 (toss.tech) | RSS | 핀테크·내부 도구 UX 사례 (백엔드 글은 제외 패턴) |
| 우아한형제들 기술블로그 | RSS | 배달의민족 화면·플로우·프론트엔드 사례 |
| 오픈서베이 블로그 | RSS | 한국 소비 행동 리서치 |

### Design ([design-sources.json](../news-tracking/design-sources.json))

Design 3축 — 한국 UIUX 사례 / 글로벌 시각 표현·UX 패턴 / 디자인 도구·시스템 (디자이너 워크플로우)

| 소스 | 유형 | 특성 |
|------|------|------|
| DIGITAL iNSIGHT, pxd story, 디자인스펙트럼, Design Compass, DesignDB | RSS / 페이지 | 한국 UIUX 매거진 |
| 토스 디자인, 카카오 디자인, 라인 디자인, 삼성 디자인 | 페이지 | 한국 서비스의 디자인 케이스 |
| Awwwards, Siteinspire, Lapa Ninja, Cosmos | 페이지 | 글로벌 웹·랜딩·인스피레이션 |
| Mobbin, Page Flows | 페이지 | 모바일 앱 UX 패턴 |
| It's Nice That, The Brand Identity, Brand New, Muzli, Fonts In Use, Typewolf | 페이지 / RSS | 브랜드·타이포·시각 트렌드 |
| Smashing UX, NN/g, Figma DS, Into Design Systems | RSS / 페이지 | UX 가이드·디자인 시스템 거버넌스 |
| Figma Releases, Adobe Blog, Framer Updates, Webflow Blog, Canva Newsroom | RSS / 페이지 | 디자이너 워크플로우 도구 |

### DEV ([dev-sources.json](../news-tracking/dev-sources.json))

DEV 4축 — 프론트엔드 표준·브라우저 / UIUX 구현·접근성 / AI 코딩·도구 / 디자인 시스템 자동화

| 소스 | 유형 | 특성 |
|------|------|------|
| GeekNews | RSS | 한국 개발자 큐레이션 (프론트엔드/AI 신호 강함) |
| Frontend Focus, CSS Weekly, JavaScript Weekly | RSS | 글로벌 큐레이션 뉴스레터 |
| Smashing Magazine, CSS-Tricks, web.dev, Frontend Masters | RSS / 페이지 | 가이드·실무 글 |
| WebKit Blog, MDN Blog, Chrome for Developers | RSS / 페이지 | 브라우저·표준 릴리즈 |
| Vercel, Astro, React, Svelte | RSS | 프론트엔드 프레임워크 공식 |
| Anthropic, OpenAI, GitHub Copilot/Changelog, Cursor, v0, Replit | RSS / 페이지 | AI 코딩 도구 |
| Storybook, shadcn/ui releases, Builder.io | RSS / 페이지 | 디자인 시스템 자동화 |
| Sara Soueidan, Adrian Roselli, Scott O'Hara, A11y Project, Deque | RSS | 접근성 |
| Naver D2, KakaoEnt FE, Line Engineering KR | RSS | 한국 프론트엔드 블로그 |

## 수동 monitoring 체크리스트

자동 수집이 놓치기 쉬운 영역은 매주 직접 둘러봅니다.

### Service (한국)

- **앱스토어 릴리즈 노트**: 무신사·당근·토스·쿠팡·카카오톡·네이버·올리브영·컬리·11번가의 직전 1주 업데이트 (앱스토어/구글플레이 직접)
- **토스 디자인 콘텐츠**: [toss.im/design](https://toss.im/design) 또는 [디자인스펙트럼](https://designspectrum.org/)
- **카카오 페이/카카오뱅크 공지사항**: [카카오페이 공지](https://www.kakaopay.com/notice), [카카오뱅크 공지](https://www.kakaobank.com/notice)
- **네이버페이/네이버 검색 블로그**: [네이버페이 공지](https://order.pay.naver.com/notice), [네이버 검색 블로그](https://blog.naver.com/naver_search)

### Design (한국)

- **카카오 디자인**: [브런치 카카오 디자인](https://brunch.co.kr/@kakaoit) 또는 디자인 인사이트 카테고리
- **라인 디자인**: [라인 디자인 블로그](https://design.linecorp.com/)
- **토스 디자인 스펙트럼**: [designspectrum.org](https://designspectrum.org/)
- **우아한형제들 디자인**: 우아한형제들 기술블로그 안 디자인 카테고리
- **PUBLY**: 회원 콘텐츠지만 핵심 사례 글이 자주 나옴

### DEV (한국·글로벌)

- **카카오엔터 FE**: [tech.kakaoent.com](https://tech.kakaoent.com/)
- **네이버 D2**: [d2.naver.com](https://d2.naver.com/)
- **네이버 FE News**: [github.com/naver/fe-news](https://github.com/naver/fe-news)
- **라인 엔지니어링**: [engineering.linecorp.com](https://engineering.linecorp.com/ko/blog/)
- **Astro Blog**: [astro.build/blog](https://astro.build/blog/)
- **Frontend Masters Blog**: [frontendmasters.com/blog](https://frontendmasters.com/blog/)

## 큐레이션 폭 목표

매 회차에서 영역별 최소 채택 목표와 카테고리 분포를 함께 봅니다. 회차마다 모두 채울 필요는 없지만, 한 카테고리에 몰리지 않게 합니다.

| 영역 | 목표 항목 수 | 카테고리 분포 가이드 |
|------|------|------|
| Service | 3-5 | platform / fintech / ecommerce / fashion / beauty / book_content / department_store / ai / etc 중 3개 이상 |
| Design | 2-4 | web_reference / visual_trend / brand_expression / layout_pattern / motion_interaction / practical_skill / system / method 중 2개 이상 |
| DEV | 3-5 | HTML/CSS / JavaScript / Accessibility / Performance / Design Systems / AI Tools / Others 중 3개 이상 |
| 합계 | 8-14 | — |

채택 안 하더라도 모니터링한 후보는 `magazine-report.md`의 `## 수집했지만 제외한 것` 섹션에 사유와 함께 남겨, 다음 회차 작성자가 같은 후보를 다시 검토할 수 있게 합니다.

## 큐레이션 결과의 품질 기준

[magazine-writing-standard.md](magazine-writing-standard.md)의 **자체 완결 요약 원칙**과 **잠금 소제목 셋**이 모든 채택 항목에 동일하게 적용됩니다. 카테고리 폭이 넓어져도 글마다의 톤·구조는 같아야 매거진 전체가 한 호흡으로 읽힙니다.

운영 메모([editorial-style-guide.md](editorial-style-guide.md)의 제외 기준)도 함께 적용해, 화면·플로우·정책 변화가 원문에서 직접 확인되지 않는 후보는 제외합니다. 수집 폭을 넓히는 목적은 채택 건수 증가가 아니라 카테고리 다양성 확보입니다.
