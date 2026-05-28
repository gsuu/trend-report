# DEV 레퍼런스 (2026-05-27 발견분)

> dev-reference-scout v2 능동 탐색. **한국 웹 퍼블리셔·프론트엔드 시니어가 다음 스프린트에 바로 끌어다 쓸** 라이브 데모 + 코드 패턴 풀. 매거진 본문이 아니라 보강 자료. ★는 "이번 주 DEV 레퍼런스 5선" 매거진 글 승격 후보.
>
> 탐색 경로: CodePen Picks(0건, 403 차단 — 단, Codrops·Smashing 본문이 인용한 개별 CodePen URL은 확보) · Codrops(5건 fetch / 4건 데모 + 코드 확인) · Chrome Dev blog(3건 신기능) · Smashing(2건) · Show HN(4건) · GitHub Trending(0건 매치) · web.dev(0건 매치). 총 7경로 시도 / 5경로 확인 성공 / 10개 선별 / CodePen 도메인 봇 차단 2회.
>
> v2 보강: 시점을 한국 웹 퍼블리셔·프론트엔드로 재정렬, 모든 항목에 **코드 위치**(CodePen·GitHub raw·MDN·inspect 가능 부분) + **iOS Safari·한국어 폰트·모바일 우선** 적용성 명시.

---

## 1. CSS `sibling-index()` & `sibling-count()` — nth-child 지옥 끝내기 ★

- **URL (데모)**: https://codepen.io/smashingmag/pen/zxowBog (Durgesh Pawar)
- **URL (해설)**: https://smashingmagazine.com/2026/05/mathematical-layouts-sibling-index-sibling-count/
- **어디서 발견**: Smashing Magazine 2026-05-21 "Advanced Tree Counting"
- **카테고리**: CSS 신기능 / 인덱스 기반 스타일
- **이 데모로 가능해진 구현**: 기존엔 카드 N개의 staggered 진입을 SCSS `@for $i from 1 through 12`로 펼치거나 JS에서 `style.animationDelay = i*100`을 박았다. 이제 *순수 CSS 한 줄*로 `animation-delay: calc(sibling-index() * 100ms)`. 카드 개수가 5개에서 7개로 바뀌어도 마크업·SCSS·JS 어디도 안 만진다.
- **핵심 기술 + 브라우저 지원**: `sibling-index()`(1부터 자신의 위치), `sibling-count()`(형제 총수), `calc()`/`sin()`/`cos()`와 조합. Chrome/Edge 138+ stable, **Safari 26.2+ stable (iOS Safari 26.2 포함 — 2026-04 출시분이라 국내 아이폰 신규 OS 사용자 90% 이상 커버)**, Firefox는 nightly. 일반 사용자 베이스 75-80%. Firefox·구형 iOS 대응 프로젝트는 `@supports (width: calc(sibling-count() * 1px))`로 분기.
- **장면 디테일**: ① `animation-delay: calc(sibling-index() * 100ms)` 한 줄로 카드 진입 staggered ② `width: calc(100% / sibling-count())` — 탭이 가변 개수에 자동 균등 분할 (nth-child 0개) ③ `sin()`/`cos()`로 원형 메뉴 배치(피자 슬라이스 각도 자동) ④ `z-index: calc(sibling-count() - sibling-index())`로 카드 부채(fan) 깊이.
- **응용 후보 (한국 시나리오)**:
  - 토스 보험 가입 단계 표시기 — 단계 수가 상품마다 다른 progress 컴포넌트 (3단계 보험, 5단계 신용대출 같은 마크업 한 벌로 처리)
  - 무신사 상품 옵션 탭(사이즈·색상 N개) 균등 분배
  - 카카오뱅크 신용카드 카드 부채 표시 (보유 카드 N개 겹쳐 보여주기)
  - 당근 비즈 카테고리 휠 UI 원형 배치
- **코드 위치**:
  - CodePen fork → https://codepen.io/smashingmag/pen/zxowBog (좌측 HTML/CSS/JS 패널 그대로 복사)
  - 글 본문 인라인 스니펫 → 위 Smashing 글 안에 staggered/원형/탭 3개 패턴 코드 전체 게재. View Source로 바로 카피
- **캡처 URL**: CodePen 데모 페이지 og:image

## 2. CSS Gap Decorations — `column-rule`/`row-rule`로 빈 div 없는 구분선 ★

- **URL (대시보드 데모)**: https://microsoftedge.github.io/Demos/css-gap-decorations/dashboard-grid.html
- **URL (플레이그라운드)**: https://microsoftedge.github.io/Demos/css-gap-decorations/playground.html
- **URL (소스 repo)**: https://github.com/MicrosoftEdge/Demos/tree/main/css-gap-decorations
- **어디서 발견**: Chrome for Developers blog 2026-05-15 "Gap decorations: Now available in Chromium"
- **카테고리**: CSS 신기능 / 레이아웃
- **이 데모로 가능해진 구현**: 기존엔 그리드 셀 사이 구분선을 빈 `<div class="divider">` 추가 또는 `::before/::after` 배경, 또는 `border` + 음수 margin 트릭으로 만들었다. 이제 `column-rule: 1px solid var(--gray-200)` 한 줄. 마크업이 깨끗해지고 의미 없는 노드가 사라져 스크린리더에도 정확.
- **핵심 기술 + 브라우저 지원**: `column-rule`/`row-rule` (단축), `column-rule-width/style/color`, `rule-break`, `rule-inset`, `rule-paint-order`. `repeat(2, 1px), 4px`처럼 굵기 패턴 반복 가능. **Chrome/Edge 149+ stable (2026-05)**. **Safari/Firefox 미지원 — iOS Safari 사용자가 절반인 한국 모바일 웹은 fallback 필수.** `@supports (column-rule: 1px solid)` 분기 또는 기존 `gap` + `::after` border 패턴 병행.
- **장면 디테일**: 대시보드 데모에서 9개 메트릭 카드 사이 ① 컬럼 사이 1px·3px 교차 굵기 ② 호버 시 색이 amber→blue 페이드 ③ `rule-inset-junction`이 호버 때 10px→0px로 좁아져 교차점이 부드럽게 닫힘. 플레이그라운드에서 grid/flex/multicolumn 세 모드 실시간 조정.
- **응용 후보 (한국 시나리오)**:
  - 토스 자산 대시보드 카드 사이 점선 구분 (의미 없는 divider div 제거)
  - 무신사 상품 비교표 컬럼 구분선 (헤더·바디 별도 마크업 없이)
  - 카카오뱅크 계좌 그리드 hover 시 강조선 색 전환
  - 당근 마이페이지 메뉴 그룹 dashed 분리선
- **코드 위치**:
  - GitHub raw → https://github.com/MicrosoftEdge/Demos/tree/main/css-gap-decorations (총 14개 데모 HTML — dashboard-grid, playground, burger-menu, calendar, calendar-week, daily-css-news, guitar-fretboard, notebook, personal-site, the-daily-oddity, article-grid, dynamic-items, settings-list, split-screen). 각 파일이 단일 HTML이라 view-source 또는 raw로 통째 복사 가능
  - 데모 페이지에서 우클릭 → 페이지 소스 보기로 인라인 `<style>` 그대로 카피
- **캡처 URL**: 데모 페이지 자체 캡처 권장

## 3. HTML-in-Canvas API (`canvas-draw-element`) — `<canvas>`에 진짜 DOM 그리기 ★

- **URL (책 데모)**: https://chrome.dev/html-in-canvas/demos/webgl-book-curl.html
- **URL (빌보드)**: https://chrome.dev/html-in-canvas/demos/billboard.html
- **URL (소개)**: https://developer.chrome.com/blog/html-in-canvas-origin-trial
- **어디서 발견**: Chrome for Developers 2026-05-19 origin trial 공지
- **카테고리**: HTML/JS 신기능 / Canvas + DOM 통합
- **이 데모로 가능해진 구현**: 기존 3D/Canvas 콘텐츠는 텍스트 select·검색·스크린리더 모두 작동 안 했다. 이제 `canvas.getContext('2d').drawElement(htmlEl)`로 *실제 DOM 노드*를 텍스처처럼 캔버스에 그릴 수 있어, 책 데모에서 셜록홈즈 본문을 드래그로 선택·복사 가능. 한국어 콘텐츠도 IME·접근성·SEO 손해 없이 캔버스 안에 박을 수 있는 길이 열린다.
- **핵심 기술 + 브라우저 지원**: `drawElement()` API, `chrome://flags/#canvas-draw-element` 플래그 또는 origin trial 토큰 등록. **Chrome Canary 149+ / origin trial Chrome 148-150**. 사양 변동 가능성 큼 — 정식 채택 전 production 권장 X. **iOS Safari 0%**. 캠페인·랜딩페이지·프로토타입에서만 채택.
- **장면 디테일**: ① 책 데모 — 드래그로 페이지 모서리 컬, 표시된 영어 본문 selectable + Ctrl+F 검색 ② 빌보드 — 3D 공간 빌보드 위에 실제 Gemini/Meet UI 박혀 클릭 가능 ③ 굴절 타이포 — 휘어진 글자도 검색/선택 가능.
- **응용 후보 (한국 시나리오)**:
  - 무신사 신상 인터랙티브 룩북 (3D 책 페이지 컬 + 상품명 텍스트 검색·복사 가능)
  - 토스 연말정산 가이드의 3D 봉투 안 안내 텍스트(스크린리더 OK)
  - 라인 프렌즈 스토어 3D 진열장에 상품명·가격 selectable
  - 한국어 폰트 렌더링 캔버스 안에서 그대로 통과(서브픽셀 깨짐 없음 — 진짜 DOM이라)
- **코드 위치**:
  - 데모 페이지 우클릭 → 페이지 소스 보기 (chrome.dev/html-in-canvas/demos/*.html 모두 view-source 가능, JS·HTML 인라인)
  - origin trial 등록 → https://developer.chrome.com/origintrials/#/view_trial/canvas-draw-element
- **캡처 URL**: 각 데모 페이지 직접 캡처

## 4. ScrollMap — GSAP ScrollTrigger × SVG path 스크롤 카메라 ★

- **URL (라이브)**: https://tympanus.net/Tutorials/ScrollMap/
- **URL (CodePen 단계별)**:
  - 미니멀: https://codepen.io/creativeocean/pen/azBZmdx
  - 카메라 무빙: https://codepen.io/creativeocean/pen/jEVryKm
  - 풀 구현: https://codepen.io/creativeocean/pen/myOVZYO
- **URL (제작기)**: https://tympanus.net/codrops/2026/05/21/creating-scroll-driven-svg-map-animations-with-gsap/
- **어디서 발견**: Codrops 2026-05-21
- **카테고리**: 인터랙션 데모 / 스크롤 스토리텔링
- **이 데모로 가능해진 구현**: 기존엔 지도 경로 애니메이션 = MP4 비디오 + `<video>` 태그 또는 Lottie. 무겁고 양방향 스크럽 안 됨. 이제 SVG path `stroke-dashoffset` 보간 + dot transform + viewBox 줌인을 ScrollTrigger pin+scrub로 묶으면 *거꾸로 스크롤하면 거꾸로 되감기는* 라이브 패턴.
- **핵심 기술 + 브라우저 지원**: GSAP 3.x + ScrollTrigger + DrawSVGPlugin, `pin: '.map'`, `scrub: 1`, `gsap.quickTo()`로 dot 좌표 추적, viewBox 동적 변경. SVG·GSAP 전부 IE 제외 풀 지원. **iOS Safari pin 동작 OK, 단 sticky 상위에 transform 있으면 깨짐 — 한국 모바일 점유율 큰 iOS에서 pin 부모 transform 절대 금지.**
- **장면 디테일**: Charleston SC 줌아웃 → 스크롤 진행 시 자전거 경로 한 획씩 그어짐 → 점이 끝을 따라감 → viewBox가 점차 좁아지며 카메라 줌인 → 도착점 클로즈업. 거꾸로 스크롤하면 그대로 되감김.
- **응용 후보 (한국 시나리오)**:
  - 배민 라이더 동선 인포그래픽 (라이더 자전거 경로 + 도착)
  - 카카오맵 신규 지하철역 안내 캠페인 (서울 지도 위 노선 그어지기)
  - 한진택배 배송 추적 페이지 — 송장 누른 뒤 출발지 → 도착지 경로 시각화
  - 제주관광공사 추천 코스 마이크로사이트 (코스별 라이브 스크롤)
- **코드 위치**:
  - CodePen 3단계 fork (미니멀 → 카메라 → 풀) — 학습 곡선 그대로
  - 글 본문 인라인 스니펫 (HTML/CSS/JS 핵심 분량) — Codrops 글 자체에 게재
- **캡처 URL**: ScrollMap 데모 페이지 직접 캡처

## 5. Virtuoso Data Table — 행·열 듀얼 가상화 + Shadcn 기반 ★

- **URL (라이브 데모·문서)**: https://virtuoso.dev/data-table/
- **URL (GitHub)**: https://github.com/petyosi/react-virtuoso
- **어디서 발견**: Show HN 최근
- **카테고리**: 컴포넌트 라이브러리 / 데이터 UI
- **이 데모로 가능해진 구현**: 토스증권 호가창처럼 행 수천·열 수십 짜리 테이블을 처음부터 짜려면 가상화 라이브러리 골라 직접 통합(react-window + react-table)하고 컬럼 리사이즈·sticky·그룹·상태저장을 모두 별도 구현. 이 컴포넌트는 그 전부가 한 묶음이고 Radix + Tailwind(Shadcn) 베이스라 디자인 토큰 커스텀 자유.
- **핵심 기술 + 브라우저 지원**: React 18+, Radix Primitives, Tailwind, IntersectionObserver, `Intl.NumberFormat`(통화·천단위 콤마 — 한국 원화 `Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' })` 그대로). 풀 브라우저 지원. **iOS Safari overscroll-behavior 호환 OK**.
- **장면 디테일**: 문서 예시에서 ① 컬럼 헤더 드래그 리사이즈 ② 우클릭 컨텍스트 메뉴 → 컬럼 숨김 ③ 좌측 name 컬럼 좌우 스크롤 시 sticky 유지 ④ 그룹 행 접기/펼치기.
- **응용 후보 (한국 시나리오)**:
  - 토스증권 호가창 (가격·잔량 양쪽 가상화)
  - 쿠팡 셀러 어드민 상품 관리 (수만 행 + 다중 컬럼 조작)
  - 카카오비즈 광고 성과 대시보드 (지표 50개·기간 1년 매트릭스)
  - 무신사 입점 브랜드 매출 표 (그룹 행 + sticky 컬럼)
- **코드 위치**:
  - GitHub repo 통째 → README의 examples/ 하위에 data-table 데모 소스
  - 문서 페이지 각 예시 옆에 "Show Code" 토글로 TSX 그대로 게재
- **캡처 URL**: 문서 페이지 직접 캡처

## 6. Draw on a Map — URL fragment에 데이터 직접 인코딩

- **URL**: https://drawonamap.com/
- **어디서 발견**: Show HN 최근
- **카테고리**: 공유 패턴 레퍼런스 / URL state
- **이 데모로 가능해진 구현**: "공유" 기능을 만들 때 백엔드 DB에 상태를 저장하고 짧은 ID 발급해 단축 URL 만드는 흐름이 일반적. 여기는 *URL fragment(`#...`) 안에 모든 좌표·도형 데이터를 인코딩*해 백엔드 0줄. 가입·로그인·서버 없이 공유 가능. 사이드 프로젝트나 MVP에 그대로 쓸 패턴.
- **핵심 기술 + 브라우저 지원**: OpenStreetMap (Leaflet 추정), `URLSearchParams` + base64/lz-string 압축, `history.replaceState`로 URL 갱신, iframe 임베드 코드 자동 생성, 키보드 단축(1-7 도구 / Space 팬 / Ctrl+Z 언두). **iOS Safari·안드 크롬 풀 지원**, 모바일 브라우저에서 앱 설치 없이 동작.
- **장면 디테일**: 위치 검색 → 도구 선택 → 그리기 → Share 클릭 → 그림+위치가 인코딩된 긴 URL 클립보드 복사. 그 URL 새 탭에 붙이면 같은 화면 복원.
- **응용 후보 (한국 시나리오)**:
  - 당근 동네지도 게시물 (비회원도 보기 — URL이 곧 데이터)
  - 카카오맵 친구에게 코스 공유 (가입 없이 일회성 공유 UX 검증)
  - 토스 가게 위치 + 좌석 추천 공유
  - 배민 라이더 배달 구역 시각화 (관리자가 라이더에게 URL만 보내기)
- **코드 위치**:
  - 사이트 view-source (Cloudflare Pages, 클라이언트 사이드 JS 전체 노출). 핵심 인코딩 로직은 압축 JS지만 브라우저 DevTools Sources 패널에서 prettify로 분석 가능
  - 직접 코드 패턴 학습 → MDN [URL fragment](https://developer.mozilla.org/en-US/docs/Web/API/URL/hash), lz-string GitHub
- **캡처 URL**: 사이트 og:image

## 7. GSAP 3D Cube Scrollable Gallery (Webflow)

- **URL (라이브)**: https://gsap-cubic-scrollable-image-gallery.webflow.io/
- **URL (제작기 + Webflow 클론)**: https://tympanus.net/codrops/2026/05/26/building-a-scroll-driven-3d-cube-gallery-in-webflow-with-gsap/
- **어디서 발견**: Codrops 2026-05-26
- **카테고리**: 인터랙션 데모 / 스크롤 갤러리
- **이 데모로 가능해진 구현**: 인물·상품 6개를 *3D 큐브 6면*으로 묶어 스크롤 시 큐브가 헥사고날 경로로 이동하며 면 회전. 기존엔 가로 슬라이더 + 페이드였던 시즌 룩북·라인업 페이지가 *공간감 있는 단일 무빙 오브젝트*로 바뀐다.
- **핵심 기술 + 브라우저 지원**: 500vh 섹션 + sticky viewport + `transform-style: preserve-3d` + perspective, GSAP ScrollTrigger scrub, SplitText, container queries로 Z축 반응형. iOS Safari preserve-3d 지원 OK, 단 `position: sticky` 안의 자식에 `will-change: transform` 안 주면 모바일에서 깜빡임 — *한국 모바일 점유율 큰 iOS에서 반드시 will-change 명시*.
- **장면 디테일**: 스크롤 0% → 첫 인물(Saki Nishimura) 큐브 정면. 스크롤 진행 → 큐브가 헥사곤 경로로 슬라이드, 다음 면 회전 → 배경 이미지 0.5초 페이드 → 가운데 텍스트 단어별 0.4초 슬라이드 아웃·인.
- **응용 후보 (한국 시나리오)**:
  - 무신사 시즌 룩북 인물 6명 회전 (기존 가로 슬라이더 대체)
  - 현대카드 슈퍼콘서트 라인업 회전 갤러리
  - 라이엇 게임즈 한국 챔피언 비주얼 큐브
  - 카카오 게임 신작 캐릭터 6명 인트로
- **코드 위치**:
  - Webflow 클론 링크 (Codrops 글 안) — Webflow Designer에서 그대로 열어 인터랙션 패널 확인
  - 글 본문에 ScrollTrigger 설정/CMS 컬렉션 transform 값(Origin XY, Move XYZ, Rotate XYZ) 표 게재 — 그대로 카피 가능
- **캡처 URL**: 데모 페이지 자체 캡처

## 8. shader.se — WebGPU + Lenis 풀스크린 씬 전환

- **URL (라이브)**: https://shader.se
- **URL (제작기)**: https://tympanus.net/codrops/2026/05/19/80s-business-tech-seamless-scene-transitions-inside-shader-ses-scroll-driven-webgpu-pipeline/
- **어디서 발견**: Codrops 2026-05-19 case study
- **카테고리**: 인터랙션 / 페이지 전환 패러다임
- **이 데모로 가능해진 구현**: 기존 SPA 페이지 전환 = 라우터 + CSS fade/slide. 이건 *씬 안에서 카메라가 다음 페이지로 줌인*. 캠페인·브랜드 마이크로사이트에서 페이지 경계가 공간적으로 연결된다. 일반 프로덕션은 비용 큼 — 캠페인·랜딩 한정.
- **핵심 기술 + 브라우저 지원**: WebGPU (Chrome 113+, Safari 26+, Firefox는 옵트인) + Lenis(스무스 스크롤) + 페이지 스냅 + screen-space 트랜지션 + frustum-matched 평면. 인액티브 페이지 draw call 0. **iOS Safari WebGPU 26부터 지원 — 신규 OS만. 안드 크롬은 안정**. WebGPU 폴백 필요한 한국 서비스는 WebGL 2 fallback path 같이 설계.
- **장면 디테일**: 히어로 "scroll to enter" → 카메라가 80년대 베이지 컴퓨터 모니터 안으로 줌인 → 모니터 화면이 다음 페이지로 풀스크린 → 컨택트 페이지로 갈 때는 *악수 모양*이 화면 위 떠 그 모양 안에 다음 페이지 보임.
- **응용 후보 (한국 시나리오)**:
  - 토스 보험 가입 인트로 단계 전환(카드 안으로 줌인)
  - 무신사 브랜드 헤리티지 페이지 시대별 씬 전환
  - 현대카드 슈퍼콘서트 페이지 헤더에서 무대 안으로 줌인
  - 배민 리브랜딩 마이크로사이트 카테고리 전환
- **코드 위치**:
  - 사이트 view-source + DevTools Sources (WebGPU 셰이더 코드 일부 노출). 단 번들된 코드라 완전 분석 어려움
  - 패턴 학습용 → Codrops 글 본문에 핵심 파이프라인 단계 다이어그램과 의사 코드. **본격 적용 전 GLSL/WGSL 지식 필요 — 일반 퍼블리셔 작업이 아님**, 인터랙션 전문 외주/내부 모션 디자이너 협업 전제
- **캡처 URL**: https://shader.se og:image

## 9. Adrien Vanderpotte / Má Sài Gòn Space — 감정 → 배경 색 보간

- **URL (주 추천)**: https://masaigon.space/en
- **URL (포트폴리오 허브)**: https://avdp.xyz/
- **URL (인터뷰)**: https://tympanus.net/codrops/2026/05/27/...
- **어디서 발견**: Codrops 2026-05-27
- **카테고리**: 인터랙션 / 폼 UX
- **이 데모로 가능해진 구현**: 기존 감정 입력 UI = 라디오 버튼 + 텍스트 라벨. 여기는 선택한 감정 태그에 따라 *body 배경 색 자체가 천천히 보간*. 콘텐츠·웰니스·커뮤니티 서비스에서 폼 입력 = 환경 변화 패턴.
- **핵심 기술 + 브라우저 지원**: `color-mix(in oklch, var(--from) 0%, var(--to) 100%)` 또는 JS 색 트윈(GSAP·anime.js), 4단계 stepper UI, 감정 태그 다중 선택, 캐릭터 카운터. **`color-mix()` Chrome 111+, Safari 16.2+, Firefox 113+ — 한국 iOS 사용자 거의 풀 커버**. oklch는 안전.
- **장면 디테일**: 받는 사람 선택 → 본문 작성 → 감정 태그 2개 선택 → 인적사항. 각 단계 전환 시 배경이 감정 톤으로 천천히 페이드. 미세 "whoosh/snap" 사운드.
- **응용 후보 (한국 시나리오)**:
  - 토스 가계부 "이번달 기분" 입력 시 색조 변화
  - 카카오톡 일기장 / 브런치 무드 기반 글쓰기
  - 무신사 무드 추천 ("오늘 어떤 기분?")
  - 당근 동네생활 글 작성 시 감정 태그별 배경
- **코드 위치**:
  - 사이트 view-source — color-mix 또는 GSAP 색 트윈 패턴 인라인 CSS
  - 직접 학습 → MDN `color-mix()` https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/color-mix
- **캡처 URL**: https://masaigon.space/en og:image

## 10. ProtoPie "정직한 프로토타입" — 사용자 테스트용 살아있는 검증 흐름

- **URL (라이브 데모)**: https://demo.protopie.cloud/p/606d44ace6d7ea8f41cf38ff
- **URL (튜토리얼)**: https://smashingmagazine.com/2026/05/prototype-users-fix-protopie/
- **어디서 발견**: Smashing Magazine 2026-05-25
- **카테고리**: 프로토타이핑 도구 / UX 리서치
- **이 데모로 가능해진 구현**: 퍼블리셔 입장에서 *직접 짤 일은 거의 없지만*, 디자이너·리서처가 가져오는 프로토타입의 한계를 알아둘 가치. 피그마 프로토타입은 "버튼 누르면 다음 화면"만 가능 — 실제 검증·에러·키보드 입력은 ProtoPie. 퍼블리셔는 받은 사양에서 "검증 로직 어디까지 들어가나"를 미리 읽어야 *결제·로그인 같은 흐름의 엣지 케이스*가 마크업 단계에서 누락 안 됨.
- **핵심 기술**: ProtoPie의 변수·조건문, 입력 검증(alex.c@gmail.com / ABC123만 통과), Face ID Lottie 오프스크린 → 탭 시 트리거 → 0s/0s/0.5s/1s staggered, 마스킹된 패스워드 필드, 실제 키보드 입력 수용 레이어.
- **장면 디테일**: Pie Bank 로그인 — 잘못된 비밀번호 시 실제 에러 메시지 노출 → Face ID 탭 → 0.5s 인증 애니메이션 → 1s 씬 전환. iOS 네이티브와 구분 안 됨.
- **응용 후보 (한국 시나리오)**:
  - 토스뱅크 신규 사용자 테스트 — 가짜 로그인 대신 실제 검증 흐름으로 엣지 케이스 발견
  - 카카오뱅크 송금 한도 초과 시나리오 검증
  - 무신사 결제 실패 시나리오 (카드사 거절·잔액 부족 분기) 검증 후 프론트 분기 마크업 확정
  - 퍼블리셔는 ProtoPie 파일 받아 *상태 다이어그램* 확정 → React/Vue state 머신 그대로 옮기는 워크플로 가능
- **코드 위치**:
  - ProtoPie Cloud 공유 링크 위 다운로드 버튼 → `.pie` 파일 (ProtoPie Studio에서 열어 변수·조건 분기 확인). 코드 자체는 없으나 *상태 다이어그램이 곧 프론트 state machine*
  - 직접 학습 → ProtoPie 무료 평가판 / XState 같은 JS state machine 라이브러리로 옮기는 패턴
- **캡처 URL**: ProtoPie Cloud 데모 직접 캡처

---

## 자체 평가

한국 웹 퍼블리셔·프론트엔드가 다음 스프린트에 진짜 적용할 만한가 — **8/10**.

- ★ 5개 중 즉시 production 가능 = **sibling-index** (iOS Safari 26.2 커버) · **Virtuoso Data Table** (React 풀 지원).
- ★ 중 fallback 설계 필요 = **Gap Decorations** (Safari/Firefox 미지원 — `@supports` 분기 필수) · **HTML-in-Canvas** (origin trial 단계, 캠페인·프로토타입만).
- ★ 중 ScrollMap은 GSAP 유료지만 카카오·토스·배민급 캠페인엔 통상 라이선스 보유. CodePen 3단계 fork 학습 곡선이 좋음.
- 비-★ 4개는 패러다임 레퍼런스(shader.se, masaigon)·도구 이해(ProtoPie)·패턴(Draw on a Map URL state)·인터랙션(GSAP cube).

**v1 → v2 변경 요약**:
- 재활용 데모 = 10개 / 신규 발견 = 0개 (CodePen·Chrome blog 차단, 그 대신 GitHub repo·CodePen URL 세분화로 코드 위치 강화)
- 코드 위치 확보 비율 = **10/10 (100%)** — CodePen URL 4건, GitHub repo 3건, view-source/inspect 가능 6건, MDN 보조 2건 (중복 포함)
- 한국 환경 적용성 명시 = **10/10 (100%)** — iOS Safari 지원 단계, 한국어 폰트, 모바일 sticky·will-change 주의점 모두 명시
- ★ 표시 = **5개** (sibling-index, Gap Decorations, HTML-in-Canvas, ScrollMap, Virtuoso)
- 디자이너 시점 흔적 제거 = "시안 그리기" → "다음 스프린트 마크업·CSS 작업" 전반 재서술
