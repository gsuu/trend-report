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
