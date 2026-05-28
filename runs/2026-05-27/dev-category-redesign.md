# DEV 카테고리 재설계안 (2026-05-27)

> 작성 배경 — 시니어 디자이너·퍼블리셔 페르소나가 magazine.json 54건을 비평한 결과 DEV가 가장 망가져 있다는 데 의견 일치. 이 문서는 의사결정용. 사용자 승인 후 `docs/`·`news-tracking/` 실제 파일에 patch 적용 예정.

---

## 0. 진단 요약

### 페르소나 합의
- **DEV 17건 중 9건이 AI 도구 회사 announcement** (Anthropic ×4, GitHub Copilot ×2, Claude 행사, React Doctor, Builder.io Copilot 대안)
- **본업 글 0건**: 접근성, 디자인 토큰, 퍼포먼스, 한국어 타이포, 디자이너-개발 핸드오프
- **CSS/HTML 6건이 모두 CSS-Tricks 단일 매체** — Chrome Developers·Smashing·MDN·국내 토스/카카오/네이버 기술블로그 비어 있음

### 수집 단계 데이터 (5/26 dev-articles.json)
| 채널 | 후보 수 | 비고 |
|---|---|---|
| GeekNews | 29 | KR 큐레이션 |
| Builder.io Blog | 12 | AI 도구 회사 |
| Frontend Masters | 11 | 교육 블로그 |
| OpenAI Blog | 10 | AI 회사 |
| Vercel Blog | 10 | AI/프레임워크 회사 |
| GitHub Changelog | 9 | Copilot/거버넌스 |
| Anthropic News | 8 | AI 회사 |
| Cursor Changelog | 6 | AI 도구 |
| CSS-Tricks | 3 | |
| WebKit Blog | 1 | |
| shadcn/ui Releases | 1 | |
| Frontend Focus | 1 | |
| Smashing Magazine | 1 | |
| Adrian Roselli | 1 | a11y |
| **Naver D2 / KakaoEnt / Line** | **0** | 국내 기술블로그 |
| **Sara Soueidan / Scott O'Hara / A11y Project / Deque** | **0** | 접근성 |

**AI 도구 회사 채널(Anthropic+OpenAI+Cursor+GitHub Copilot+Builder.io+Vercel) = 55/103 = 53%**가 후보 단계부터 압도. dev-sources.json은 접근성/한국 기술블로그를 잘 등록해뒀는데 RSS에 그날 새 글이 없으면 0건. 반면 AI 회사들은 매일 announcement를 쏟아냄.

### 분류 단계 (target-classification.json)
- SMB Claude를 스스로 *"SMB 타깃 패키지라 CTTD 웹DEV 독자에게는 직결도가 중간"*이라고 적으면서 `P1 / design_dev_reference`로 통과시킴
- 본문이 비어있는 #11·#12도 자동 제외 안 됨
- 한국어 원문/국내 회사 사례에 가산점 없음

### 결론
문제는 셋. 우선순위대로:
- **(A) "좋은 글" 정의가 헐겁다** — `target-fit-classifier-agent.md`의 DEV P1이 "개발 도구·기술 표준·릴리즈로 실무 참고"라 SMB Claude·Copilot 가격표 다 통과. P0/P1을 더 깐깐하게 다시 정의해야 함
- **(B) 배제 룰이 약하다** — AI 회사 SMB/Enterprise plan announcement, 빈 본문/src 후보가 자동 컷되지 않음
- **(C) 수집 채널 다양성 부족** — `news-tracking/dev-sources.json`에 한국 기술블로그·접근성 채널은 있는데 폴링이 약하고, AI 회사 채널은 매일 글이 쏟아져서 후보 비율이 자동으로 쏠림

> **호당 비율 강제는 해결책이 아니다.** 좋은 글이 5편이면 5편 다 싣고, 좋은 접근성 글이 0개인 호는 비우는 게 맞다. 인공적으로 채우면 약한 글이 끼어들어 매거진이 더 망가진다. 분포 쏠림은 위 (A)(B)(C)로만 푼다.

---

## 1. DEV 카테고리 재정의

### 원래 정의 (dev-digest-agent-prompt.md L14)
> DEV는 GeekNews 스타일의 "프론트엔드 UIUX 개발자에게 유익한 최신 기술 소식"

### 재정의 (제안)
> DEV는 **한국에서 일하는 웹 퍼블리셔·프론트엔드 시니어·디자인 시스템 운영자가 다음 분기 마크업·스타일·접근성·핸드오프 작업에 한 가지라도 옮길 수 있는 글**만 다룬다. AI 도구 자체의 가격·패키지·행사 소식은 DEV가 아니라 별도 카테고리에 가깝다.

핵심 시프트:
- "유익한 최신 기술 소식" → "옮길 수 있는 작업거리"
- "프론트엔드 UIUX 개발자" → "한국 환경, 디자이너와 짝지어 일하는 사람"
- AI는 워크플로우에 끼어드는 실측 케이스만, announcement는 제외

---

## 2. 새 4축 정의 (분포는 강제하지 않음, 관찰만)

DEV가 다루는 "본업 영역"을 4축으로 정의한다. **호당 수량 할당이나 비율 강제는 두지 않는다.** 좋은 글이면 다 싣고, 그날 좋은 글이 없는 축은 비운다.

| 축 | 설명 | 대표 채널 / 예시 |
|---|---|---|
| **1. 웹 표준·브라우저·CSS·HTML** | CSS 신기능, Web Platform API, 브라우저 릴리즈 | CSS-Tricks, Chrome Developers, web.dev, WebKit, MDN, Smashing |
| **2. 접근성·성능·한국어 타이포** | ARIA, WCAG, LCP/CWV, 한글 폰트·IME·Pretendard | Sara Soueidan, Scott O'Hara, Adrian Roselli, Deque, A11y Project, 한국 접근성 사례 |
| **3. 디자인 시스템·핸드오프 자동화** | 토큰, Storybook, Figma Dev Mode, Code Connect, Style Dictionary | 토스/카카오/우아한형제들 디자인 시스템 운영기, Figma 블로그 |
| **4. AI 코딩·도구 (실측만)** | 워크플로우에 실제로 끼어드는 실측 케이스. 가격·플랜 announcement 제외 | Cursor 실측 후기, Claude Code 도입기, MCP 사용 사례 |

### 분포는 관찰 신호로만
- `/digest-collect` 끝에 "이번 호 DEV 4축 분포" 1줄 출력 (예: `웹표준 5 / 접근성 0 / 디자인시스템 2 / AI 1`).
- **같은 축이 2주 연속 0건이면** 채널 점검 트리거. 채널이 죽었거나 폴링 윈도우가 짧은지 확인.
- **절대 채택 강제로 변환 금지.** "접근성 1건 채워라" 같은 룰 신설 금지.

---

## 3. 채택/배제 기준 강화

### `docs/dev-digest-agent-prompt.md`에 추가할 배제 룰

```diff
+ ### 자동 제외 (검토 전 컷)
+ - **AI 회사 자체 announcement**: Anthropic/OpenAI/GitHub Copilot/Cursor/Vercel/Builder.io의 가격·패키지·SMB/Enterprise plan·행사 정리·이벤트 어나운스. 워크플로우에 실제로 끼어드는 실측 케이스(코드 변경·핸드오프 흐름 도식·접근성 검증)는 예외.
+ - **백엔드/인프라/AI 모델 학습** 중심 글. AI 에이전트 템플릿(Financial Services, Healthcare 등 도메인 패키지) 포함.
+ - **본문 또는 src URL이 비어있는 후보** (현 #11 Claude Design Review, #12 Copilot agent가 빈 채로 통과한 사례).
+ - **단순 "introducing X" / "announcing X" 제목**의 글은 본문 검토 필수. 본문에서 코드·속성·패턴·수치·체크리스트 중 하나 이상 추출 안 되면 컷.
```

### 추가할 우선순위 룰

```diff
+ ### 가산점·강등 룰 (분포 강제 아님)
+ - 한국어 원문 또는 국내 회사 사례는 우선순위 +1 (같은 품질일 때 P1 → P0). 양 할당 X.
+ - "다음 주 마크업 작업에 쓸 코드/속성/패턴이 한 개라도 있나" 체크. 없으면 P1 이하로 강등.
+ - DEV 4축 분포는 호 끝에 보고만 출력. 채택 강제 변환 금지.
```

---

## 4. `target-fit-classifier-agent.md` DEV 부분 patch 초안

### 원문 (L52-56)
```markdown
**DEV 내 우선순위:**
1. `P0`: 프론트엔드 구현·접근성·브라우저 QA·디자인-코드 연동에 직접 연결되는 후보
2. `P1`: 개발 도구·기술 표준·릴리즈로 실무 참고가 되는 후보
3. `P2`: 흥미롭지만 즉시 적용 근거가 약한 후보
4. `제외`: weak_promo 또는 exclude
```

### 수정안
```markdown
**DEV 내 우선순위:**
1. `P0`: 다음 두 조건 **모두** 충족
   - (a) CSS/HTML/접근성/성능/디자인 토큰/한국어 타이포/디자이너-개발 핸드오프 중 하나의 **본업 영역**에 직접 연결
   - (b) 원문에서 **코드·속성·패턴·수치·체크리스트 중 하나 이상 추출 가능**
   - 한국어 원문 또는 국내 회사 사례면 위 조건의 하나만 만족해도 P0 부여
2. `P1`: 본업 영역에 닿지만 본문이 일반론·소개에 머무르고 코드·속성·패턴이 약한 후보. 또는 AI 코딩 도구의 **실측 워크플로우 케이스**(가격·패키지 announcement는 제외)
3. `P2`: 흥미롭지만 본업 영역에서 멀거나 즉시 적용 근거가 약한 후보
4. `제외`:
   - AI 회사 가격·패키지·SMB/Enterprise plan·도메인 에이전트 템플릿 announcement
   - 백엔드/인프라/DB/AI 모델 학습 중심 글
   - 본문 또는 src URL이 비어있는 후보 (자동 컷)
   - GitHub Issue field 같은 거버넌스/조직 관리 공지
```

---

## 5. 새 수집 채널·키워드 제안 (`news-tracking/dev-sources.json` patch)

### 5-1. 즉시 추가 (RSS 있음 — 확인 후 add)

| 채널 | URL | 우선 토픽 |
|---|---|---|
| **Toss Tech** | https://toss.tech/ | KR 프론트엔드 + 접근성 + 디자인 시스템 |
| **Kakao Tech (그룹)** | https://tech.kakao.com/blog/ | KR 프론트엔드 |
| **당근 테크블로그** | https://medium.com/daangn | KR 프론트엔드 + UX 엔지니어링 |
| **우아한형제들 기술블로그** | https://techblog.woowahan.com/ | KR 프론트엔드 + 디자인 시스템 (5/26 #01 RAG 챗봇 출처) |
| **데브시스터즈 기술블로그** | https://tech.devsisters.com/ | KR 프론트엔드 |
| **CSS Layout News** | https://csslayout.news/ | CSS 신기능 큐레이션 |
| **Bramus van Damme** | https://www.bram.us/ | CSS·view-transition·scroll-driven |
| **Una Kravets** | https://una.im/ | Chrome 팀, CSS·디자인 시스템 |

> **주의**: 한국 회사 기술블로그는 RSS 갱신이 드물다. 폴링 윈도우를 7일 → 30일로 늘리는 게 현실적.

### 5-2. 키워드 강화 (includeTitlePatterns에 추가)

**영어 키워드** (CSS/HTML/접근성 본업):
```
container-queries|anchor positioning|view-transition|scroll-driven|has-selector|container-type|css-nesting|@scope|color-mix|light-dark|color-contrast|focus-visible|focus-within|aria-live|aria-expanded|inert|popover|dialog|details|summary|prefers-reduced-motion|prefers-color-scheme|forced-colors|reduced-data|design tokens|style dictionary|figma variables|code connect
```

**한국어 키워드**:
```
시맨틱|마크업|디자인 토큰|컨테이너 쿼리|앵커 포지셔닝|뷰 트랜지션|스크롤 애니메이션|접근성|스크린리더|키보드 접근|색대비|한글 폰트|가변폰트|폰트 서브셋|핸드오프|디자인-개발 협업
```

### 5-3. 배제 키워드 강화 (excludeTitlePatterns 추가)

```
for Small Business|Enterprise plan|pricing|billing|for Financial Services|for Healthcare|for Education|fundraise|Series [A-D]|valuation|launching .* plan|introducing .* plan|now available for .* customers
```

### 5-4. 모니터링만 (정기 채택은 자제)

| 채널 | 정책 |
|---|---|
| Anthropic News | 코딩/MCP/Claude Code/Computer Use 직접 다루는 글만. SMB/Enterprise plan/도메인 에이전트 패키지 자동 제외 |
| OpenAI Blog | Codex/Apps SDK/dev API 글만. 모델 릴리즈는 호당 1건 한도 |
| GitHub Changelog | Copilot 워크플로우 변경만. Issue field·Project·Organization 거버넌스 제외 |
| Builder.io Blog | Figma → Code/AI 핸드오프 실측만. Copilot 대안 리스티클·일반 비교글 제외 |

---

## 6. 적용 순서

1. **이 문서 사용자 검토 → OK 사인** (이 단계)
2. patch 3종 동시 적용 (worktree에서 PR 만들기 권장)
   - `docs/dev-digest-agent-prompt.md` — 자동 제외 + 호당 비율 + 가산점
   - `docs/target-fit-classifier-agent.md` — DEV P0/P1/제외 재정의
   - `news-tracking/dev-sources.json` — 새 채널 추가 + include/exclude 패턴 강화
3. 다음 호 `/digest-collect` 돌려서 효과 측정
   - 본문 작성 단계 끝에서 "DEV 4축 분포" 1줄 보고 (관찰만, 강제 X)
   - 같은 축 2주 연속 0건이면 채널 점검
   - 1~2주 후 다시 페르소나 리뷰
4. 효과 확인되면 SERVICE·DESIGN도 같은 패턴으로 재설계 (오픈서베이 4건/IT'S NICE THAT 4건 쏠림 해결)

---

## 7. 이번 호(2026-05-26)에 즉시 적용 가능한 조치 (선택)

페르소나가 양쪽 다 Cut으로 지목한 6건은 위 기준이 미리 적용됐다면 통과하지 않았을 글들이다. 사용자 결정에 따라 사이트에서 내릴 수 있음.

| # | 출처 | 새 기준에서의 판정 |
|---|---|---|
| #07 5/26 Builder.io Copilot 대안 6선 | AI 회사 가격·도구 비교 → **제외** |
| #08 5/26 GitHub Issue fields preview | 거버넌스 공지 → **제외** |
| #09 5/26 Anthropic Claude for SMB | "for Small Business" 자동 컷 → **제외** |
| #10 5/26 Anthropic Agents for finance | 도메인 에이전트 패키지 → **제외** |
| #11 5/26 Claude Design Review | 본문 비어있음 → **자동 제외** |
| #12 5/26 GitHub Copilot cloud agent | 본문 비어있음 → **자동 제외** |

→ 6건 빼면 DEV는 17 → 11건. 본업 비율은 여전히 약하지만 노이즈는 사라짐.

---

## 부록 A. 페르소나 wish list (다음 수집부터 반영)

**디자이너 wish**: 국내 회사 디자인 시스템 거버넌스 사례 · Figma Make/Subframe/v0 실무 적용기 · AI 결과 검수 단계 디자이너 워크플로우 · 한국 B2B SaaS IA 재설계 · 디자이너 채용 시장 변화

**퍼블리셔 wish**: 한국 회사 접근성 실측 케이스 · CSS 컨테이너 쿼리·:has·anchor positioning 실무 적용 · 디자인 토큰 → CSS 변수 자동화 운영기 · 한국어 웹 타이포 (Pretendard·IME·LCP) · 디자이너-개발 핸드오프 도구 변화 · 퍼포먼스 LCP 케이스 · View Transitions·scroll-driven 사례

이 7+5=12개 키워드를 다음 1개월간 수집·선별 우선순위로 반영.
