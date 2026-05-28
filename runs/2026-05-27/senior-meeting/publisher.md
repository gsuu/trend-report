# 시니어 퍼블리셔 회의 발언 (2026-05-27)

## 한 줄 총평

매거진 dev 카테고리 7건 중 5건이 퍼블리셔 직무와 무관한 *AI 도구 비교·SaaS 출시 announcement·관리 도구 릴리즈 노트*다. 같은 날 references/dev.md는 **코드 위치 10/10, ★ 5건, iOS Safari·한글 폰트 명시 100%**로 정반대 품질 — 매거진 dev 라우팅이 references 풀과 완전히 단절돼 있다는 신호. 디자인·서비스 카테고리는 한국 컨텍스트(하나원큐·당근알바)가 잘 잡혀 보강 가치 있음.

---

## 이번 회차 채택 매거진 글 평가

### 다음 스프린트에 적용 가능 (Keep)

- **#04 [DIGITAL iNSIGHT] 어제처럼 자연스럽지만 어제보다 편하게 와일리의 하나원큐 UI·UX 리뉴얼** — 직접 마크업 단서는 아니지만 "기존 IA → 의도 기반 IA 재구성" 결정이 패션 커머스 GNB 재편(무신사 카테고리 트리 vs 사용자 의도 진입) 핸드오프 회의 직전에 디자이너와 같이 볼 만함. 시안 받기 전 *반응형 임계점·키보드 진입 순서*를 미리 협의하는 근거.
- **#06 [pxd story] 검색엔진은 우리 사이트를 어떻게 발견할까?** — `robots.txt`·`sitemap.xml`·`canonical`·내부 링크·리다이렉트 5개 항목이 *퍼블리셔가 매번 책임지는 영역*. GPTBot·OAI-SearchBot 분기 규칙은 2026년 새 항목이라 무신사·29CM 사이트 운영 perf 회의에 그대로 가져갈 만함.

### 시간 낭비 (Cut)

- **#07 [Builder.io] 6 Best GitHub Copilot Alternatives in 2026** — AI 코딩 도구 비교 6선 리스티클. *명백히 까는 패턴 1번*. 퍼블리셔는 도구 선택 권한 거의 없고, 결정도 회사 단위. 게다가 Copilot 가격 정책 변경 announcement 그대로 옮긴 글.
- **#08 [GitHub] Issue fields are now in public preview** — GitHub 관리 도구 announcement. 마크업·CSS와 무관. 백오피스·PM 도구 쪽.
- **#09 [Anthropic] Introducing Claude for Small Business** — 커넥터 7종·워크플로우 15개·에이전트 소개. SaaS 출시 announcement, 퍼블리셔 영역 0.
- **#10 [Anthropic] Agents for financial services** — 금융 업무 에이전트 템플릿. 퍼블리셔 무관 + CTTD 패션 커머스 컨텍스트 무관.
- **#12 [GitHub] Copilot cloud agent code review** — Copilot 운영 announcement. 도구 비교·릴리즈 노트.

### 코드 위치만 추가되면 살 만함 (Borderline)

- **#11 [Anthropic] Claude Design Review: An Innovative Way to Brainstorm with AI** — 디자인 리뷰에 AI 활용 자체는 디자이너 옆 자리 퍼블리셔도 관심. 다만 본문 deck 비어 있어 *실제 어떤 prompt·어떤 출력*인지 확인 불가. 본문 + 가능하면 *피그마 파일/스크린샷 위치*가 명시되면 핸드오프 회의 보조 자료.
- **#05 [Smashing] Four Levels Of Customer Understanding** — design 라우팅이지만 퍼블리셔 관점에서도 *행동 관찰 단계*는 마크업 단계 전 알아둘 만함. 본문은 추상 — 한국 회사 케이스 부재.

---

## references/ 평가

### dev.md (퍼블리셔 메인)

**총평** — 이번 회차 references 산출물 중 가장 직무 정렬도 높음. **코드 위치 10/10 (100%)** + **한국 환경 적용성 명시 10/10 (100%)** 자체 평가가 사실. 30명 퍼블리셔 슬랙에 그대로 던질 수 있는 풀.

**가장 강한 발견 (다음 스프린트 직행)**:
- **#1 CSS `sibling-index()` / `sibling-count()` (★)** — Smashing CodePen + iOS Safari 26.2 stable 명시. 패션 커머스 사이즈 옵션 탭·컬러 스왓치 가변 개수 균등 분배(`width: calc(100% / sibling-count())`)에 *그날 바로* 들어가는 한 줄. nth-child 지옥 끝. 한국 아이폰 신규 OS 90%+ 커버 = production 진입 가능.
- **#2 CSS Gap Decorations (★)** — Chrome/Edge 149+ stable이지만 **iOS Safari 미지원**을 정확히 명시 + `@supports` 폴백 안내. 한국 모바일 절반이 iOS인 패션 커머스에선 *현재는 PC 대시보드 전용*. 무신사 상품 비교표 컬럼 구분선 응용 후보 정확함.
- **#5 Virtuoso Data Table (★)** — `Intl.NumberFormat('ko-KR', { currency: 'KRW' })` 명시. 무신사 입점 브랜드 매출 표·쿠팡 셀러 어드민 즉시 적용.

**부족한 영역**:
- 패션 커머스 특유 컴포넌트(룩북 hover, 사이즈 차트 *툴팁*, 무한 스크롤, 색상 스왓치 키보드 접근) **직접 매칭은 sibling-index 1건만**. 나머지는 시즌 룩북·증권 호가창 등 *간접 응용*. 다음 회차에는 **fashion-specific 컴포넌트 데모 1-2건 명시 탐색** 필요.
- **접근성(키보드·스크린리더·한국어 IME) 라이브 데모는 0건**. 토스·카카오 접근성 케이스가 references에 없음. dev-reference-scout에 접근성 채널(웹접근성연구소·NULI·한국웹접근성평가센터) 추가 필요.
- **디자인 토큰 → CSS 변수 자동화 운영기**(Figma Variables → Style Dictionary) 라이브 사례 0건. 핸드오프 작업 비중을 생각하면 큰 결손.

**iOS Safari·한글 폰트·모바일 우선 평가**: 10건 모두 명시. 특히 #4 ScrollMap의 *"sticky 부모에 transform 금지"*, #7 GSAP 3D cube의 *"will-change 명시"*는 한국 iOS 모바일 깜빡임 디버깅 실측에 그대로 도움.

### service.md (보조 — 화면 분석에서 마크업 단서)

**퍼블리셔 시점 흔적**: #1 하나은행 OneQ는 *IA 재구성* 결정만 있고 *실제 화면 마크업/반응형 임계점*은 없음. PM 시점 산출물이라 어쩔 수 없지만, 퍼블리셔는 보통 *시안 받기 전*에 "이거 진짜 가능한가" 검증해야 해서 #1, #2(당근알바), #3(무신사 멤버십) 글을 *읽고* 끝나지 마크업 단서 추출은 어려움. 보조 자료로 적정.

**한 가지 응용처**: #3 무신사·29CM 멤버십 페이지(`musinsa.com/member/benefit`)는 *직접 inspect*해보면 한국 패션 커머스의 *등급 카드 컴포넌트*·*혜택 비교표* 마크업 패턴 학습 가능. 다음 회차에 *url + inspect 권장*만 한 줄 추가하면 퍼블리셔 활용도 ↑.

### design.md (보조 — 시안 받기 전 미리 보는 시각 케이스)

**퍼블리셔 시점**: #1 Serena Congiu·#2 Any Given Moment·#5 Bécane Paris 같은 럭셔리/포트폴리오는 *시안에서 자주 요구되는 인터랙션*(다이얼 회전·3D 제품 뷰어)이 라이브 데모로 잡혀 있어, 디자이너가 *"이런 거 가능?"* 물어볼 때 미리 코드 위치(view-source·DevTools) 확인하는 용도로 적합.

**한 가지 발견**: #3 Ballet de Marseille의 **CSS 3D title 변형** + 커스텀 폰트 BNM Lunch — 한국에 옮길 때는 *한글 커스텀 폰트 처리(서브셋·variable font)* 이슈가 따라옴. 다음 회차 references에 *디자인 라이브 사례 → 퍼블리셔 구현 노트 1줄* 같이 붙이면 직무 연결도 ↑.

---

## 다음 호 wish (구체)

1. **한국어 IME 처리 라이브 케이스** — 토스·카카오·네이버 검색 입력창에서 한글 조합 중 keydown·composition 이벤트 처리. 코드 위치(GitHub repo 또는 DevTools inspect 가능 URL) 필수.
2. **iOS Safari container queries 폴백 패턴** — 한국 모바일 절반이 iOS인 환경에서 container queries 미지원 OS 분기(`@supports`). CodePen 데모 + 패션 커머스 컴포넌트(상품 카드 가변 너비) 응용.
3. **Figma Variables → Style Dictionary → CSS 변수 배포 운영기** — 디자인 토큰 자동화 실측. 한국 회사(토스·당근·쿠팡) 사례 우선.
4. **사이즈 차트 툴팁·컬러 스왓치 키보드 접근** — 패션 커머스 특유 컴포넌트의 접근성 라이브 케이스. 무신사·29CM·W Concept 사이트 직접 inspect로도 추출 가능.
5. **한국 회사 접근성 실측 케이스 1건** — 웹접근성연구소·NULI 평가 결과 또는 토스 a11y 블로그 본문. 한국어 스크린리더(센스리더·NVDA 한국어) 이슈 명시.

---

## 시스템 한 가지 제안

**매거진 dev 카테고리 라우팅 규칙에 *"AI 도구 비교·SaaS 출시 announcement·GitHub/Anthropic 릴리즈 노트"는 dev 카테고리 제외* 룰 추가**. 이번 회차 dev 7건 중 5건이 이 패턴에 해당하고, 같은 날 references/dev.md는 정확히 정반대 품질(★ 5건·코드 위치 100%)이라 *매거진 dev = AI 뉴스 vs references/dev = 진짜 dev 콘텐츠*로 두 갈래가 갈라짐. **shortlist → 글쓰기 단계에서 references/dev.md 후보를 dev 카테고리에 *우선 승격*하는 흐름**을 만들면 dev 카테고리가 30명 퍼블리셔에게 실제 가치 있는 글로 채워짐. 첫걸음으로 이번 references/dev.md의 ★ 5건 중 1-2건을 다음 회차 매거진 dev에 직접 글로 승격 권장.
