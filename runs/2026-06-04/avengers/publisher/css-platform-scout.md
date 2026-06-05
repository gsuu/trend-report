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
