# CTTD 매거진 끝판왕 계획 (2026-05-27)

> Council 5명 (senior-designer · senior-publisher · senior-planner · tf-leader · trend-hunter) **2 라운드만에 100% 합의** 도출. 총 9개 결정 (운영 6 + 미언급 3 흡수). 미합의 0건.

---

## 한 줄 결론

**매거진은 "디자이너 180·퍼블리셔 30·기획자 10명이 다음 회의에 그대로 들고 가는 카드"가 된다.** references/trend-radar의 ★ 후보가 매거진 본문으로 자동 흐르고, 매 글에는 한국 패션·뷰티 클라이언트 응용·인용 표준이 게이트로 박힌다. 비율 강제 없이 *좋은 글이면 다 싣고 없으면 비운다* 원칙을 시스템화.

---

## 9개 결정 (Council 5/5 합의)

### 운영 결정 6개

#### 1. ★ 자동 후보 등록 파이프라인 (A)
- **결정**: `references/{design,service,dev}.md` ★ + `trend-radar.md` ★ 항목이 다음 회차 `digest-collect` Phase 4에서 *자동 후보로 등록* (강제 승격 X, 후보 풀에 P1로 합류).
- **점수**: 5/5 +2 (평균 +2.0)
- **실행 위치**: `scripts/tracking/collect_materials.mjs` 또는 `.claude/skills/digest-collect/SKILL.md` Phase 4
- **즉시 / 다음 회차**: 다음 호 `/digest-collect` 호출부터

#### 2. 한국 응용·환경 게이트 (B)
- **결정**: 모든 매거진 글에 다음 중 하나 이상 필수
  - **SERVICE·DESIGN**: 한국 클라이언트명 1개 + 응용 단락 한 단락
  - **DEV**: 한국 환경 4축(iOS Safari·한글·모바일·접근성) 중 1개 명시
- **점수**: 5/5 +2
- **실행 위치**: `.claude/agents/magazine-reviewer.md` 9개 점검 항목에 추가. 미통과 시 재작성 루프.

#### 3. 카테고리별 차등 인용 표준 (C)
- **결정**:
  - **DEV**: 3종 인용 (합성 데모 + 공식 사양 MDN/W3C + 프로덕션 사례)
  - **SERVICE**: 2종 인용 (한국 정책 + 글로벌 비교)
  - **DESIGN**: 2종 인용 (케이스 + 결정 근거)
- **점수**: 5/5 +2
- **실행 위치**: `docs/magazine-writing-standard.md` 카테고리별 인용 표 추가, `source-verifier`가 사전 검증

#### 4. 새 채널/시드 정식 추가 + 제외 채널 명시 (D)
- **결정 — 추가 채널**:
  - 한국 자사 디자인 6 (무신사 SeedDesign·29CM 매거진·아모레 STORIES·올리브영·SSF·LF몰)
  - 한국 production 사례 3 (토스·카카오·우아한형제들 기술블로그 dev-sources에)
  - 한국 패션·뷰티 정책 발신처 (DIGITAL iNSIGHT·디조닷컴·무신사 뉴스룸·토스피드)
  - 글로벌 비교 매체 3 (BoF·Retail Dive·Glossy)
  - 시장 동기화 5 (무신사 뉴스룸·CJ뉴스룸·careet·패션비즈·mobiinside)
- **결정 — 제외 채널 명시**: `news-tracking/_blocked-sources.json` 신설, 2주 연속 0건이면 자동 제외
- **점수**: 5/5 +2 (trend-hunter 상향 권고)
- **실행 위치**: `news-tracking/{service,design,dev}-sources.json` 일괄 patch

#### 5. SERVICE 본문 한국 시장 맥락 인용 의무 (E)
- **결정**: SERVICE 매거진 본문 마지막 단락에 `trend-radar` 1-2건 *"한국 시장 맥락"*으로 의무 인용. DEV·DESIGN은 면제 (DEV는 인용 3종, DESIGN은 응용 단락이 동일 역할).
- **점수**: 5/5 +2
- **실행 위치**: `docs/service-digest-agent-prompt.md` + `magazine-writer` SERVICE 프롬프트

#### 6. DEV 라우팅 룰 강화 (F)
- **결정**: 4패턴 자동 제외 — AI 코드 에디터·SaaS 릴리즈·관리 도구·AI 모델 비교. AI 도구 비교는 SERVICE 카테고리로 재라우팅 가능성 검토.
- **점수**: 5/5 +2
- **실행 위치**: `docs/dev-digest-agent-prompt.md` (이미 일부 반영, 4패턴 명시 추가)

### 흡수·수정 결정 3개

#### 7. SERVICE `frontline_score` 가중치 (H 흡수)
- **결정**: 2-tier 서브태그 신설 X, `target-classifier`에 `frontline_score 0~2` 가중치 한 칸 추가. frontline = 클라이언트 직행(멤버십·IA·CRM), system = 운영도구·내부 PRD. 분포만 관찰, 2-3회차 누적 후 UI 분리 재검토.
- **합의**: 4명 ✓ + planner 흡수안
- **실행 위치**: `docs/target-fit-classifier-agent.md` SERVICE 부분

#### 8. 월간 market-brief 산출물 신규 (I 수정)
- **결정**:
  - 형식: **1페이지 단일 슬라이드**
  - 주기: **월 1회 정기 + 분기당 최대 2회 핫이슈 트리거**
  - 콘텐츠 표준: 7요소 (시장 흐름·핵심 키워드·클라이언트 안건·자료 출처 등)
  - 발행 흐름 영향 0 (별도 라인)
- **합의**: 4명 ✓ + publisher 절충안
- **실행 위치**: 새 스킬 `.claude/skills/market-brief/SKILL.md` + trend-hunter 명세 확장

#### 9. tf-leader 트리거 룰 명문화 (J 수정)
- **결정**: 격주 자동 X. **월 1회 + 상위 3건만 비교**. 트리거 조건: 시니어 명시 / ★ 누적 15건+ / 매월 첫 회차 중 하나. 1-2개월 운영 후 유지/후퇴 사용자 판단.
- **합의**: 5명 모두 격주 거절 + tf-leader 본인 수정안
- **실행 위치**: `.claude/agents/tf-leader.md` + `.claude/skills/senior-meeting/SKILL.md` Phase 2.5

---

## 실행 순서 (우선순위)

### 즉시 (이번 세션 또는 사용자 다음 명령)
1. **결정 4** — `news-tracking/{service,design,dev}-sources.json` patch (채널 추가 + `_blocked-sources.json` 신설)
2. **결정 6** — `docs/dev-digest-agent-prompt.md` 4패턴 명시 추가
3. **결정 2 (게이트)** — `.claude/agents/magazine-reviewer.md` 9개 점검 항목 갱신

### 다음 회차 (다음 `/digest-collect` 호출)
4. **결정 1** — ★ 자동 후보 등록 파이프라인 (Phase 4)
5. **결정 3** — 카테고리별 차등 인용 표준 (`magazine-writing-standard.md` + `source-verifier`)
6. **결정 5** — SERVICE 본문 한국 시장 맥락 인용 의무

### 1개월 단위
7. **결정 7** — `frontline_score` 가중치 한 칸 (관찰만, 분포 누적)
8. **결정 8** — 월간 market-brief 첫 발행 (스킬 신설)
9. **결정 9** — tf-leader 월 1회 트리거 룰 작동

### 1-2개월 후 재검토
- 결정 7: 서브태그 UI 분리 필요한지
- 결정 9: 월 1회 유지 vs 분기로 후퇴
- 결정 8: 월 1회 vs 격월 조정

---

## 라운드 진행 요약

- **Round 1**: 5명 각자 5개 안건 제출 → 합의 6개 / 충돌 1개 / 미언급 3개
- **Round 2**: 합의 6개 사인 + 충돌 1개 (5/5 옵션 1) + 미언급 3개 모두 수정 합의
- **종료**: Round 2 끝, **100% 합의** (수정 형태 포함). Round 3 불필요.

총 라운드 2/5. 합의율 9/9 (100%). 사용자 결정 위임 0건.

---

## 사용자 액션

위 9개 결정 중 어떤 것부터 *실제로 patch*할지 사용자가 선택. 또는 *순서대로 다 적용*. 또는 *지금 일단 끝판왕 계획 확정만, 적용은 다음 세션*.

**가장 빠른 효과**: 결정 1+2+6 (★ 자동 후보 + 한국 응용 게이트 + DEV 4패턴 제외) — 다음 회차 산출물에 즉시 변화. *디자이너 180·퍼블리셔 30·기획자 10명*이 다음 회차 매거진을 열었을 때 *"이거 우리 일에 닿는다"*는 첫인상을 만드는 핵심.
