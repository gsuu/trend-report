# TF Leader 외부 벤치마크 (2026-05-27)

> 시니어 3명이 ★ 매긴 5건(디자인 2 / 퍼블리싱 2 / 기획 1)을 외부와 직접 비교. WebSearch 7회 / WebFetch 8개 본문 확인.

## 한 줄 종합

5건 중 **우리 우월 3건 / 외부 보완 2건 / 외부 대체 0건**. 사이트 자체의 *비주얼 결정*과 *한국 라이브 정책*은 외부 후보가 따라오지 못했고, 코드 신기능 두 건(sibling-index·Gap Decorations)은 외부 글 *한 두 편이 같이 인용되면 글이 더 단단해진다* 수준.

---

## 비교 결과

### 1. references/design.md #2 — Any Given Moment (다이얼 회전 네비)

- **우리 (현재)**: [Hover States 2026-05-17 feature 인용](https://www.anygivenmoment.co/) — Chanel·Guerlain·Prada·L'Oréal·Kenzo·Byredo 럭셔리 캠페인 프로덕션 사이트가 *다이얼 회전 네비*로 인덱싱.
- **외부 후보 1**: [Awwwards 'Basic Agency portfolio navigation' 컬렉션](https://www.awwwards.com/inspiration/basic-agency-portfolio-navigation) — 일반 에이전시 포트폴리오 네비 모음. 대부분 풀스크린 슬라이드·드로어·하이라이트 그리드. 다이얼·로터리 네비는 없음.
- **외부 후보 2**: [VMGROUPE — Tom Ford Beauty / L'Oréal Paris / Alexander McQueen 작업하는 NYC 럭셔리 에이전시](https://vmgroupe.com/) — 같은 럭셔리 뷰티·패션 캠페인 분야 톱 에이전시인데 *그리드 기반 포트폴리오*로 가고 다이얼 같은 인덱싱 메카닉 없음. CGI·3D 렌더링 자랑이 차별점.
- **외부 후보 3**: [Anne of Carversville — 30 Newest Global Fashion Luxury Ad Campaigns](https://anneofcarversville.com/fashion/new-ad-campaigns-runway) — 캠페인 콘텐츠 큐레이션, 사이트 네비 디자인 관점은 X.
- **판정**: **우리가 더 좋다**
- **사유**: 같은 럭셔리 뷰티 캠페인 카테고리에서 *그리드·캐러셀이 아닌 새 인덱싱 메카닉*을 보여주는 사이트를 외부에서 못 찾았다. VMGROUPE 같은 NYC 톱 에이전시조차 그리드. CTTD가 무신사·올리브영·W Concept 뷰티 캠페인 페이지를 *시계 다이얼/카메라 다이얼 코드*로 풀자고 제안할 때 다이얼 네비는 *국내에 처음 던지는* 수준의 단독 레퍼런스가 맞다.
- **실행 권고**: 이번 호 그대로. ★ 유지.

---

### 2. references/design.md #5 — Bécane Paris (여성 모터사이클 D2C)

- **우리 (현재)**: [Hover States 2026-05 feature 인용](https://www.becaneparis.com/) — *"기술적·보호적·당당한 페미닌"*, 14제품·4스토리 카운터, 3D 프레임 뷰어.
- **외부 후보 1**: [STELLAR Moto Brand — 여성 라인 (Carbon·Twilight·Deep Space·Sunset)](https://www.stellarmotobrand.com/collections/womens) — 프리미엄 D2C 포지셔닝 명확, "armored jeans, jackets, coveralls that fuse real protection with bold fashion". 천체 네이밍(Zenith·Stratosphere·Velocity), DYNEEMA®·SAS-TEC® 강조. *제품 라인업과 브랜딩 톤*은 Bécane만큼 단단함.
- **외부 후보 2**: [REV'IT! — Heritage Innovation Collection for Women](https://revitsport.com/en-us/pages/the-heritage-innovation-collection-for-women) — *"It's not just about taking a men's piece and sizing it down"* 명시, 여성 디자이너·앰배서더, 카페 레이서 헤리티지 + 모던 프로텍션. 마케팅 카피 결.
- **외부 후보 3**: [Pando Moto Women](https://pandomoto.com/collections/women) — 기술적 인증(CE LEVEL AAA/AA) 강조, 그러나 *유틸리테리언 일반 이커머스*에 가까움. 여성 라인이 따로 디자인된 게 아니라 같은 톤.
- **판정**: **외부 보완** (대체 아님)
- **사유**: STELLAR과 REV'IT!은 *여성 모터사이클 프로텍션을 페미닌 코드로 재해석*한다는 점에서 Bécane과 같은 결을 가진다. 차이는 *사이트 인터랙션* — Bécane은 3D 프레임 뷰어 + 오케스트레이션 전환으로 *사이트 자체가 캠페인*인데, STELLAR/REV'IT!은 표준 D2C 그리드. CTTD가 한국 여성 아웃도어·테크웨어 클라이언트 제안할 때 *브랜딩 톤 케이스 풀*은 STELLAR·REV'IT!이 더 크고, *사이트 인터랙션 모델*은 Bécane이 앞선다.
- **실행 권고**: Bécane 그대로 두되, 매거진 본문에 *"같은 카테고리에서 브랜딩 톤 케이스로는 STELLAR Moto Brand(천체 컬러 네이밍)와 REV'IT! Heritage(여성 디자이너 주도) 두 사례가 더 있다"*고 보조 인용 추가.

---

### 3. references/dev.md #1 — CSS sibling-index() / sibling-count()

- **우리 (현재)**: [Smashing Magazine 2026-05-21 + CodePen Durgesh Pawar 데모](https://www.smashingmagazine.com/2026/05/mathematical-layouts-sibling-index-sibling-count/) — staggered/원형/탭 균등분배/카드 부채 4패턴 + iOS Safari 26.2 지원 노트.
- **외부 후보 1**: [MDN — sibling-index() Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/sibling-index) — 1차 사양 문서. 인용 가치 1순위 (Smashing 글이 못 주는 *정확한 사양*).
- **외부 후보 2**: [Thoughtbot — Trimming our CSS with sibling-index and sibling-count](https://thoughtbot.com/blog/trimming-our-css-with-sibling-index-and-sibling-count) — *실제 프로덕션 사례*(thoughtbot.com 케이스 스터디 페이지의 로고 마퀴) + `prefers-reduced-motion` 접근성 고려. Smashing 패턴이 *합성 데모*인 데 비해 *실제 프로덕션 코드 리팩토링 사례*.
- **외부 후보 3**: [CSS-Tricks Almanac — sibling-index() / sibling-count()](https://css-tricks.com/almanac/functions/s/sibling-index/) — 알마낙 표준 참조. 깊이는 얕음.
- **판정**: **외부 보완** (대체 아님)
- **사유**: 우리 ★는 *iOS Safari 26.2 stable + 한국 모바일 90% 커버* 같은 *한국 컨텍스트 적용성*과 *4가지 패턴(staggered/원형/탭/부채)*에서 외부보다 풍부하다. 다만 *프로덕션 적용 검증* 측면에서 thoughtbot의 마퀴 리팩토링 사례가 강력하다 — "이미 누가 production에 썼다"는 신뢰가 카카오·토스 퍼블리셔에게 결정적. MDN도 사양 인용 표준.
- **실행 권고**: 매거진 본문에 *"이미 프로덕션 적용 사례: thoughtbot 케이스 스터디 페이지 로고 마퀴 리팩토링"* + *"공식 사양: MDN sibling-index()"* 두 보조 링크 추가.

---

### 4. references/dev.md #2 — CSS Gap Decorations (column-rule / row-rule)

- **우리 (현재)**: [Chrome blog 2026-05-15 + Microsoft Edge Demos 14개](https://microsoftedge.github.io/Demos/css-gap-decorations/dashboard-grid.html) — 대시보드·플레이그라운드·14개 데모 + Safari/Firefox 미지원 명시 + `@supports` 분기 권고.
- **외부 후보 1**: [W3C CSS Gap Decorations Module Level 1 사양](https://www.w3.org/TR/css-gaps-1/) — 1차 사양. `rule-break`·`rule-outset`·`gap-rule-paint-order` 같은 고급 속성 디테일 정확히 인용 가능.
- **외부 후보 2**: [Chrome for Developers — Gap decorations: Now available in Chromium (stable)](https://developer.chrome.com/blog/gap-decorations-stable) — Chrome/Edge 149+ stable 공식 공지. 우리 ★가 이미 인용.
- **외부 후보 3**: [CSS-Tricks — The Gap Strikes Back: Now Stylable](https://css-tricks.com/the-gap-strikes-back-now-stylable/) — 패턴 소개. 단, Safari/Firefox fallback 코드는 *제공 X* (CSS-Tricks도 부재).
- **외부 후보 4**: [modern-css.com — Grid Dividers without borders or pseudo-elements](https://modern-css.com/grid-dividers-without-borders-or-pseudo-elements/) — *"Limited availability 40% global usage" + "Not ready for production without a fallback"* 명시. 우리와 동일 톤.
- **판정**: **우리가 더 좋다**
- **사유**: 외부 글들이 *모두 fallback 코드를 안 준다*. CSS-Tricks조차 "Chromium-only"만 언급하고 폴백 코드 없음. 우리 ★는 *"Safari/Firefox 미지원 — iOS Safari 사용자가 절반인 한국 모바일 웹은 fallback 필수, `@supports (column-rule: 1px solid)` 분기 또는 기존 `gap` + `::after` border 패턴 병행"* 까지 명시. *한국 모바일 iOS 50% 환경*에서 이건 결정적 차이.
- **실행 권고**: 이번 호 그대로. ★ 유지. W3C 사양 링크만 보조 인용으로 추가하면 *공식 사양 디테일*까지 자급.

---

### 5. references/service.md #3 — 무신사·29CM 회원제 개편 (등급 강등 3개월 유예 자동)

- **우리 (현재)**: [무신사 뉴스룸 2025-06-02 공식 발표](https://newsroom.musinsa.com/newsroom-menu/2025-0602) — VVIP 등급 신설 + O2O 등급 통합 + **강등 유예 3개월 자동 적용**. 별도 신청 없이 시스템이 강등 대상 감지.
- **외부 후보 1**: [디지털데일리 2025-06-02](https://m.ddaily.co.kr/page/view/2025060207592650104) — 같은 발표 보도, 사실 추가 없음.
- **외부 후보 2**: [패션인사이트 — 무신사·29CM 회원제 업그레이드](https://www.fi.co.kr/main/view.asp?idx=86050) — 산업 시점 분석, 디테일 동일.
- **외부 후보 3**: [올리브영 멤버스 페이지](https://www.oliveyoung.co.kr/store/main/getMembership.do) — 승급주기 6→1개월 단축은 있으나 *강등 유예 자동 적용은 발표·운영 사례 없음*.
- **외부 후보 4**: [SSG.com — Ssac Seven Club (2026 신규 유료 멤버십)](https://www.thepublic.kr/news/articleView.html?idxno=287420) — 새 유료 멤버십이지만 *강등 유예 자동 정책*은 X.
- **판정**: **우리가 더 좋다**
- **사유**: 검색 결과 한국 이커머스 멤버십 정책 글 10여 건 중 *강등 유예 3개월 자동 적용*을 자기 정책으로 발표·운영한 곳은 무신사·29CM 외 발견 안 됨. 무신사 공식 본문에 *"기존에 없던 신규 정책"*이라 명시. 올리브영·CJ ONE·SSG·11번가·쿠팡 PM 회의에 들고 갈 *한국 라이브 정책 유일 사례*라는 우리 ★의 판정이 사실로 확인됨.
- **실행 권고**: 이번 호 그대로. ★ 유지. 매거진 본문에 *"한국 이커머스 중 강등 유예 자동 적용을 정책으로 발표·운영한 첫 사례 (2026-05 현재 검색 기준)"* 한 줄 단언 추가 권장.

---

## 영역별 종합

### 디자인 카테고리

- **외부 매체 강점 발견**: 럭셔리 뷰티·패션 캠페인 분야는 *콘텐츠 큐레이션 매체(Anne of Carversville·BoF·FashionNetwork)*는 풍부하나 *사이트 인터랙션·네비 메카닉 글*은 Hover States·Awwwards 외 약함. 우리 design-reference-scout가 *Hover States 60% + Awwwards/Siteinspire/Lapa 40%* 비중을 더 끌어올린 것이 정답에 가깝다.
- **추가할 만한 채널 후보**: STELLAR Moto Brand·REV'IT! Heritage Collection 같은 *브랜드 자사 캠페인 페이지*를 references 추가 후보로. 갤러리 큐레이션 매체 의존을 깨는 보강.

### 퍼블리싱 카테고리

- **외부 매체 강점 발견**: CSS 신기능 카테고리는 *Smashing 외*에 MDN(사양), thoughtbot(프로덕션 사례), CSS-Tricks(알마낙), Chrome for Developers(공식 공지) 4갈래로 항상 갖춰진다. 우리 dev-reference-scout가 *Smashing·Codrops·Chrome blog 3매체 의존*인데 thoughtbot 같은 *프로덕션 케이스 스터디 매체*는 약하다.
- **추가할 만한 채널 후보**: `news-tracking/dev-sources.json`에 thoughtbot 블로그·CSS-Tricks 알마낙·MDN 신기능 페이지 추가. *프로덕션 적용 사례*를 보조 인용으로 항상 같이 묶는 패턴 정착.

### 기획 카테고리

- **외부 매체 강점 발견**: 한국 라이브 정책 사례는 *발표·운영 시점에 한국 매체가 모두 동시 인용*하는 구조. 외부 매체 추가 필요성 낮다. 다만 *글로벌 멤버십 정책 변화*(Sephora Beauty Insider·Nordstrom Nordy Club·Macy's Star Rewards 등) 같은 *비교 대상*은 references/service.md에 부족.
- **추가할 만한 채널 후보**: 글로벌 뷰티·패션 멤버십 정책 변경 트래킹용 BoF·Retail Dive·Glossy 추가. 한국 PM이 *"올리브영도 강등 유예 자동 적용할까"* 결정할 때 *글로벌 비교 사례*가 같이 있어야 단단해진다.

---

## 다음 회차 시스템 제안

1. **dev-sources.json에 thoughtbot 블로그·MDN 신기능 페이지 추가** — Smashing·Codrops·Chrome blog 3매체 의존을 깨고 *프로덕션 케이스 스터디·공식 사양*을 항상 보조 인용으로 묶는 패턴. 다음 dev reference 보고서부터 ★ 항목마다 *프로덕션 사례 1개 + 공식 사양 1개*를 최소 인용 단위로.

2. **service-sources.json에 글로벌 뷰티·패션 멤버십 정책 매체 추가 (BoF·Retail Dive·Glossy)** — 한국 라이브 정책 사례를 ★로 올릴 때 *글로벌 비교*가 같은 매거진에 같이 들어가야 PM 회의 결정 도구가 됨. 강등 유예·O2O 등급 통합 같은 정책은 *Sephora·Nordstrom의 동일 정책이 있는지 없는지*가 의사결정의 절반.

3. **design references에 브랜드 자사 캠페인 페이지 발견 경로 보강** — Hover States·Awwwards 큐레이션 매체에만 의존하지 말고, 분기별 *카테고리별 자사 사이트 직접 탐색*(이번 회차의 STELLAR·REV'IT! 발견처럼) 라운드 추가. design-reference-scout v3 안건.

---

## 마지막 보고

5건 평가 — **우리 우월 3건 (Any Given Moment 다이얼 네비 · CSS Gap Decorations · 무신사 강등 유예 자동) / 외부 보완 2건 (Bécane Paris · sibling-index) / 외부 대체 0건**. 가장 강한 외부 발견은 **thoughtbot의 sibling-index 프로덕션 케이스 스터디 (자사 마퀴 리팩토링)** — Smashing의 합성 데모와 달리 *실제 production 적용 코드*라 한국 퍼블리셔에게 결정적 신뢰 신호가 된다. 가장 강한 우리 우월은 **CSS Gap Decorations** — CSS-Tricks·modern-css.com조차 *fallback 코드를 안 주는데* 우리 ★는 iOS Safari 50% 환경 fallback 분기까지 명시해 한국 모바일 컨텍스트에서 단단함. 다음 회차 적용 권고 한 줄 — *dev 항목마다 "프로덕션 사례 1개 + 공식 사양 1개"를 보조 인용으로 묶고, service 한국 정책 항목에 글로벌 비교 1개를 항상 같이 붙이는 인용 표준* 도입.
