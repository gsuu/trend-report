## interaction-engineer

평가 대상: `runs/2026-06-04/magazine/shortlist-20-30.md` (DEV 22 / DESIGN 18 / SERVICE 6). 인터랙션 구현 관점으로만 분해. 근거는 각 항목 원문·명세 링크.

### ① 바로 쓸 것 (데모/명세 + 패턴 + 우리 화면 적용 지점)

- **DEV-5 contrast-color() — Baseline Newly Available(2026.4)**
  명세: https://smashingmagazine.com/2026/05/building-self-correcting-color-systems-contrast-color/
  Chrome 147 / FF 146 / Safari 26.0 안정판 모두 들어와 **폴백 부담이 가장 작은 즉시 채택 후보**. 패턴: `color: contrast-color(var(--badge-bg))`.
  적용 지점: PLP 세일/뱃지 칩, 컬러 스와치 위 텍스트 — 상품 색상이 동적으로 바뀌는 영역에서 가독 텍스트 자동 산출. 단 **출력이 흑/백 이산값이라 transition 시 ~18% 휘도에서 스냅**되므로 hover 색전환에 끼우지 말고 정적 토큰에만 쓴다.

- **DEV-6 sibling-index() / sibling-count() 스태거**
  명세: https://smashingmagazine.com/2026/05/mathematical-layouts-sibling-index-sibling-count/
  `animation-delay: calc(sibling-index() * 60ms)` 한 줄로 `:nth-child` 하드코딩 없는 스태거.
  적용 지점: PLP 그리드 카드 진입, 필터 드로어 칩 순차 등장. **Firefox 미구현 → `@supports`로 감싸고 미지원 시 딜레이 0(동시 등장)으로 degrade**. `display:none` 항목도 카운트에 포함되는 한계는 무한스크롤 append 구조에서 확인 필요.

- **DEV-8 Cross-Document View Transitions (MPA)**
  명세: https://css-tricks.com/cross-document-view-transitions-part-2/
  `view-transition-class` + `pageswap`/`pagereveal`에서 동적 명명 → 셀렉터 폭증 없이 수백 카드 확장. 모든 모션을 `@media (prefers-reduced-motion: no-preference)`로 감싸 접근성 기본 확보, 미지원 브라우저는 일반 내비로 점진 향상.
  적용 지점: **PLP → PDP 썸네일 모핑 전환** (패션 커머스 핵심 동선). 우리 사이트가 Astro(MPA)라 라우팅 교체 없이 적용 가능 — 이 호 DEV의 최우선 실전 항목.

- **DEV-7 State of CSS Centering 2026 + anchor positioning**
  명세: https://css-tricks.com/the-state-of-css-centering-in-2026/
  `place-content: safe center`(오버플로 잘림 방지), `inset:0 + place-self:center`로 absolute 정렬 대체.
  적용 지점: 긴 상품명/다국어 라벨이 컨테이너를 넘칠 때 잘림 방지 — 유틸 클래스 정비에 바로 반영. safe 정렬은 사실상 폴백 불필요(미지원 시 일반 center로 무해 degrade).

- **DEV-3 ::search-text**
  명세: https://css-tricks.com/almanac/pseudo-selectors/s/search-text/
  진행성 향상의 교과서 케이스 — 미지원 시 브라우저 기본 하이라이트로 무해 degrade라 **폴백 코스트 0**. 적용 지점: 사이즈/소재 가이드 등 긴 PDP 콘텐츠의 인페이지 찾기. 단 대비 4.5:1 유지, 배경색 대신 `text-decoration` 권장(접근성).

### ② 지켜볼 것 / 경고 (Baseline 미달·폴백 필수)

- **DEV-1 @function** — Chrome 148+ 제한 지원, 단일 엔진. `@supports (at-rule(@function))` 감지 필수. SCSS 함수 대체는 시기상조, 토큰 계산은 당분간 빌드타임(SCSS/PostCSS) 유지. 데모 학습용으로만.
- **DEV-11 offset-path** — 실제 동작하는 값이 `path()`·`none`뿐(shape/polygon 등 미동작). 경로 애니메이션 가능하나 표현 폭 좁음 + `prefers-reduced-motion` 가드 필수. 모션 로고 한정 실험.
- **DEV-16 letter-spacing 리빌** — `letter-spacing: -1ch` 겹침 트릭은 **한국어/CJK에서 자소 폭이 달라 깨질 위험**. 한국어 히어로 카피에 쓰려면 별도 검증 필요(영문 데모만 존재). 보류.
- **DEV-17 ::checkmark / border-shape** — ::checkmark는 폼 체크마크 스타일링에 매력적이나 신기능, FF 151 컨테이너 스타일 쿼리도 막 Baseline 진입. 폼 컴포넌트 도입은 분기별 Baseline 재확인 후.
- **DEV-14 Safari TP 244 anchor positioning(normal/none, transform 인식)** — 아직 Technology Preview. 앵커 포지셔닝(드롭다운/툴팁) 본격 적용 전 Safari 정식판 도달 대기. drawFocusIfNeeded VoiceOver 수정은 canvas 포커스 검수 체크리스트에 메모.
- **DEV-9 MWG/LLM 생성 코드 WCAG 위반** — 경고성 항목. AI가 뽑은 아코디언이 WCAG 위반 + Firefox에서 애니 미동작 실증. **우리 AI 생성 마크업은 반드시 접근성 수동 검수 통과 후 머지** — 가드라인 근거로 채택.
- **DEV-19 PolyCSS(DOM 3D)** — 폴리곤=DOM 요소라 노드 폭증 → 모바일 성능·접근성 리스크. 프로덕션 부적합, 실험/캠페인 단발성만.

### ③ 측장(senior-publisher)에게 넘길 쟁점 (팀 결정 필요)

- **컴포넌트 CSS Baseline 기준선 갱신 시점** — DEV-4(`:open` Baseline, container-type 없는 컨테이너 쿼리), DEV-5(contrast-color Baseline), DEV-8(View Transitions)이 한 번에 Baseline에 진입. 우리 디자인시스템 CSS 기준선을 언제 일괄 올릴지 팀 결정 필요. `details[open]` → `:open` 마이그레이션 범위 포함.
- **View Transitions를 디자인시스템 표준 전환으로 승격할지** — DEV-8은 Astro MPA 구조와 정합. PLP↔PDP 전환을 1회성 구현이 아니라 토큰화된 표준 모션으로 둘지(모션 토큰 + reduced-motion 정책 일원화) 측장·디자인 조율 사안.
- **모션 접근성 정책 일원화** — sibling-index 스태거/View Transitions/offset-path 모두 `prefers-reduced-motion` 가드가 개별 산재. 팀 차원 단일 모션 정책(전역 가드 믹스인 + 60fps·레이아웃 스래싱 기준) 수립 제안.
- **Angular Aria(DEV-13) 참조 범위** — 12개 UI 패턴 접근성 프리미티브. 우리 스택은 아니지만 폼/접근성 컴포넌트 명세 레퍼런스로 볼지, 글로 다룰지 측장 판단.
- **DESIGN-13 회전→꽃 변형 레터폼 모션** — 인터랙션 구현 가능성(SVG morph/offset-path) 있으나 디자인 발상 단계. 퍼블 구현 난이도 코멘트를 디자인 담당과 합칠지.

### 한 줄 총평
이 호 DEV는 **즉시 채택 가능한 Baseline 도달 CSS(contrast-color·View Transitions·safe centering·::search-text)와 폴백 필수 실험 기능이 선명하게 갈린다** — Astro MPA 구조 덕에 Cross-Document View Transitions의 PLP→PDP 전환이 가장 실전 가치 높고, 나머지는 `@supports`/`prefers-reduced-motion` 가드 정책을 팀 차원에서 먼저 합의해야 산발 적용을 막는다.
