# Council Round 1 — 디자이너 의견

> 12년차 UIUX 시니어. 디자이너 180명(86%) 중 한 명. 매거진 54건 + references/design.md 10건 + service.md 12건 + dev.md 10건 + tf-leader 비교 5건 + trend-radar 7건 본문 확인. senior-meeting 회의록(designer.md)과 누적 voice를 토대로 *다음 회차부터 적용할 운영 결정*을 던진다.

## 한 줄 입장

**"references/design.md ★ 후보 중 2건을 매거진 DESIGN 본문으로 강제 승격하고, 동시에 한국 패션·뷰티 클라이언트 응용처가 본문에 *없으면* shortlist에서 자동 강등한다 — 두 룰을 같이 가야 디자이너 180명에게 닿는 호가 된다."**

매거진 54건 중 DESIGN 21건이 *내가 매일 보는* 토스·당근·하나·Figma·Smashing·It's Nice That 반복이라 *디자이너가 새로 알게 된 패턴*은 손에 꼽힌다. 반면 references/design.md v2는 큐레이션 매체(Hover States) 비중을 60%로 끌어올려 갤러리 미공개 6건을 발굴했다 — 매거진이 references를 못 따라가는 역전이 첫 회차에 이미 보임. 동시에 디자인 21건 중 *한국 패션·뷰티 응용 후보 한 단락*이 본문에 박힌 건 5건이 안 된다.

---

## 핵심 결정 안건 3-5개

### 안건 1: references/design.md ★ 후보 → 매거진 DESIGN 본문 강제 승격 룰 (호당 최소 2건)

- **본인 입장**: ✓ 동의 (강하게 추진)
- **점수**: +2
- **사유** (디자이너 직무 시점):
  - 이번 회차 references/design.md ★ 6건(Serena Congiu·Any Given Moment·Ballet de Marseille·LIDO Festival·Bécane Paris·KÖPPEN) 중 *매거진 DESIGN 본문에 글로 올라간 건 0건*. 동시에 tf-leader 외부 비교에서 *우리 우월 3건 / 외부 보완 2건 / 외부 대체 0건* — references 풀이 매거진보다 단단함이 외부 벤치마크로도 확인됨.
  - "다이얼 회전 네비(Any Given Moment)", "트래버틴+성분 캐러셀(KÖPPEN)", "여성 모터사이클 D2C(Bécane)" 같은 발견은 *제안 자료에 그대로 인용 가능한 카드*. 매거진 본문 한 단락으로 글이 되면 디자이너 슬랙에서 *링크만 던지면 끝*. references md만 봐서는 180명에게 안 닿음.
  - 퍼블리셔·기획자도 같은 룰을 *각자 카테고리에서* 들고 있다 (퍼블리셔: dev.md ★ 1-2건 승격 / 기획자: service.md ★ 2건 승격). 셋이 동일 룰이면 *셋 카테고리 모두 references 풀과 매거진이 연결*되는 구조.
- **실행** (1줄):
  - `docs/magazine-agent-workflow.md` Phase 6(글쓰기) 진입 직전에 "**해당 일자 references/{area}.md의 ★ 항목 중 매거진 본문에 글로 올라가지 않은 건이 있으면, magazine-writer가 해당 area 카테고리에서 1-2건을 자동 채택 후보로 추가**" 룰 추가. shortlist에 ★ 후보가 누락돼 있으면 *digest-collect가 ★ 자동 편입*. magazine-writer 프롬프트에 "references/★ → 매거진 본문 승격" 섹션 신설.

---

### 안건 2: 매거진 DESIGN 본문 채택 게이트 — "한국 패션·뷰티 클라이언트 응용 후보 한 단락" 필수

- **본인 입장**: ✓ 동의
- **점수**: +2
- **사유** (디자이너 직무 시점):
  - 매거진 DESIGN 21건 본문을 다시 훑으면, *내가 다음 주 무신사·29CM·올리브영 시안 회의에 들고 갈 한 줄*이 박힌 글은 5건이 안 된다. 나머지는 글로벌 일반론(Smashing·NN/g·Figma blog·It's Nice That) 또는 식상 반복(Bark Studio·Casi·Ffern). 회사 인원 비율(디자이너 180 / 퍼블 30 / 기획 10)에서 DESIGN 본문이 디자이너 시안에 안 닿으면 매거진 가치 절반이 날아감.
  - tf-leader 보고서에서 *"우리 우월 3건"의 공통점*은 모두 응용 후보가 한국 패션·뷰티 클라이언트(W컨셉·올리브영·무신사) 작업에 박혀 있다는 점. 응용 후보 한 단락은 *외부 벤치마크 우월의 결정 인자*이기도 함.
  - trend-radar 7건 중 4건이 ★(29CM 1조·올리브영 멤버스 월간·무신사 뷰티 메가스토어·K뷰티 인디 매대) — 패션·뷰티 응용처 *시장 근거 풀*은 이미 trend-radar가 매주 만들고 있다. 매거진 본문 응용 후보 한 단락이 *trend-radar 한 줄과 묶이면* 글의 무게가 두 배.
- **실행** (1줄):
  - `.claude/agents/magazine-writer.md`와 `docs/design-digest-agent-prompt.md`에 "**DESIGN 본문은 '응용 후보(한국 패션·뷰티 클라이언트 작업)' 한 단락이 *반드시* 포함된다. 작성 시 같은 일자 `runs/YYYY-MM-DD/trend-radar.md`의 ★ 키워드를 우선 인용**" 룰 추가. magazine-reviewer 9개 점검 항목에 "응용 후보 단락 존재 + 한국 클라이언트 이름 1개 이상 명시" 게이트 추가, 미통과 시 본문 재작성 루프.

---

### 안건 3: 한국 패션·뷰티 자사 디자인 채널 정식 추가 (`news-tracking/design-sources.json`)

- **본인 입장**: ✓ 동의
- **점수**: +1
- **사유** (디자이너 직무 시점):
  - 매거진 DESIGN 21건 중 *한국 출처는 5건* (디아이투데이 2·디투데이 1·DIGITAL iNSIGHT 2). 모두 *외부 매체 큐레이션*이고, *무신사 SeedDesign·29CM 디자인 인사이트·SSF·LF몰·아모레퍼시픽 디자인·올리브영 디자인팀* 자사 블로그·뉴스룸 본문은 거의 안 잡힘. 누적 voice의 wish #1("국내 패션 브랜드 디자인 시스템 운영기")이 이번 회차에 0건 잡힌 직접 원인.
  - tf-leader 시스템 제안 #3 *"design references에 브랜드 자사 캠페인 페이지 발견 경로 보강"*과 정확히 같은 결론. STELLAR·REV'IT! 같은 브랜드 자사 페이지가 references에서 발견됐듯, 국내도 무신사 SeedDesign·29CM 매거진·아모레 STORIES·올리브영 매거진 자체 본문을 정식 채널로.
  - 트렌드 라이트 효과: trend-radar #3(무신사 뷰티 메가스토어 Q2 오픈) 시점에 무신사 뉴스룸 디자인·BX 글이 잡히면 *시장 근거 + 자사 디자인 의사결정 글*이 같은 호에 같이 박힘. 매거진의 한국 컨텍스트 농도가 한 단계 올라감.
- **실행** (1줄):
  - `news-tracking/design-sources.json`에 무신사 SeedDesign(`design.musinsa.com` 또는 뉴스룸 디자인 카테고리)·29CM 매거진 디자인 코너·아모레퍼시픽 STORIES 디자인 카테고리·올리브영 뉴스룸 디자인·SSF몰 매거진·LF몰 매거진 RSS/카테고리 URL 6채널 추가. 추가 후 다음 호 fetch에서 *한국 출처 비중이 5/21(24%) → 최소 8/21(38%)* 가 되는지 측정.

---

### 안건 4: 매거진 dev 7건 / design 3건 → service 5 / design 4 / dev 3 비율 재조정 (퍼블리셔·기획자 안건과 동일 방향)

- **본인 입장**: ✓ 동의 (디자이너 시점에서도 같은 방향)
- **점수**: +1
- **사유** (디자이너 직무 시점):
  - 디자이너 시점에서도 매거진 dev 7건 중 *디자이너 시안에 닿는 글은 0건*. AI 도구 비교·SaaS announcement·관리 도구 릴리즈 노트는 디자이너에게도 무의미. 차라리 그 3슬롯이 *DESIGN으로 옮겨와* references/design.md ★ 후보 승격 + 한국 자사 디자인 글로 채워지면 디자이너 180명의 시간 가치가 크게 올라감.
  - 회사 인원 비율(디자이너 180 / 퍼블 30 / 기획 10)에 단순 비례하면 디자인이 7-8건, 퍼블/기획이 2-3건씩이지만, **현실 인용 가치**로 보면 service 5(기획 메인·디자이너 보조) / design 4(디자이너 메인) / dev 3(퍼블 메인)가 *디자이너에게도* 정답에 가까움. 왜냐면 service.md ★ 후보(무신사 멤버십·당근알바 폼 IA)는 *디자이너가 시안에 직접 그리는 컴포넌트*이기도 하기 때문.
  - 단, 비율은 *호당 하한선*이 아니라 *후보 풀의 무게중심*. 좋은 글이 없으면 비우는 원칙(memory: feedback_curation_no_quota)은 유지. 비율은 "있을 때 이 톤으로"라는 가이드.
- **실행** (1줄):
  - `docs/magazine-agent-workflow.md`에 "**호당 카테고리 가이드: service 5 / design 4 / dev 3 (총 12건 기준). dev는 *퍼블리셔 직무에 직접 닿는 코드 데모·CSS 신기능·접근성 케이스*에 한정, AI 도구 비교·SaaS announcement·릴리즈 노트는 dev에서 제외**" 룰 추가. magazine-writer가 후보 라우팅 시 비율 이탈 경고만 띄우고, 좋은 후보가 없으면 비우는 원칙 함께 명시.

---

### 안건 5: digest-collect Phase 2 원문 검증에 *"디자이너 결정-근거 키워드 체크"* 필드 추가

- **본인 입장**: ✓ 동의 (senior-meeting 시스템 제안 그대로 재제기)
- **점수**: +2
- **사유** (디자이너 직무 시점):
  - 이번 회차 Cut 6건 중 4건이 *결정-근거-없음 / 무드보드형* (Bark Studio·Casi·Ffern·Webflow Showcase). 누적 voice의 strong_rejects 5개 중 3개가 같은 패턴. *원문에 "왜 이 선택을 했는가"가 한 단락 이상 있는가*만 사전 체크해도 회차마다 2-3슬롯이 약한 글에 낭비되는 걸 막을 수 있음.
  - source-verifier가 본문 fetch할 때 단순 200 OK가 아니라 **"왜·이유·근거·결정·배경·디렉터/메이커 quote·process"** 한국어/영어 키워드 본문 존재 여부를 같이 리포트. magazine-writer가 shortlist에서 *근거 키워드 0건인 글은 우선순위 자동 강등* (컷이 아니라 강등 — 다른 강점이 있으면 살아남음).
  - 디자이너 시점에서 가장 자주 발화하는 "이거 왜 골랐냐"라는 질문을 *사전에 막는* 룰. references/design.md의 "갤러리 미공개 + 결정 근거" 2축 채택 기준을 매거진 후보에도 그대로 옮기는 셈.
- **실행** (1줄):
  - `.claude/agents/source-verifier.md`에 "**본문 fetch 시 결정-근거 키워드(왜/이유/근거/결정/배경/quote/process/why/because/decision/rationale) 존재 빈도 카운트를 같이 리포트**" 추가. `docs/target-fit-classifier-agent.md`에 "**결정-근거 키워드 0건 + 무드보드형 추천 패턴이면 priority -1 자동 강등**" 룰 추가.

---

## 마지막 보고

5개 안건: ① references/design.md ★ → 매거진 DESIGN 본문 강제 승격 호당 2건 (+2) / ② DESIGN 본문 *한국 패션·뷰티 응용 후보 단락* 게이트 (+2) / ③ `news-tracking/design-sources.json`에 한국 패션·뷰티 자사 디자인 채널 6개 정식 추가 (+1) / ④ 매거진 카테고리 비율 service 5 / design 4 / dev 3 재조정 (+1) / ⑤ digest-collect Phase 2에 *결정-근거 키워드 체크* 필드 추가 (+2). **가장 강한 안건은 ①·②·⑤ 셋이 한 묶음** — references/design.md ★ 풀에서 채택을 강제하되, 본문에는 *한국 패션·뷰티 응용 후보 단락*이 박혀야 하고, 동시에 원문에 *결정 근거*가 있어야 통과. 이 셋이 같이 들어가야 디자이너 180명에게 매거진이 *시안 회의 직행 카드*로 작동한다.
