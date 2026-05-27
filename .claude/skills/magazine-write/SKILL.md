---
name: magazine-write
description: shortlist-20-30.md를 받아 magazine-report.md를 작성한다. 카테고리별로 magazine-writer 에이전트에 항목을 위임해 본문을 만들고 한 파일로 합친다. 트리거 — "글쓰기 진행", "magazine-report 작성", "shortlist 글로 써줘", "매거진 본문 만들어줘". digest-collect의 다음 단계.
---

# magazine-write — 매거진 본문 작성 오케스트레이터

이 스킬은 [docs/magazine-agent-workflow.md](../../../docs/magazine-agent-workflow.md) 11단계 중 **6단계 글쓰기**를 수행한다. 5단계까지는 [/digest-collect](../digest-collect/SKILL.md)가 끝낸 상태를 전제한다. 7단계 이후(리뷰·이미지·QA·Notion·뉴스레터)는 별도 스킬.

## Phase 0: 입력 점검

1. 사용자가 날짜를 지정하지 않았으면 가장 최근 `runs/YYYY-MM-DD/magazine/shortlist-20-30.md`를 사용. 한 줄 고지: `magazine-write — 대상 날짜: YYYY-MM-DD`.
2. 다음 파일이 있어야 한다:
   - `runs/YYYY-MM-DD/magazine/shortlist-20-30.md`
   - `runs/YYYY-MM-DD/magazine/source-verification.json` (구체 사실 추출 결과)
   - `runs/YYYY-MM-DD/magazine/target-classification.json` (타겟 판정)
3. shortlist 1줄 고지: shortlist 항목은 임의로 4~7개로 줄이지 않는다 ([CLAUDE.md](../../../CLAUDE.md) 절대 규칙 4).

## Phase 1: 항목 분리

shortlist를 카테고리별로 분리한다 (`service` / `design` / `dev`). 각 항목에 source-verification·target-classification에서 추출한 구체 사실, 이미지 URL, 직무 태그를 매칭해 둔다.

## Phase 2: 글쓰기 위임

각 항목을 `magazine-writer` 서브에이전트에 위임한다. 카테고리가 같은 항목들은 **병렬로** 호출해 시간을 줄인다 (한 메시지에 여러 Agent 호출).

위임 시 magazine-writer에 다음을 명시:
- 카테고리 (`service`/`design`/`dev`)
- shortlist 항목 markdown
- 최종 기준 원문 URL
- 사전 추출된 구체 사실 3개+
- 이미지 URL과 출처

magazine-writer는 [docs/magazine-writing-standard.md](../../../docs/magazine-writing-standard.md) 형식으로 markdown 블록을 반환한다.

## Phase 3: 합치기

반환된 블록을 `runs/YYYY-MM-DD/magazine/magazine-report.md`로 합친다. 순서는 [docs/data-collection-strategy.md](../../../docs/data-collection-strategy.md) shortlist 우선순위(이커머스 core 먼저 → platform/fintech/global service)를 따른다.

article 번호는 1부터 연속해서 부여한다. 카테고리 헤더(`## SERVICE`, `## DESIGN`, `## DEV`)를 둔다.

발행 여부는 슬랙 매니저 검토(weekly-shortlist-slack 흐름)에서 이미 결정됨. 이 스킬은 shortlist 의 active 항목을 그대로 본문으로 옮기는 작업만 한다. magazine-writer 가 `문제 보고`(원문 접근 자체가 불가하거나 본문 회수 실패) 한 항목이 있으면 사용자에게 알리고 어떻게 처리할지 묻는다 — 자동으로 제외하지 않는다.

## Phase 4: 사용자 보고

마무리에 한 메시지로:

- 작성 완료 항목 수 (카테고리별)
- magazine-writer 가 `문제 보고`한 항목이 있으면 사유와 함께 별도 표시 (있는 경우만)
- 다음 단계: `리뷰로 진행하려면 /magazine-review YYYY-MM-DD`

## 하지 않을 일

- 원문 검증을 새로 하지 않는다 (digest-collect Phase 3에서 끝난 일).
- shortlist 항목을 평가해 제외하지 않는다 — 발행 여부는 슬랙 매니저 검토에서 이미 결정됨.
- `public/data/magazine.json`을 갱신하지 않는다 — magazine-review 통과 후 별도 단계에서.
- Notion 업로드하지 않는다 ([CLAUDE.md](../../../CLAUDE.md) 절대 규칙 2).
