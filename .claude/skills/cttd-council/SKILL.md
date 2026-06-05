---
name: cttd-council
description: CTTD 매거진 운영 방향에 대해 5명(senior-designer / senior-publisher / senior-planner / tf-leader / trend-hunter)이 council-orchestrator의 진행하에 라운드별 반복 회의를 진행해 *끝판왕 계획*을 도출한다. 최대 5 라운드, 합의 정체 시 강제 종료, 미합의는 사용자 결정 위임. 트리거 — "council", "끝판왕 계획", "방향 회의", "council iteration", "최종 운영 방향 결정".
---

# cttd-council — CTTD 매거진 운영 방향 합의 회의 (iteration)

5명(시니어 3 + tf-leader + trend-hunter)이 매거진 운영 방향에 대해 *합의될 때까지 반복 회의*. council-orchestrator가 진행하며 매 라운드 합의/충돌 분리, 다음 라운드 안건 정의. 종료 시 *끝판왕 계획*(`runs/YYYY-MM-DD/council/final-plan.md`) 발표.

## 흐름

```
사용자 트리거 (안건 명시)
        ↓
  [Phase 0] 베이스 자료 점검 — 매거진 + references + senior-meeting + tf-leader + trend-radar
        ↓
  [Phase 1] council-orchestrator 호출 (Agent tool 1회)
  orchestrator가 매 라운드 자율 진행:
    - Round 1: 5명 병렬 호출 → 안 제출
    - 종합 (합의/충돌/미언급 분리)
    - 종료 판정 (100% / 정체 / 라운드 < 5)
    - Round 2: 충돌·미언급 안건 + 다른 의견 보여주기 → 5명 재호출
    - 반복 (최대 5 라운드)
        ↓
  [Phase 2] final-plan.md 생성 확인 + 사용자에게 종합 보고
```

## Phase 0 — 베이스 자료 점검

다음 모두 존재해야 council 의미 있음:
- `public/data/magazine.json` 또는 최근 magazine-report.md
- `runs/YYYY-MM-DD/references/{design,service,dev}.md`
- `runs/YYYY-MM-DD/senior-meeting/{designer,publisher,planner}.md`
- `runs/_feedback/senior_voice.json`
- `runs/YYYY-MM-DD/tf-leader-report.md` (있으면 더 좋음)
- `runs/YYYY-MM-DD/trend-radar.md` (있으면 더 좋음)

빠진 자료가 있으면 사용자에게 *"X 자료가 없습니다, 그것 없이 진행할까요"* 한 번 알리고 진행 결정.

## Phase 1 — orchestrator 호출

`Agent` tool로 council-orchestrator 1회 호출. prompt에 다음 포함:
- CTTD 컨텍스트 (`cttd_company_context.md`, `cttd_persona_focus.md`)
- 회의 안건 (사용자가 명시한 것 또는 기본: "CTTD 매거진 퀄리티 높이기 위한 최종 운영 방향")
- 베이스 자료 경로 모두
- 5명 에이전트 이름 (senior-designer / senior-publisher / senior-planner / tf-leader / trend-hunter)
- 최대 라운드 (기본 5)
- 출력 폴더 (`runs/YYYY-MM-DD/council/`)

orchestrator는 자율적으로 라운드 진행, 종료 조건 만족 시 final-plan.md 작성.

## Phase 2 — 결과 종합 보고

`runs/YYYY-MM-DD/council/final-plan.md` 확인 후 한 페이지 보고:
- 총 라운드 수
- 합의 안건 수 / 위임 안건 수
- 종료 사유 (100% / 정체 / 최대 라운드)
- 끝판왕 계획 핵심 결정 3-5개 한 줄씩
- 즉시 적용·다음 회차·분기 단위로 분류된 실행 순서

## 트리거

- "council" / "끝판왕 계획" / "방향 회의" / "최종 운영 방향"
- "council iteration" / "합의 회의" / "5명 회의"
- 안건 명시 가능: "council — DEV 카테고리 비율" 같이

## 핵심 규칙

- **5명 중 4명+ 동방향 + 평균 점수 |≥1.0| = 합의**
- **최대 5 라운드 절대 상한**. 합의 정체면 그 라운드에서 강제 종료.
- **미합의는 사용자 결정 위임으로 솔직히 표기**. orchestrator가 임의 결정 X.
- **5명 의견 가공 금지** — orchestrator는 종합·진행만.
- **민감 정보 회의록 노출 금지**.
- **자동 발행/뉴스레터/Notion 동기화 일절 없음**. final-plan.md 작성만, 실제 docs/에이전트 수정은 사용자 별도 결정.

## 다른 시스템과의 관계

| 시스템 | 역할 |
|---|---|
| **cttd-council** | *방향 결정* — 5명 합의로 매거진 운영 방향 |
| senior-meeting | *평가* — 시니어 3명이 이번 회차 산출물 점검 |
| tf-leader | *외부 비교* — 우리 vs 외부 글 |
| trend-radar | *시장 동기화* — 지금 한국 핫트렌드 |
| reference-team | *자료 발견* — 라이브 레퍼런스 |
| digest/write/review | *생산 라인* — 매거진 본 흐름 |

council은 *분기/월 단위 큰 결정*. 매 회차마다 도는 게 아니라 *방향 재설정이 필요한 시점*에 호출.
