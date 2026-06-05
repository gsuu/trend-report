# 웹퍼블리셔 어벤저스 — 측장 종합 (2026-06-04)

## 한 줄 총평
이 호 DEV는 **Baseline 도달 CSS(contrast-color·:open·safe center·::search-text)와 폴백 필수 실험기능이 선명하게 갈렸고**, 우리 환경(Astro MPA + iOS Safari 비중)에 가장 실전 가치가 높은 건 Cross-Document View Transitions의 PLP→PDP 전환이다. 다만 4명 정찰병이 한목소리로 짚은 두 가지 — **contrast-color() 채택 범위**와 **AI 생성 마크업 a11y 게이트** — 는 산발 적용을 막으려면 측장 레벨에서 룰로 못 박아야 하는 거버넌스 쟁점이다.

---

## 4명 합의·충돌 정리

### 만장일치 P0 (4명 중 3명 이상 채택)
| 항목 | interaction | a11y | css-scout | systemizer | 합의 |
|---|---|---|---|---|---|
| **DEV-5 contrast-color()** | ① 즉시 | ①조건부 P0 | ① 가장 확실 | ① 토큰 흡수 P0 | **채택, 단 조건부** |
| **DEV-8 Cross-Doc View Transitions** | ① 최우선 실전 | ① a11y 모범 | ② 보너스 모션 | ③ 비용 큼 | **채택, 표준 승격은 쟁점** |
| **DEV-9 AI 마크업 WCAG 위반** | ② 가드라인 근거 | ① P0 | (범위 밖) | ③ 거버넌스 | **a11y 게이트 명문화** |
| **DEV-7 safe center** | ① 바로 | — | ① 즉시 가치 | ① 유틸 정비 | **채택, 폴백 불필요** |
| **DEV-4 :open** | ③ 기준선 갱신 | — | ① Baseline | ① 기준선 문서 | **채택, 점진** |
| **DEV-3 ::search-text** | ① 폴백코스트0 | ① P0 | ② Baseline 아님 | — | **채택, 대비 4.5:1 조건** |

### 충돌 ① — contrast-color() 채택 "범위"
- **interaction / css-scout / systemizer**: 정적 토큰엔 OK, 모션 동반 컬러(hover 배경 전환)엔 NO. 18% 휘도 스냅 때문.
- **a11y-guardian**: 한 발 더 나감 — "contrast-color()는 흑/백 중 나은 쪽을 줄 뿐 4.5:1 보장 아님. 경계 색(중간 톤 그레이·카키·더스티 핑크 등 패션 빈출)은 가까스로 미달일 수 있다." → **출력값 자동 감사 스크립트 필수** + 디자인 팔레트에서 18% 경계 색 사전 배제 검토.
- **측장 조정안**: 셋 다 맞다. 합쳐서 **3단 게이트로 채택**한다 — (1) 정적 토큰에만 적용(transition·hover 색 전환 금지), (2) `--brand-*` 팔레트 중 17~19% 휘도 경계 색은 디자이너와 사전 협의해 배제하거나 강제 흑/백 오버라이드, (3) CI에 출력값 4.5:1 재측정 감사 스크립트를 붙여 경계 색 회귀를 잡는다. 감사 없이 토큰 레이어에 흡수하는 건 보류.

### 충돌 ② — AI 생성 마크업 a11y 게이트 vs AI-ready 디자인시스템
- **a11y / interaction / systemizer**: DEV-9(Roselli) 근거로 "LLM/MWG 생성 컴포넌트는 a11y 검수 통과 전 머지 금지" 룰 명문화.
- **systemizer**가 정면 충돌 지점을 정확히 짚음: DESIGN-2(AI-ready 디자인시스템)는 "AI가 읽게 만들자"이고 DEV-9는 "AI가 쓴 건 못 믿는다"라 같은 거버넌스 축에서 정반대로 당긴다.
- **측장 조정안**: 충돌이 아니라 **한 정책의 양면**으로 묶는다 — *"AI가 읽게 만들되(input: spec·토큰·FigmaLint), AI가 쓴 건 사람이 a11y 검수(output: WCAG 게이트)"*. 라이브러리 기여 규칙에 "AI 생성 마크업 PR은 키보드·스크린리더(NVDA/센스리더) 수동 검수 체크박스 통과 전 머지 불가"를 추가. 기획·디자인이 AI 프로토타입을 늘리는 흐름과는 "프로토타입은 자유, 라이브러리 머지는 게이트"로 경계를 그어 마찰 최소화.

### 충돌 ③ — sibling-index() 채택 수위
- **interaction / systemizer**: 모션 한정 점진 채택(`@supports` + Firefox는 동시 등장 degrade).
- **css-scout**: 더 신중 — 모션 용도는 OK지만 **레이아웃 계산(calc(sibling-count())로 폭 분할) 용도는 Firefox에서 깨지니 보류**.
- **측장 조정안**: css-scout가 맞다. **장식 모션 한정 채택, 레이아웃 의존 금지**로 못 박는다. `display:none` 항목 카운트 포함 한계는 무한스크롤 append 구조에서 별도 검증.

---

## 측장 우선순위 TOP 3 액션

### ★ ACTION 1 — Cross-Document View Transitions를 PLP→PDP 표준 전환으로 파일럿 (DEV-8)
- **왜 1순위**: 우리 사이트가 Astro(MPA)라 라우팅 교체 없이 적용 가능 = 이 호에서 우리 구조와 가장 정합한 단 하나의 실전 항목. 패션 커머스 핵심 동선(목록→상세 썸네일 모핑)에 직격.
- **실행**: `view-transition-class` + `pageswap`/`pagereveal` 동적 명명으로 1개 카테고리(예: 모자/PLP)에 파일럿. 모든 모션을 `@media (prefers-reduced-motion: no-preference)`로 감싸 a11y 기본 확보, 미지원 브라우저는 일반 내비 점진 향상. iOS Safari는 미성숙이라 **"있으면 보너스" 모션으로만** 깔되 폴백 동작 필수 확인.
- **선결 쟁점**: 1회성 구현이 아니라 **모션 토큰 + reduced-motion 전역 정책으로 표준화**할지 디자인과 조율. → ACTION 3과 묶음.

### ★ ACTION 2 — contrast-color() 3단 게이트 + AI 마크업 a11y 게이트 동시 명문화
- **왜 2순위**: 4명이 가장 많이 언급한 두 항목이자, 룰 없이 풀면 산발 적용·회귀로 깨질 거버넌스 사안. 둘 다 "퍼블리셔 가드라인 문서"라는 한 산출물에 들어가므로 함께 처리.
- **실행 A (contrast-color)**: 위 충돌① 3단 게이트(정적 토큰 한정 + 경계 색 배제 + CI 감사 스크립트) 적용. 배지·세일 칩·컬러 스와치 위 텍스트부터.
- **실행 B (AI 게이트)**: 위 충돌② "읽게 만들되 쓴 건 검수" 양면 정책을 라이브러리 기여 규칙에 추가. DEV-9(Roselli) + DEV-2(Meyer 분할 표 헤더) + DESIGN-2(AI-ready)를 한 매거진 묶음으로 엮어 근거 제시.

### ★ ACTION 3 — 모션·기준선 정책 일원화 (전역 reduced-motion 믹스인 + CSS Baseline 일괄 갱신)
- **왜 3순위**: sibling-index 스태거·View Transitions·offset-path·::search-text 모두 `prefers-reduced-motion`·`@supports` 가드가 개별 산재. 동시에 DEV-4(:open)·DEV-5·DEV-8이 한 번에 Baseline 진입해 디자인시스템 CSS 기준선 갱신 타이밍이 왔다.
- **실행**: (1) 전역 모션 가드 믹스인 + 60fps·레이아웃 스래싱 기준을 단일 정책으로 수립, (2) `details[open]` → `:open` 마이그레이션 범위 포함해 컴포넌트 CSS 기준선 문서를 일괄 갱신, (3) `safe center` 유틸 클래스 정비(긴 한글 상품명 잘림 방지)를 같은 PR에 묶음.
- **보류 명시**: `@function`(Chrome 148 단독)·`@custom-media`(네이티브 미지원)는 토큰/빌드 파이프라인 영향이 커 이번 갱신에서 **제외, SCSS/PostCSS 유지**. 관망.

---

## 다음 회차 wish list (한국 환경 적용성 명시)
1. **contrast-color() 한국 패션 팔레트 경계 색 실측** — 더스티 핑크·카키·뮤트 그레이 등 K패션 빈출 중간 톤이 18% 휘도 경계에서 흑/백 스냅·4.5:1 미달하는지 직접 측정한 사례.
2. **Cross-Document View Transitions iOS Safari 폴백 라이브 케이스** — 한국 모바일 iOS 절반 환경에서 미성숙 VT가 일반 내비로 degrade될 때 깜빡임·스크롤 위치 유실 없는지 실측.
3. **한국어 스크린리더(NVDA·센스리더) 분할 표 헤더·타이포 모션 실측** — DEV-2(사이즈×색상 매트릭스 표)·DEV-16(letter-spacing 리빌) 한국어 음절·자모 폭에서 ch 단위 어긋남·조기 읽기 검증.
4. **한국 회사 AI 생성 마크업 a11y 검수 운영기** — 토스·당근·네이버 a11y 블로그에서 LLM 생성 컴포넌트 머지 게이트를 실제로 돌린 사례 (Roselli 영어권 일반론의 한국판).
5. **패션 커머스 컴포넌트 키보드 접근 라이브 케이스** — 사이즈 차트 툴팁·컬러 스왓치·필터 드로어의 키보드 순회·`aria-pressed`·상태 메시지(4.1.3) 실측 (SERVICE-3 "단순 버튼 뒤 AI" 함정 직결).

## 시스템 한 가지 제안
지난 회차 publisher 메모리에 남긴 **"매거진 dev = AI 뉴스 / references/dev = 진짜 dev 라이브 데모 단절"** 패턴이 이번 호에선 역전됐다 — DEV 22건이 거의 다 CSS·플랫폼·a11y 본업 항목이고 AI 도구 비교(#20·21 Copilot·#22 Vercel Blob)는 꼬리로 밀렸다. 이 흐름을 유지하려면 **shortlist의 각 DEV 항목에 "코드 위치 필드"와 "Baseline 단계"를 필수 메타로 강제**하고, 둘 다 비면 자동으로 `수집했지만 제외` 후보로 내리는 게이트를 digest-collect Phase에 넣자. 이번 호는 명세·CodePen 링크 확보율이 높아 그대로 매거진 dev에 승격 가능하다.

---
---

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

---

## a11y-guardian

웹접근성 시점에서 2026-06-04 shortlist를 ①바로 쓸 것 ②함정 경고 ③측장(senior-publisher)에게 넘길 쟁점으로 분해한다. 구체 WCAG 항목·화면 근거 명시.

---

### ① 바로 쓸 것 (접근성 이득 명확)

**DEV-2. Accessible Split-Cell Table Headers (Eric Meyer) — P0, 최우선 채택**
- 이득: 대각선 분할 표 헤더라는 패션 커머스 빈출 패턴(사이즈×색상 매트릭스 표, 배송/반품 정책 표)을 **WCAG 1.3.3 정보와 관계** 기준으로 마크업하는 실전 레퍼런스. Alice Boxhall·Adrian Roselli가 "불완전한 행(incomplete row)은 1.3.3 위반"이라 지적해 `rowspan="2"` 해법으로 고친 과정이 그대로 우리 가드라인 문단이 된다.
- 실측 가치: Safari가 `thead`에 relative positioning을 안 먹어 `@supports`로 우회한 부분 — NVDA/VoiceOver 셀 헤더 연결 읽기를 우리가 직접 재현 검증할 거리. 영어권 일반론이 아니라 스크린리더 표 탐색 실측으로 끌고 갈 수 있다.
- 적용 화면: 상품상세 사이즈표, 마이페이지 주문/배송 표.

**DEV-9. Maybe Don't Rely on Google's "Modern Web Guidance" (Adrian Roselli) — P0, 채택**
- 이득: MWG로 생성한 아코디언이 **WCAG 위반 + Firefox에서 동작 안 함**을 실증. 우리 팀이 LLM/AI 생성 마크업을 늘리는 흐름에서 "AI 산출물은 접근성 검수를 통과해야 머지"라는 가드라인의 직접 근거. 토스트 알림 패턴 접근성 누락 지적은 우리 알림/스낵바 컴포넌트(4.1.3 상태 메시지) 점검과 직결.
- 적용 화면: 아코디언(FAQ·필터 드로어), 토스트/스낵바(장바구니 담김 알림).

**DEV-13. Angular v22 — Angular Aria (12개 UI 패턴 접근성 프리미티브) — P1, 레퍼런스로 채택**
- 이득: 우리가 Angular를 안 써도, **검증된 접근성 프리미티브 12개 패턴 목록**(combobox, listbox, tabs, menu 등으로 추정)이 우리 컴포넌트 라이브러리 a11y 커버리지 체크리스트로 역참조 가능. WCAG 2.1.1·4.1.2의 ARIA 패턴 합의 기준점.
- 단, 핵심은 "어떤 패턴을 다루나" 목록이지 Angular 도입이 아님 — 글에서 프레임워크 종속처럼 쓰면 안 됨.

**DEV-14. Safari TP 244 — drawFocusIfNeeded VoiceOver 커서 위치 버그 수정 — P1, 채택**
- 이득: canvas 인터랙션(시그니처 패드, 좌석/매장맵, 커스텀 차트)의 **포커스 위치를 VoiceOver에 알리는 2.4.7 포커스 표시·4.1.2** 핵심 API 버그 수정. 우리가 canvas 기반 인터랙티브를 쓸 때 "Safari 버전별로 VoiceOver 포커스가 어긋날 수 있다"는 실측 경고의 근거.

**DEV-5. contrast-color() 자가 교정 컬러 시스템 — P0, 조건부 채택 (아래 함정 참조)**
- 이득: 브랜드 색 토큰에 흑/백 텍스트를 자동 반환해 **WCAG 1.4.3 명도 대비 4.5:1** 자동화 가능. 디자이너 180명이 매번 빠뜨리는 칩/배지/버튼 텍스트 대비를 토큰 레벨에서 강제할 수 있는 신문법. Baseline Newly Available(2026-04) 도달했으니 점진 적용 명분 충분.

**DEV-3. ::search-text — P0, 채택**
- 이득: 원문이 이미 **대비 4.5:1 유지 + 과한 색 변경 대신 text-decoration 권장**을 명시. 인페이지 검색 하이라이트가 색만으로 정보 전달(WCAG 1.4.1 색 사용)하지 않도록 하는 가드라인. `::search-text:current`로 현재 일치 항목 구분 — 1.4.11 비텍스트 대비도 함께 봐야 함.

**DEV-8. Cross-Document View Transitions — P0, 채택 (접근성 처리 모범)**
- 이득: 모든 애니메이션을 `@media (prefers-reduced-motion: no-preference)`로 감싼 점이 **WCAG 2.3.3 인터랙션 애니메이션 / 2.2.2 일시정지** 모범. 우리 페이지 전환 모션 기준에 그대로 인용.

---

### ② 함정 경고 (이대로 따라 하면 깨짐)

**DEV-5. contrast-color() — 출력이 이산값(흑/백)이라 경계 케이스 위험**
- 함정: 약 18% 휘도 지점에서 흑→백으로 스냅. 브랜드 색이 그 경계 근처(중간 톤 그레이·카키·더스티 핑크 등 패션 빈출 색)면 호버/상태 전환 시 텍스트가 흰↔검 점프하고, **경계에서 4.5:1을 가까스로 넘는 색은 실제 미달일 수 있음**. contrast-color()가 "검정 또는 흰색 중 더 나은 쪽"을 줄 뿐 4.5:1 보장은 아님 — 출력값을 자동 감사 스크립트로 재측정해야 함. transition으로 색 페이드 거는 디자인은 깨진다.

**DEV-16. Revealing Text With letter-spacing — 한국어 IME·스크린리더 위험**
- 함정: `letter-spacing: -1ch` + `color: transparent`로 글자를 겹쳐 숨겼다 드러내는 효과. (a) 시각적으로 숨겨도 **DOM 텍스트는 스크린리더가 그대로 읽음** → 인트로 모션 중 NVDA/센스리더가 카피를 미리 다 읽어버리는 부조화. (b) `-1ch`/`-2ch` 음수 자간은 라틴 1글자=1ch 가정 — **한국어 음절·한자 혼용에서 ch 단위가 안 맞아 겹침이 어긋남**. (c) `text-indent`+`overflow:clip`으로 화면 밖 밀어내기는 1.4.4 텍스트 크기 조정/리플로 시 깨질 수 있음. 히어로 카피에 쓰려면 한국어 실측 필수, `prefers-reduced-motion` 가드 + `aria-hidden`/순차 노출 설계 동반 조건.

**SERVICE-3. 무신사 "단순 필터 버튼 UI" 추천 — 라벨·상태 누락 위험**
- 함정: "프론트는 단순 필터 버튼, 뒤단은 복잡한 AI"라는 구조를 그대로 옮기면, 필터 버튼이 **토글 상태(`aria-pressed`)·결과 변경 알림(4.1.3 상태 메시지)·필터 적용 후 포커스 관리**를 빠뜨리기 쉽다. "선제적 큐레이션"으로 결과가 사용자 행동 없이 바뀌면 스크린리더 사용자에게 변화 고지 안 됨. WCAG 4.1.2·4.1.3·2.4.3 점검 필수.

**SERVICE-1/5. ChatGPT·Gemini 외부 AI → 상품상세 전환 화면**
- 함정: 외부 AI에서 넘어온 진입 화면이 우리 통제 밖 컨텍스트에서 시작 → 진입 직후 **페이지 제목(2.4.2)·랜드마크·포커스 시작 위치**가 정의 안 되면 스크린리더 사용자는 어디 도착했는지 모름. 추천 3~4개 vs 11~12개(SERVICE-5) 노출 개수 논쟁은 a11y 관점에선 "각 추천 카드가 키보드로 순회 가능하고 1.3.1 구조가 잡혀 있나"가 먼저.

**DEV-19. PolyCSS (DOM 3D 메시) — 접근성 지뢰**
- 함정: 각 폴리곤이 실제 DOM 요소 → 수백~수천 개 DOM 노드가 스크린리더 접근성 트리에 노출되면 **탐색 불가능 수준의 노이즈**. 클릭 핸들러 붙는다고 키보드 접근(2.1.1)·역할 정의(4.1.2) 되는 것 아님. 쓰려면 장식 메시는 `aria-hidden="true"`, 인터랙션은 별도 접근 가능 컨트롤 제공이 전제. "접근성·성능 트레이드오프" 점검 질문 그대로 경고 대상.

**DESIGN-4. 인터브랜드 극단적 좁은 커닝 / DESIGN-1. 구글 아이콘 고유색 복귀**
- 함정(맥락 제공용): 좁은 커닝 워드마크가 작은 스케일에서 "한 덩어리"로 읽히는 건 **1.4.3/저시력 가독성** 문제와 같은 축. 구글 아이콘 고유색 복귀는 "색만으로 서비스 구분"(1.4.1)의 반례 — 색+실루엣 병행이 정답이라는 a11y 논거로 인용 가능.

---

### ③ 측장(senior-publisher)에게 넘길 쟁점 (디자인·기획 합의 필요)

1. **contrast-color() 토큰 도입 범위 (DEV-5)** — 디자인시스템 토큰에 자동 대비를 넣을지, 넣는다면 18% 경계 색을 디자인 팔레트에서 사전 배제할지. 디자이너와 합의 + 감사 스크립트(자동 4.5:1 재측정) 동반 여부 결정.

2. **AI 생성 마크업 접근성 게이트 (DEV-9)** — Roselli 사례를 근거로 "LLM/MWG 생성 컴포넌트는 a11y 검수 통과 전 머지 금지" 룰을 퍼블리셔 가드라인에 명문화할지. 기획·디자인이 AI로 프로토타입을 늘리는 흐름과 충돌 지점 조율.

3. **필터·선제 큐레이션의 상태 고지 표준 (SERVICE-3)** — "단순 버튼 UI 뒤 AI" 패턴을 쓸 때 결과 변경을 어떻게 고지할지(`aria-live` 정책), 사용자 행동 없이 바뀌는 추천을 어디까지 허용할지 — 기획과 합의 필요.

4. **모션 효과의 한국어·스크린리더 기준선 (DEV-16, DEV-8)** — 히어로 카피 리빌 등 타이포 모션을 도입할 때 `prefers-reduced-motion` 의무화 + 한국어 실측(NVDA/센스리더 조기 읽기, ch 단위 어긋남) 통과를 디자인 발주 단계 체크리스트에 넣을지.

5. **canvas/3D 인터랙션 접근성 정책 (DEV-14, DEV-19)** — canvas·PolyCSS류 표현을 채택할 때 장식(aria-hidden)/기능(대체 컨트롤) 분리 원칙과 Safari 버전별 VoiceOver 회귀 테스트를 정식 QA 항목으로 둘지.

---

**총평:** DEV-2(분할 표 헤더)·DEV-9(AI 마크업 접근성)·DEV-5(contrast-color 자동 대비)는 우리 a11y 가드라인을 실측 근거로 끌어올릴 P0 알짜이고, DEV-16 타이포 모션과 SERVICE-3 "단순 버튼 뒤 AI"는 한국어 스크린리더·상태 고지에서 그대로 깨질 함정이니 측장이 검수 룰로 못 박아야 한다.

---

## css-platform-scout

2026-06-04 shortlist DEV 22건 중 CSS·웹플랫폼 문법을 지원 단계·폴백 기준으로 분해. 판단 축은 "지금 패션 커머스 프로덕션에 깔아도 되나", 특히 iOS Safari.

---

### ① 채택 가능 — 지금 써도 됨 (Baseline + 적용 지점)

**#5 contrast-color()** — 가장 확실한 채택 후보.
- 지원: Chrome 147 / Firefox 146 / Safari 26.0 안정판. **2026-04 Baseline Newly Available** 도달 — 3대 엔진 모두 들어왔다.
- 적용: 브랜드 컬러 토큰 위에 얹는 텍스트(배지·태그·세일 칩·할인 라벨)의 흑/백 자동 결정. 디자이너가 색 바꿀 때마다 텍스트 대비 수동 검수하던 걸 제거.
- 주의(측장 검토 가치): 출력이 이산값이라 transition 시 ~18% 휘도에서 색이 스냅됨. 호버로 배경색이 부드럽게 변하는 컴포넌트엔 부적합. **정적 토큰 자동화엔 OK, 모션 동반 컬러엔 NO.**
- 폴백: Newly available이라 폴백 거의 불필요하나, 구형 잔존 브라우저 대비 `color: #fff;` 기본값 뒤에 `color: contrast-color(...)` 두면 자연 무시됨.

**#7 The State of CSS Centering (place-content: safe center, inset:0 + place-self:center)** — 패턴 정리물.
- 지원: `safe` 정렬 키워드와 place-* 단축은 3대 엔진 안정 지원(widely available 수준). anchor-center만 신문법.
- 적용: 정렬 유틸리티 클래스 정비. 특히 `place-content: safe center`는 긴 한글 상품명·카테고리 라벨이 좁은 칩에서 가운데 정렬로 잘리던 문제를 막아준다 — 커머스에서 즉시 가치.
- 폴백: 불필요. `safe` 미인식 브라우저는 일반 center로 폴백.

**#4 New to the web platform in May — :open 의사 클래스**
- 지원: Safari 26.5 지원으로 `:open`이 **Baseline 진입**. Chrome/Firefox 선행 지원됨.
- 적용: `<details>`/`<dialog>`/picker 열림 상태 스타일링을 `details[open]` 속성 선택자 대신 `:open`으로 통일. FAQ 아코디언·필터 드로어 컴포넌트 CSS 기준선 정리.
- 폴백: `details[open]` 속성 선택자가 여전히 동작하므로, `:open` 도입은 점진. 당장 무리 없음.

---

### ② 준비 단계 — 곧 되지만 폴백 필수

**#6 sibling-index() / sibling-count()** — 가장 쓰고 싶지만 Firefox가 막는다.
- 지원: Chrome/Edge 138(2025.6)·Safari 26.2 지원, **Firefox 미구현**. Baseline 아님.
- 적용: `animation-delay: calc(sibling-index() * 100ms)` — 리스트/그리드 스태거 등장 애니메이션을 `:nth-child()` 나열 없이 한 줄. 상품 카드 그리드 진입 모션에 딱.
- 폴백 필수: Firefox에서 delay가 0이 되어 전부 동시 등장 → 기능 자체는 안 깨지나 모션만 사라짐. 장식 모션이면 `@supports (animation-delay: calc(sibling-index()*1ms))`로 감싸 점진 향상 OK. 단 레이아웃 계산(`calc(sibling-count())`로 폭 분할 등)에 쓰면 Firefox에서 깨지므로 레이아웃 용도는 보류.
- 추가 한계: `display:none` 요소도 카운트에 포함됨(DOM 트리 기반).

**#8 Cross-Document View Transitions (view-transition-class, 동적 명명)**
- 지원: 크로스-도큐먼트 VT는 Chromium 계열 중심. Safari·Firefox 미성숙 — Baseline 아님.
- 적용: MPA 페이지 전환(목록→상세) 모션. `view-transition-class`+와일드카드로 셀렉터 폭증 방지하는 패턴은 설계상 참고 가치 높음.
- 폴백: 미지원 브라우저는 일반 내비게이션으로 자연 점진 향상되고, 모든 모션을 `prefers-reduced-motion`으로 감싸는 전제 — 폴백 설계가 이미 안전. iOS Safari 비중 큰 우리 환경에선 "있으면 좋은 보너스 모션"으로만 채택.

**#11 offset-path**
- 지원: 속성 자체는 폭넓으나 **실동작 값이 사실상 path()·none뿐**. shape()/circle() 등은 미성숙.
- 적용: JS 없는 경로 애니메이션(장바구니 담기 곡선 이동 등). path() 한정으로는 가능.
- 폴백: 장식 모션 한정. 핵심 동선엔 쓰지 말 것.

**#16 letter-spacing 리빌 / #17 ::checkmark·border-shape**
- `letter-spacing`/`color` 자체는 안정. 다만 #16 리빌은 음수 ch 겹침이 **한글(전각·자모 폭 가변)에서 영문처럼 안 겹친다** — 한국어 카피엔 검증 필요(점검 질문이 정확히 짚음). 영문 히어로 한정.
- #17 `::checkmark`는 신문법, `border-shape`+`shape()`도 초기 단계. Firefox 151 컨테이너 스타일 쿼리 Baseline 진입은 호재이나 묶음 신기능 소개라 개별 폴백 필요. 폼 컴포넌트엔 `::checkmark` 먼저 실험하되 기본 체크마크 스타일 유지.

**#3 ::search-text**
- 지원: Pseudo-Elements L4 신문법. 엔진 지원 제한적, Baseline 아님.
- 적용: 긴 콘텐츠 페이지(상품 상세 설명·가이드)의 Ctrl/⌘+F 하이라이트 가독성. background-color·text-decoration만 지원.
- 폴백: 미지원 시 브라우저 기본 하이라이트로 자연 폴백 — 안전. 접근성상 대비 4.5:1·text-decoration 권장 준수가 채택 조건.

---

### ③ 측장(senior-publisher)에게 넘길 쟁점 — 토큰/빌드 파이프라인 영향 큼

**#1 @function (CSS Custom Functions)** — 가장 큰 쟁점.
- 지원: **Chrome 148+ 제한적 단독 지원**, Firefox·Safari 미구현. Baseline 한참 멂.
- 쟁점: SCSS 함수로 짜던 토큰 계산 로직을 순수 CSS로 옮기자는 유혹. 하지만 지금 옮기면 단일 엔진 의존 + 빌드 파이프라인(SCSS/PostCSS) 이중화. **빌드·토큰 운영 영향이 커서 퍼블리셔 단독 결정 불가.** `@supports (at-rule(@function))` 감지 가능하나, 토큰 시스템 근간을 미성숙 문법에 거는 건 측장 판단.
- 권고: 지금은 관망. SCSS 함수 유지.

**#12 @custom-media** — 브레이크포인트 별칭.
- 지원: Media Queries L5. **브라우저 네이티브 지원 거의 없음** — 현실은 PostCSS 플러그인으로 빌드타임 처리.
- 쟁점: `--tablet` 같은 미디어 별칭은 반응형 임계점 운영에 매력적이나, matchMedia()로 JS 접근 불가 + 빌드 의존. 우리 반응형 토큰 체계와 PostCSS 설정을 건드리므로 파이프라인 결정 사항. 측장에게.

**#13 Angular v22 / #15 Astro 6.4 / #18 Astro Markdown / #2 Split-Cell Table(접근성) / #14 Safari TP 244**
- CSS 문법 범위 밖(프레임워크·빌드·접근성 마크업)이라 css-platform-scout 1차 판정 보류, 측장·다른 정찰병으로 라우팅.
- 단 **#2 Eric Meyer 표 헤더**는 CSS 관점에서 한 줄: `linear-gradient` 대각선 + rowspan은 안정 문법이나, **Safari가 thead에 relative positioning을 적용 안 하는 차이**를 벤더별 `@supports`로 우회한 점이 핵심 — 우리 복잡 표 헤더 가드라인에 "Safari thead positioning 예외" 항목으로 박아둘 가치. iOS Safari 영향 직격이라 측장 공유 권장.
- **#14 Safari TP 244**: position-anchor normal/none + transform 인식 앵커 포지셔닝은 아직 TP(정식 아님). 앵커 포지셔닝 자체가 iOS Safari 정식 진입 전이라, 앵커 기반 툴팁/드롭다운은 폴백(absolute fallback) 없이는 아직 NO. 진척 모니터링 대상.

**#19 PolyCSS / #20·21 Copilot / #22 Vercel Blob**: CSS 플랫폼 범위 밖. PolyCSS는 DOM 폴리곤 3D라 흥미롭지만 접근성·성능 트레이드오프가 커 프로덕션 비권장(레퍼런스 흥밋거리).

---

**한 줄 총평**: 지금 깔아도 되는 건 contrast-color()·safe center·:open 셋뿐 — 나머지 화려한 신문법(@function·sibling-index·view transitions)은 Firefox 또는 iOS Safari가 막고 있어 폴백 없이는 전부 보류, @function·@custom-media는 토큰/빌드 파이프라인을 건드리니 측장 결정으로 넘긴다.

---

## component-systemizer

컴포넌트·디자인시스템 핸드오프 관점에서 우리 라이브러리/Storybook에 들어올 구체 경로 중심으로 분해한다.

### ① 시스템에 흡수 — 우리 라이브러리/Storybook에 바로 반영할 패턴

- **DEV 5. contrast-color()** (P0, Baseline Newly Available 도달) — 토큰 레이어에 직접 흡수. `--brand-*` 위 텍스트 색을 `contrast-color(var(--brand))`로 자동화하면 다크/라이트·테마 토큰마다 흑백 텍스트 토큰을 수동 페어링하던 일이 사라진다. 단 출력이 이산값이라 transition 시 18% 휘도에서 스냅 → **상태 전환 컴포넌트(hover/active 배경 변화)에는 쓰지 말고, 정적 페어링에만** 흡수. Storybook에 "토큰 자동 대비" 데코레이터로 케이스화.
- **DEV 6. sibling-index()/sibling-count()** (Chrome/Safari 안정, Firefox 미구현) — 리스트·메뉴·스켈레톤 스태거 모션 컴포넌트의 `:nth-child` 하드코딩을 한 줄로 대체. `@supports`로 감싸 점진 적용. 항목 수에 무관해지므로 동적 리스트 컴포넌트의 모션 props가 단순해진다.
- **DEV 12. @custom-media** + **DEV 7. CSS 정렬(safe center, inset:0+place-self)** — 반응형 토큰(브레이크포인트 별칭)과 정렬 유틸리티 클래스 정비의 직접 재료. `@custom-media --tablet`로 우리 SCSS map 브레이크포인트를 CSS 네이티브 별칭으로 이전, PostCSS 폴백 유지.
- **DEV 4. New to the web platform(:open, 이름 기반 컨테이너 쿼리)** — `:open`으로 details/dialog/select 컴포넌트의 `[open]` 속성 셀렉터를 정리, 컨테이너 쿼리는 `container-type` 보일러플레이트 제거. 우리 컴포넌트 CSS 기준선 문서 업데이트 항목.
- **DEV 17. ::checkmark / DEV 16. letter-spacing 리빌** — 폼 컴포넌트(체크박스·라디오·select)의 커스텀 체크마크를 가상요소 한 줄로 → 기존 SVG 아이콘 오버레이 제거 후보. letter-spacing 리빌은 히어로 모션 패턴으로 Storybook 모션 스토리에 추가하되 한국어 자소 단위에서 `-1ch` 겹침이 깨지므로 검증 필요(점검질문대로 한국어 기준 테스트 선행).

### ② 핸드오프 개선 — 디자이너↔퍼블리셔 마찰 줄이는 지점

- **DESIGN 2. How To Make Your Design System AI-Ready** (P0) — 핵심. spec 파일(MD: 간격/색/컴포넌트 규칙) + 토큰 레이어 + FigmaLint 감사의 3계층을 우리 핸드오프 표준으로 채택. **착수 순서 제안: (1) 토큰 네이밍 spec MD부터 → (2) FigmaLint로 detached instance·하드코딩 값 감지 게이트 → (3) 컴포넌트 규칙 spec.** 디자이너가 Figma 변수에 하드코딩 값을 흘리는 마찰을 입구에서 차단.
- **SERVICE 2. 배민 디자인시스템 RAG 챗봇** (P1) — 핸드오프 자동화의 구체 모델. `|ComponentName|` 메타데이터 색인 + Storybook Composition 통합 + 독립 npm 패키지 배포가 우리 구조와 정확히 겹친다. 우리 Storybook 문서를 컴포넌트명으로 색인하면 "이 컴포넌트 어떻게 써요" 슬랙 질문을 챗봇으로 흡수 가능. 단 RAG 인프라(Bedrock/OpenSearch)는 비용 → ②와 ③ 경계.
- **DESIGN 1. 구글 워크스페이스 아이콘(고유색 복귀) / DESIGN 4. 인터브랜드 좁은 커닝** — 핸드오프 검수 체크리스트 항목으로: 아이콘·워드마크의 **최소 노출 크기·식별성 검수**를 컴포넌트 승인 게이트에 추가. 토큰화하긴 어렵지만 리뷰 루틴에 들어온다.
- **DESIGN 17. Closing the Loop(크리틱 후 before/after 주석)** — "This changed because you said that" 주석을 우리 컴포넌트 PR/디자인 리뷰 템플릿에 정착시키면 디자이너 미반영 피드백 마찰이 줄어든다. 경량, 바로 도입 가능.

### ③ 측장(senior-publisher)에게 넘길 쟁점 — 도입/거버넌스 결정

- **DEV 1. CSS @function** (P0, Chrome 148+ 제한) — 토큰 계산 로직을 SCSS 함수 → 네이티브 CSS로 옮길지의 빌드 체인 결정. 지원 너무 일러 지금은 보류 권고지만 토큰 아키텍처 방향이라 측장 판단 필요.
- **DEV 13. Angular v22 (Signal Forms + Angular Aria 12개 접근성 프리미티브)** — 우리 라이브러리는 React/shadcn 계열이라 직접 채택 아님. 다만 **접근성 프리미티브 12 UI 패턴 목록을 우리 컴포넌트 a11y 커버리지 역참조 체크리스트로 쓸지** 거버넌스 결정.
- **DEV 9. Roselli "구글 MWG 믿지 마라" + DEV 2. 마이어 분할 표 헤더** — AI 생성 마크업의 WCAG 검수 게이트를 라이브러리 기여 규칙에 강제할지. AI-ready(DESIGN 2)와 정면으로 묶이는 거버넌스 쟁점: "AI가 읽게 만들되, AI가 쓴 건 사람이 a11y 검수" 정책화.
- **DEV 15·18. Astro 6.4 processor API / Markdown 유틸** — 우리 콘텐츠·문서 사이트(이 trend-report 포함) 빌드 병목 해소 채택 여부. 대형 문서 사이트면 Rust 프로세서 빌드 단축 실측 가치, 측장이 인프라 우선순위 판단.
- **DEV 19. PolyCSS / DEV 11·8. offset-path·뷰 트랜지션** — 인터랙티브 표현 라이브러리 도입은 번들·접근성 비용 큼. PolyCSS는 흥미롭지만 폴리곤=DOM 요소 구조의 성능·a11y 트레이드오프가 커서 라이브러리 채택 아닌 실험 격리 권고.
- **SERVICE 2 RAG 챗봇 인프라 비용** — 위 ②의 핸드오프 자동화를 실제로 세울지의 예산·운영 결정.

---

**총평:** DESIGN 2(AI-ready 3계층)와 SERVICE 2(컴포넌트명 색인 RAG)를 핸드오프 표준의 양 축으로 삼고, contrast-color·sibling-index·@custom-media를 토큰/모션 레이어에 즉시 흡수하라 — 나머지 CSS 신기능은 기준선 문서만 갱신하고 도입 게이트는 측장에게.
