# Council Round 1 종합 (2026-05-27)

> 5명(senior-designer / senior-publisher / senior-planner / tf-leader / trend-hunter) Round 1 의견 종합. 다음 라운드 안건 정의.

## 합의된 핵심 안건 (6개) — 끝판왕 후보

### A. references/{design,service,dev}.md ★ → 매거진 본문 자동 승격
- D1 / PB1 / PL1 / TH1 직접 안건, TF 권고에서 정렬
- **5/5 합의, 평균 +2**
- 실행: `digest-collect` Phase 4 또는 `magazine-write` Phase 6 진입 직전에 ★ 미승격 항목을 자동 후보로 등록

### B. 한국 응용·한국 환경 필수 게이트
- D2 (한국 패션·뷰티 응용 단락 게이트), PB3 (한국 환경 4축 iOS Safari·한글·모바일·접근성), PL4 (한국 클라이언트 안건 후보), TF/TH 정렬
- **5/5 합의, 평균 +2**
- 실행: `magazine-reviewer` 9개 점검 항목에 "한국 응용·한국 클라이언트명 1개 이상" 추가, 미통과 시 재작성

### C. 인용 표준 (결정 근거 + 프로덕션 사례 + 공식 사양 3종)
- D5 (결정-근거 키워드 사전 검증), PB2 (프로덕션 1 + 사양 1), TF1 (3종 최소 인용 단위)
- **4/5 합의, 평균 +2**
- 실행: `magazine-writer` 프롬프트 + `source-verifier` 단계에 인용 표준 강제

### D. 새 채널/시드 추가
- D3 (한국 자사 디자인 6채널: 무신사 SeedDesign·29CM 매거진·아모레 STORIES·올리브영·SSF·LF몰)
- PL5 (한국 패션·뷰티 정책 발신처 + BoF·Retail Dive·Glossy)
- TH3 (시장 동기화 5채널: 무신사·CJ·careet·패션비즈·mobiinside)
- TF3 (분기 1회 브랜드 자사 사이트 직접 탐색)
- **4/5 합의, 평균 +1**
- 실행: `news-tracking/{design,service,dev}-sources.json` patch

### E. trend-radar 매거진 본문에 한국 시장 맥락 인용 의무
- PL2 (trend-radar 매거진 SERVICE 본문에 한국 시장 맥락 의무), PL4 (클라이언트 안건 후보), D2 정렬
- **3/5 직접, 5/5 충돌 없음**
- 실행: `magazine-writing-standard.md`에 인용 형식 신설

### F. DEV 라우팅 룰 강화 (AI 도구·SaaS announcement 제외)
- PB1 (제외 4패턴 + references/dev ★ 자동 승격), TF1 (인용 3종), D4 (카테고리 비율 — 부분 정렬)
- **3/5 직접, 5/5 충돌 없음**
- 실행: `dev-digest-agent-prompt.md` 이미 일부 반영, 추가 강화

## 충돌 안건 (1개) — Round 2 토론

### G. 카테고리 비율 재조정 (service 5 / design 4 / dev 3)
- D4 +1
- **다른 페르소나 미언급 + 메모리 룰(`feedback_curation_no_quota.md`)과 직접 충돌**: "호당 비율·수량 할당 금지"
- Round 2에서 두 가지 해석 중 합의 필요:
  - 옵션 1: 비율 X, *슬롯만 신설* (★ 후보가 없는 주엔 비움) — 메모리 룰과 일치
  - 옵션 2: 비율 강제 — 메모리 룰 위반

## 미언급 안건 (3개) — Round 2 평가 요청

### H. SERVICE 2-tier 서브태그 (frontline/system)
- PL3 +1 (frontline = 클라이언트 직행 — 멤버십·IA·CRM / system = 시스템 PM 한정 — 운영도구·내부 PRD)
- 다른 4명 평가 필요

### I. 분기별 market-brief 산출물 신규
- TH5 +1 (분기 1회 시장 흐름 종합)
- 다른 4명 평가 필요

### J. tf-leader 격주 자동 호출 + ★ 전수 비교 의무화
- TF5 +1 조건부 (토큰 부담)
- 다른 4명 평가 필요

## Round 2 안건

- 합의 6개 (A~F) 최종 확인 (사인 또는 수정 제안)
- 충돌 G — 비율 강제 X / 슬롯 신설 합의 가능한지
- 미언급 H, I, J — 각 4명이 평가
