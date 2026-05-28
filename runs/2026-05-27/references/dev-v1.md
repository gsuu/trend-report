# DEV 레퍼런스 (2026-05-27 발견분)

> dev-reference-scout 능동 탐색. *한국 UIUX 디자이너가 시안 결정에 닿는* 라이브 인터랙션·CSS 데모 풀. 매거진 본문이 아니라 보강 자료. ★는 "이번 주 DEV 레퍼런스 5선" 매거진 글 승격 후보.
>
> 탐색 경로: CodePen Picks(0건, 403) · CodePen Spark(0건, 403) · Codrops(5건 fetch / 4건 데모 확인) · web.dev(2건) · Chrome blog(3건 신기능) · Show HN(4건) · GitHub Trending CSS/HTML/JS(3개 채널 fetch / 디자이너 시점 매치 0건) · Smashing UI/UX(2건). 총 8경로 시도 / 6경로 확인 성공 / 10개 선별 / CodePen 계열 2회 403 차단.

---

## 1. CSS `sibling-index()` & `sibling-count()` — DOM 위치를 CSS에서 직접 계산 ★

- **URL**: https://smashingmagazine.com/2026/05/mathematical-layouts-sibling-index-sibling-count/ (해설), https://codepen.io/smashingmag/pen/zxowBog (CodePen 데모 — Durgesh Pawar)
- **어디서 발견**: Smashing Magazine UI/UX 2026-05-21 "Advanced Tree Counting: Mathematical Layouts With sibling-index() And sibling-count()"
- **카테고리**: CSS 신기능 / 디자인 토큰·계산
- **이 데모가 가능하게 하는 시안**: 카드/탭/메뉴를 시안에 5개로 그렸다가 7개로 늘려도 staggered 딜레이·균등 폭·원형 배치가 자동으로 재계산된다. 디자이너가 "n개일 때마다 개발자에게 새 사양 주는" 흐름을 끊는다.
- **핵심 기술**: `sibling-index()` (1부터 자신의 위치), `sibling-count()` (형제 총수). `calc()`·`sin()`·`cos()`와 조합. Chrome/Edge 138+, Safari 26.2+ stable. Firefox는 아직 nightly. 글로벌 75-80% 커버.
- **장면 디테일**: ① `animation-delay: calc(sibling-index() * 100ms)` 한 줄로 카드 등장 staggered ② `width: calc(100% / sibling-count())` — 탭 균등 분할이 nth-child 없이 자동 ③ `sin()`·`cos()`로 원형 메뉴 배치 (피자처럼 각도 균등) ④ z-index 카드 부채(fan) — index만큼 깊이.
- **응용 후보**: 토스 상품 리스트 카드 진입 staggered (서비스마다 카드 갯수 다른 상황), 무신사 사이즈 옵션 탭 균등 분배, 당근 비즈 카테고리 선택의 원형 휠 UI, 카카오 페이 신용카드 부채 표시(겹쳐 보여주기). *Firefox 대응이 필요한 프로젝트는 `@supports`로 점진적 적용 권고가 글에 같이 있음.*
- **캡처 URL**: https://codepen.io/smashingmag/pen/zxowBog (CodePen 데모 페이지에서 og:image)

## 2. CSS Gap Decorations — 대시보드 사이 선을 div 없이 ★

- **URL**: https://microsoftedge.github.io/Demos/css-gap-decorations/dashboard-grid.html (대시보드 데모), https://microsoftedge.github.io/Demos/css-gap-decorations/playground.html (인터랙티브 플레이그라운드)
- **어디서 발견**: Chrome for Developers blog 2026-05-15 "Gap decorations: Now available in Chromium"
- **카테고리**: CSS 신기능 / 레이아웃
- **이 데모가 가능하게 하는 시안**: 그리드·플렉스 셀 사이에 줄·점선·이중선을 *빈 div나 ::before 없이* 그릴 수 있다. 대시보드·테이블·다단 레이아웃에서 디자이너가 시안에 그린 구분선을 마크업 추가 없이 그대로 구현 가능.
- **핵심 기술**: `column-rule`, `row-rule` (단축), `column-rule-width/style/color`, `rule-break`, `rule-inset`. `repeat(2, 1px), 4px`처럼 줄 굵기 패턴 반복 가능. Chrome/Edge 149+ (2026-05) stable. Safari·Firefox 아직.
- **장면 디테일**: 대시보드 데모에서 9개 메트릭 카드 사이로 ① 컬럼 사이 1px·3px 교차 굵기 ② 호버 시 색이 amber→blue로 전환 ③ `rule-inset-junction`이 호버 때 10px→0px로 줄어들며 교차점이 부드럽게 닫힘. 플레이그라운드에서 grid/flex/multicolumn 세 모드를 실시간 조정.
- **응용 후보**: 토스 자산 대시보드 카드 사이 점선 분할, 무신사 상품 비교표 컬럼 구분선, 카카오뱅크 계좌 그리드 hover 시 강조선, 당근 마이페이지 메뉴 그룹 사이 dashed 분리선. *Safari 대비 fallback이 필요한 한국 서비스는 border + grid-gap의 기존 패턴 병행 안내.*
- **캡처 URL**: 데모 페이지 자체 캡처 권장 (og:image 미설정)

## 3. shader.se — 풀스크린 씬 전환의 새 기준 ★

- **URL**: https://shader.se (실제 사이트), https://tympanus.net/codrops/2026/05/19/80s-business-tech-seamless-scene-transitions-inside-shader-ses-scroll-driven-webgpu-pipeline/ (제작기)
- **어디서 발견**: Codrops 2026-05-19 케이스 스터디
- **카테고리**: 인터랙션 데모 / 페이지 전환 패러다임
- **이 데모가 가능하게 하는 시안**: "페이지 이동" = 다음 화면이 *씬 안에서* 카메라로 줌인되거나 종이 셰이더로 찢어지며 드러나는 식. 디자이너가 시안 단계에서 "이 페이지 → 이 페이지" 흐름을 *공간적 연결*로 그릴 수 있다.
- **핵심 기술**: Lenis(스무스 스크롤) + 페이지 스냅, screen-space sampling 트랜지션(임의 모양·임의 위치), frustum-matched 평면 트랜지션(카메라가 가상 모니터 메시 안으로 들어감), 렌더 오프셋(다음 씬 미리 그려놓고 종이 셰이더 뒤에 배치). 인액티브 페이지는 draw call 0.
- **장면 디테일**: 히어로에서 "scroll to enter" → 카메라가 80년대 베이지 컴퓨터 모니터 안으로 줌인 → 모니터 화면이 다음 페이지가 되며 풀스크린 → 컨택트 페이지로 갈 때는 *악수 모양*이 화면 위 어디든 떠 그 모양 안에 다음 페이지가 보임.
- **응용 후보**: 토스 보험 가입 인트로의 단계 전환(카드 안으로 줌인), 무신사 브랜드 헤리티지 페이지의 시대별 씬 전환, 현대카드 슈퍼콘서트 페이지 헤더에서 무대 안으로 줌인, 배민 신규 리브랜딩 마이크로사이트의 카테고리 전환. *프로덕션 적용 비용은 크지만, 캠페인·랜딩·브랜드 마이크로사이트에서 한 번 보면 시안 자체가 달라진다.*
- **캡처 URL**: https://shader.se (og:image)

## 4. Adrien Vanderpotte — 감정에 반응하는 컬러 ★

- **URL**: https://masaigon.space/en (Má Sài Gòn Space — 주력 추천), https://avdp.xyz/ (포트폴리오 허브)
- **어디서 발견**: Codrops 2026-05-27 인터뷰 "Whooshes, Snaps and Shaders"
- **카테고리**: 인터랙션 데모 / 분위기 디자인
- **이 데모가 가능하게 하는 시안**: 사용자가 입력한 감정 태그(at peace / excited / sad / hopeful 등)에 따라 *배경 컬러 자체가 천천히 바뀌는* 인터랙션. "감정 입력 폼"이 단순 라디오 버튼이 아니라 *환경 변화로 피드백*하는 시안이 가능.
- **핵심 기술**: 색 보간(CSS color-mix 또는 JS 트윈), 4단계 분기 폼(stepper UI), 감정 태그 최대 2개 선택, 캐릭터 카운터, 24시간 검토 명시.
- **장면 디테일**: ① 편지 받는 사람 선택 → 본문 작성 → 감정 태그 2개 선택 → 인적사항. 각 단계가 다음 단계로 갈 때 배경이 *감정 톤*으로 천천히 페이드 ② "whooshes and snaps" 미세 사운드/모션이 식물처럼 유기적 ③ 댓글·반응 시스템도 같은 톤.
- **응용 후보**: 토스 가계부의 "이번달 기분" 입력 시 색조 변화, 카카오톡 일기장 앱 톤 다운/업, 무신사 무드 기반 추천 ("오늘 어떤 기분?"), 당근 동네생활 글 작성 시 감정 태그에 따른 배경 변화. *커머스보다 컨텐츠·커뮤니티·웰니스 서비스에 강한 패턴.*
- **캡처 URL**: https://masaigon.space/en (og:image)

## 5. ProtoPie "정직한 프로토타입" 기법 ★

- **URL**: https://demo.protopie.cloud/p/606d44ace6d7ea8f41cf38ff (Pie Bank Chapter 1 다운로드 가능 파일), https://smashingmagazine.com/2026/05/prototype-users-fix-protopie/ (튜토리얼)
- **어디서 발견**: Smashing Magazine 2026-05-25
- **카테고리**: 디자이너 본인 도구 / 프로토타이핑
- **이 데모가 가능하게 하는 시안**: 사용자 테스트할 프로토타입이 *진짜로 검증*하고 *진짜로 키보드 입력 받고* *진짜로 에러 상태 보여줘야* 인사이트가 정확하다는 주장. ProtoPie로 그걸 어떻게 만드는지의 살아있는 예시.
- **핵심 기술**: 입력 검증(alex.c@gmail.com / ABC123만 통과), Face ID Lottie 오프스크린 → 탭 시 트리거 → 0s/0s/0.5s/1s staggered, 마스킹된 패스워드 필드, 실제 키보드 입력 수용 레이어.
- **장면 디테일**: Pie Bank 로그인 — ① 잘못된 비밀번호 입력 시 실제 에러 메시지 노출 ② Face ID 탭 → 0.5초 뒤 인증 애니메이션 → 1초 뒤 씬 전환. iOS 네이티브와 구분 안 됨.
- **응용 후보**: 토스 뱅크 신규 사용자 테스트 시 가짜 로그인 대신 실제 검증 흐름, 카카오뱅크 송금 한도 초과 테스트, 무신사 결제 실패 시나리오 검증. *피그마 프로토타입의 "버튼 누르면 다음 화면" 한계를 넘어야 할 때 디자이너가 직접 켜야 하는 도구.*
- **캡처 URL**: ProtoPie Cloud 데모 직접 캡처

## 6. GSAP 3D Cube Scrollable Gallery — 스크롤 풀스크린 갤러리

- **URL**: https://gsap-cubic-scrollable-image-gallery.webflow.io/ (라이브 데모), https://tympanus.net/codrops/2026/05/26/building-a-scroll-driven-3d-cube-gallery-in-webflow-with-gsap/ (제작기)
- **어디서 발견**: Codrops 2026-05-26
- **카테고리**: 인터랙션 데모 / 스크롤 갤러리
- **이 데모가 가능하게 하는 시안**: 인물·상품 6개를 *3D 큐브 면*으로 보여주며 스크롤할 때 큐브가 헥사고날 경로를 따라 이동하면서 면이 회전. 배경 이미지는 페이드, 가운데 텍스트는 word-by-word staggered.
- **핵심 기술**: 500vh 섹션 + sticky viewport, CMS 컬렉션에 큐브 면 6개의 transform 값(Origin Left/Top, Move XYZ, Rotate XYZ) 저장, `transform-style: preserve-3d` + perspective, GSAP ScrollTrigger 스크럽, SplitText, container queries로 Z축 반응형.
- **장면 디테일**: 스크롤 0% → 첫 인물(Saki Nishimura) 큐브 정면. 스크롤 진행 → 큐브가 헥사곤 경로로 슬라이드하며 다음 면 회전 → 배경 이미지 0.5초 페이드 → 가운데 텍스트 단어별 0.4초 슬라이드 아웃·인.
- **응용 후보**: 무신사 시즌 룩북 인물 6명 회전, 라이엇 게임즈 챔피언 비주얼 큐브, 현대카드 슈퍼콘서트 라인업 회전 갤러리. *Webflow 클론도 제공되어 디자이너가 개발자 없이 한 번 만져볼 수 있는 게 장점.*
- **캡처 URL**: 데모 페이지 자체 캡처

## 7. GSAP Scroll-Driven SVG Map — 지도 위 스크롤 카메라

- **URL**: https://tympanus.net/Tutorials/ScrollMap/ (라이브 데모), https://codepen.io/creativeocean/pen/myOVZYO (CodePen 소스), https://tympanus.net/codrops/2026/05/21/creating-scroll-driven-svg-map-animations-with-gsap/ (제작기)
- **어디서 발견**: Codrops 2026-05-21
- **카테고리**: 인터랙션 데모 / 지도 스토리텔링
- **이 데모가 가능하게 하는 시안**: 지도 SVG 위에 *경로가 스크롤 따라 그려지고*, 끝점에 도착한 점을 *카메라가 따라다니며 줌인*. 자전거 코스, 배달 동선, 여행 경로 같은 *공간 스토리텔링*이 비디오 없이 가능.
- **핵심 기술**: GSAP ScrollTrigger pin + scrub, SVG path stroke-dashoffset 드로잉, 끝점 dot의 translate, viewBox 스케일 조정으로 줌인 카메라 효과, 양방향 스크럽(거꾸로 올리면 거꾸로 되감김).
- **장면 디테일**: 스크롤 시작 → Charleston SC 지도 줌아웃 상태 → 스크롤 진행 → 자전거 경로가 한 획씩 그어짐, 점이 끝을 따라감 → 카메라가 점을 따라가며 점차 확대 → 마지막에 도착점 클로즈업.
- **응용 후보**: 배민 라이더 동선 인포그래픽, 카카오맵 신규 지하철역 안내 캠페인, 한진택배 배송 추적 페이지의 경로 시각화, 제주관광공사 코스 추천 마이크로사이트. *지도 데이터만 있으면 한국 서비스에 거의 그대로 이식 가능.*
- **캡처 URL**: 데모 페이지 직접 캡처

## 8. HTML-in-Canvas API — 3D 안에 진짜 HTML

- **URL**: https://chrome.dev/html-in-canvas/demos/webgl-book-curl.html (3D 책 페이지 컬), https://chrome.dev/html-in-canvas/demos/billboard.html (3D 빌보드), https://developer.chrome.com/blog/html-in-canvas-origin-trial (소개)
- **어디서 발견**: Chrome for Developers 2026-05-19 origin trial 발표
- **카테고리**: CSS·HTML 신기능 / 3D + DOM
- **이 데모가 가능하게 하는 시안**: 3D 씬 안에 *진짜 HTML*을 그릴 수 있어 — 텍스트 선택, Ctrl+F 검색, 스크린리더 모두 동작. 3D 책 데모에서 셜록홈즈 텍스트를 *드래그로 선택해 복사*할 수 있다.
- **핵심 기술**: `chrome://flags/#canvas-draw-element` 활성화 (Chrome Canary 149+), origin trial Chrome 148-150. WebGL/WebGPU 텍스처로 DOM을 렌더.
- **장면 디테일**: ① 책 데모 — 화살표/드래그로 페이지 넘김 시 모서리가 컬되며 다음 페이지 노출, 표시되는 텍스트는 selectable ② 빌보드 데모 — 3D 공간 속 빌보드에 Gemini·Meet 스크리블 같은 진짜 UI가 박혀 인터랙티브 ③ 굴절 타이포 — 3D 효과로 휘어진 글자도 검색/선택 가능.
- **응용 후보**: 무신사 신상 인터랙티브 룩북(3D 책처럼 넘김 + 상품명 검색·복사 가능), 토스 연말정산 안내의 3D 봉투 안 텍스트, 라인 프렌즈 스토어의 3D 진열장 안 상품명 selectable. *지금은 origin trial 단계라 프로토타입·캠페인용. 정식 채택 전 사양 변경 가능성 명시 필요.*
- **캡처 URL**: 각 데모 페이지 직접 캡처

## 9. Virtuoso Data Table — Shadcn 기반 가상화 테이블

- **URL**: https://virtuoso.dev/data-table/ (문서·코드), https://news.ycombinator.com/item?id=ShowHN (Show HN 게시)
- **어디서 발견**: Show HN 최근
- **카테고리**: 컴포넌트 라이브러리 / 데이터 UI
- **이 데모가 가능하게 하는 시안**: 행·열 양쪽 가상화 + 컬럼 리사이즈/리오더/숨김/스티키 + 그룹 행이 *하나의 컴포넌트*에 다 들어있어, 디자이너가 시안에서 "이 정도 자유도 있는 테이블" 그려도 개발자가 OK 가능.
- **핵심 기술**: 행·열 듀얼 가상화, 로컬/리모트 데이터 모델, 상태 영속(컬럼 폭·순서 저장), 스티키 컬럼, 그룹 행 렌더, Shadcn(Radix + Tailwind) 베이스라 디자인 토큰 커스텀 자유.
- **장면 디테일**: 문서 예시 — name/category/price/stock 컬럼의 상품 테이블. 컬럼 헤더 드래그 리사이즈, 우클릭으로 숨김, 좌측 name 컬럼 가로 스크롤 시 sticky. `Intl.NumberFormat`으로 통화/숫자 포매팅.
- **응용 후보**: 토스 증권 호가창 (행·열 모두 많음), 쿠팡 셀러 어드민 상품 관리, 카카오 비즈니스 광고 성과 표, 무신사 입점 브랜드 매출 대시보드. *디자이너가 시안 단계에서 "스티키 컬럼은 어디까지", "그룹 헤더 동작" 같은 디테일을 컴포넌트 데모 보며 그릴 수 있는 게 핵심.*
- **캡처 URL**: 문서 페이지 직접 캡처

## 10. Draw on a Map — URL fragment로 공유하는 지도 낙서

- **URL**: https://drawonamap.com/
- **어디서 발견**: Show HN 최근
- **카테고리**: 디자이너 본인 도구 / 공유 패턴 레퍼런스
- **이 데모가 가능하게 하는 시안**: 가입 없이 *URL 안에 데이터를 다 넣어* 공유. 디자이너가 "공유" 기능 시안 그릴 때 *계정·서버 없이 URL fragment만으로* 어디까지 가능한지 보여주는 살아있는 예시.
- **핵심 기술**: OpenStreetMap 베이스, Cloudflare 호스팅, 도형(자유·선·화살·원), 반경 서클, 다단계 경로 색 분리, iframe 임베드 코드 생성, 키보드 단축(1-7: 도구 / 스페이스: 팬 / Ctrl+Z: 언두).
- **장면 디테일**: 위치 검색 → 도구 선택 → 마우스로 그리기 → Share 버튼 클릭 → 그림+위치가 인코딩된 링크 클립보드. 모바일 브라우저(앱 설치 X)에서도 그대로 동작.
- **응용 후보**: 토스 가게 위치 공유 ("여기 좌석 추천드려요" 같은 사용자간 공유), 당근 동네지도 게시물(가입 없이 비회원도 보기), 카카오맵 친구에게 코스 공유 UX의 가입 없이 흐름 검증, 배민 라이더 배달 구역 시각화. *"공유"가 곧 *데이터*인 패턴 — 백엔드 부담 0.*
- **캡처 URL**: 사이트 og:image

---

## 자체 평가

한국 UIUX 디자이너가 다음 시안 그릴 때 진짜 끌어다 쓸 만한가 — **8/10**. ★ 5개 중 sibling-index와 Gap decorations는 *이번 주 안에* 시안에 반영 가능한 직접적 도구이고, shader.se·masaigon.space·ProtoPie는 *시안 패러다임 자체*를 흔드는 강한 레퍼런스. CodePen 계열 직접 폴링이 403으로 막혔지만 Smashing의 CodePen 임베드 한 건과 Codrops 데모로 충분히 보완됨.
