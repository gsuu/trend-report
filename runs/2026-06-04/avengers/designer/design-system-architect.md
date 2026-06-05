# design-system-architect — 2026-06-04 shortlist 분해

토큰 계층·컴포넌트 거버넌스·테마/다크모드·AI-ready spec 관점으로만 봤다. "좋은 글"이 아니라 우리 토큰·거버넌스에 들어올 경로 기준.

---

## ① 구조에 흡수 — 우리 디자인시스템에 반영할 아키텍처 패턴

**DESIGN-2 / How To Make Your Design System AI-Ready (P0, Smashing)** — 이번 호의 척추.
- spec 파일(MD) + 토큰 레이어 + 감사 스크립트(FigmaLint)의 **3계층**은 우리가 지금 머릿속에만 있는 규칙을 기계가 읽는 인프라로 바꾸는 정확한 골격이다.
- 흡수 경로: primitive→semantic→component 토큰 위에 `spec/*.md`(간격·색·컴포넌트 규칙)를 올리고, detached instance·하드코딩 값을 잡는 감사 스크립트를 PR 게이트에 붙인다. Atlassian/Carbon/Nordhealth가 레퍼런스.
- 우리 MEMORY의 퍼블리싱팀(Storybook·Astro) 자산과 직결 — Storybook docs를 spec 소스로 쓰면 한 곳에서 사람·LLM·감사가 같은 규칙을 읽는다.

**DEV-5 / contrast-color() 자가 교정 컬러 (P0, Smashing)** — 테마 계층에 직접 들어온다.
- semantic 토큰(`--text-on-brand`)을 하드코딩 흑/백에서 `contrast-color(var(--brand))`로 바꾸면 브랜드 색이 바뀌어도 텍스트 대비가 자동 보정된다. 다크모드·테마 운영의 핵심.
- **반드시 같이 흡수할 부채**: 출력이 이산값이라 transition 시 18% 휘도에서 스냅. 토큰 설계 단계에서 "대비 토큰은 애니메이트하지 않는다" 규칙을 명문화해야 한다. 2026.4 Baseline이라 도입 타이밍은 지금.

**DEV-1 @function / DEV-12 @custom-media** — 토큰 계산·브레이크포인트 계층의 표준 이관.
- SCSS 함수/변수에 갇혀 있던 토큰 로직(@function)과 브레이크포인트 별칭(@custom-media)을 순수 CSS로 내릴 경로. 단 Chrome 148+/미지원 폴백이라 **지금은 spec에 "목표 상태"로만 기록**하고 PostCSS 병행. 거버넌스 문서에 "이행 예정 토큰 표준"으로 칸 하나.

**DEV-4 New to the web platform in May (P0)** — 컴포넌트 CSS 기준선 업데이트의 정기 입력.
- `:open`(details/dialog 상태 토큰화), 이름 기반 컨테이너 쿼리 → 우리 컴포넌트의 상태 스타일링과 반응형 토큰 기준선을 갱신할 분기 항목. 단발이 아니라 "기준선 리뷰" 루틴 입력으로 흡수.

**DEV-2 Split-Cell Table Headers / DEV-9 Google MWG 비판** — 컴포넌트 거버넌스의 접근성 게이트.
- DEV-9는 특히 중요: LLM 생성 마크업이 WCAG를 어긴다는 실증. AI-ready 3계층(DESIGN-2)에 **"AI 생성물은 감사 스크립트를 통과해야 머지"** 규칙을 박는 직접 근거. AI-ready와 접근성 거버넌스를 한 줄로 묶는 못.

---

## ② 부채 경고 — 지금 구조로는 못 받는 변화

- **AI 진입점이 디자인시스템 밖에 있다.** SERVICE-1(CJ ChatGPT Apps), SERVICE-5(Sephora/Ulta 에이전틱)는 외부 AI에서 상품상세로 넘어오는 화면을 요구하는데, 우리 토큰·컴포넌트에 "외부 에이전트 진입 컨텍스트"라는 표면이 없다. 지금 구조는 자사 화면만 가정. → AI 진입 전용 레이아웃/토큰 컨텍스트가 비어 있다.

- **테마 토큰을 애니메이트할 수 있다고 가정하면 깨진다.** contrast-color()(DEV-5) 스냅 문제를 모르고 transition을 걸면 다크모드 전환에서 텍스트가 튄다. 토큰 계층에 "이산 vs 연속" 구분이 없는 게 부채.

- **감사가 없으면 AI-ready는 문서일 뿐.** DESIGN-2를 spec만 받고 FigmaLint/감사 스크립트를 안 깔면, detached instance·하드코딩 값이 계속 새고 LLM이 그걸 학습해 증식한다(DEV-9). spec 없는 토큰은 거버넌스가 아니다.

- **표준 미성숙 기능을 토큰에 직접 박으면 폴백 부채.** @function·@custom-media·sibling-index(DEV-6)·border-shape는 Firefox/Safari 갭이 있다. 지금 토큰 표준에 넣으면 폴백 유지비가 컴포넌트마다 분산된다. 한곳(감사 계층)에서 관리할 구조가 선결.

---

## ③ 측장(senior-designer)에게 넘길 쟁점 — 시스템 거버넌스 결정

1. **AI-ready 3계층(DESIGN-2)을 올해 디자인시스템 로드맵에 정식 트랙으로 세울 것인가.** spec 파일을 어디(Storybook? 별도 repo?)에 두고, 누가 spec 오너이며, 감사 스크립트를 PR 게이트로 강제할지 — 거버넌스 결정 사안. 흡수 1번이 여기에 달려 있다.

2. **테마 전략: 알고리즘 컬러(contrast-color)로 갈 것인가, 정적 토큰 페어를 유지할 것인가.** 자동 보정의 운영 이점 vs 스냅 한계·디자이너 통제권 상실의 트레이드오프. 다크모드 운영 방식이 갈린다.

3. **CSS 토큰 표준 이행 타임라인.** @function/@custom-media/native 기능을 "언제 polyfill 졸업하고 표준으로 갈아탈지"의 기준선 — 브라우저 지원 임계치를 거버넌스 규칙으로 정해야 매번 컴포넌트별로 안 싸운다.

4. **외부 AI 진입 화면을 디자인시스템 스코프에 넣을 것인가(SERVICE-1/5).** 토큰·컴포넌트가 자사 화면을 넘어 에이전트 진입 컨텍스트까지 책임질지 — 스코프 확장 결정.

---

**총평:** 이번 호는 DESIGN-2(AI-ready 3계층)와 DEV-5(contrast-color)·DEV-9(LLM 마크업 접근성)가 한 줄로 꿰여 "토큰을 기계가 읽고 감사가 지키는 구조"를 통째로 들이밀고 있다 — spec·토큰·감사 3계층을 올해 거버넌스 트랙으로 세울지가 측장 결정의 핵심.
