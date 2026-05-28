---
name: digest-collect
description: 일일 SERVICE/DESIGN/DEV 매거진 후보 수집 오케스트레이터. fetch → collect_materials → 원문 검증 → 타겟 적합성 분류 → shortlist-20-30.md 작성까지 한 흐름으로 진행한다. 트리거 — "오늘 수집", "수집 돌려줘", "후보 수집", "digest 수집", "shortlist 만들어줘", "매거진 후보 정리". 글쓰기·리뷰·발송은 별도 스킬.
---

# digest-collect — 일일 매거진 후보 수집 오케스트레이터

이 스킬은 매거진 11단계 파이프라인의 **1~4단계(수집 → 원문 검증 → 타겟 적합성 분류 → shortlist)**를 한 번에 수행한다. 5단계 이후(글쓰기·리뷰·이미지·QA·Notion·뉴스레터)는 이 스킬의 범위가 아니다.

상세 기준 문서는 [docs/magazine-agent-workflow.md](../../../docs/magazine-agent-workflow.md), [docs/data-collection-strategy.md](../../../docs/data-collection-strategy.md), [docs/target-fit-classifier-agent.md](../../../docs/target-fit-classifier-agent.md), 카테고리별 [docs/service-digest-agent-prompt.md](../../../docs/service-digest-agent-prompt.md) / [docs/design-digest-agent-prompt.md](../../../docs/design-digest-agent-prompt.md) / [docs/dev-digest-agent-prompt.md](../../../docs/dev-digest-agent-prompt.md). 이 스킬은 절차만 정의하고 채택/제외 기준은 그 문서를 따른다.

## Phase 0: 날짜와 사전 점검

1. 사용자가 날짜를 지정하지 않았으면 **오늘 날짜(KST)**를 기본값으로 쓴다. 사용자에게 한 줄로 고지: `digest-collect — 대상 날짜: YYYY-MM-DD`.
2. `runs/YYYY-MM-DD/`가 이미 존재하고 `magazine/shortlist-20-30.md`가 있으면 **재실행 여부를 사용자에게 묻는다**. 재실행은 raw 데이터를 덮어쓴다.

## Phase 1: 후보 수집 (fetch)

세 카테고리를 병렬로 실행한다. 셋 다 같은 날짜 폴더에 출력한다.

```bash
npm run fetch:service
npm run fetch:design
npm run fetch:dev
```

각 명령은 `runs/YYYY-MM-DD/raw/{service,design,dev}-articles.json`과 `*-fetch-report.json`을 만든다. 명령 실패 시 사용자에게 에러를 그대로 보고하고 멈춘다 — 임의로 재시도하거나 다른 명령으로 우회하지 않는다.

## Phase 2: 통합 (collect_materials)

```bash
npm run tracking:prepare
```

이 명령은 위 세 fetch 결과를 합쳐 `runs/YYYY-MM-DD/raw/tracking-data.json`과 `editorial-brief.md`를 만든다. 제목 보정·채택/제외 판정·매거진 본문은 이 스크립트가 만들지 않는다 (스킬이 다음 Phase에서 처리).

## Phase 3: 원문 검증 (source-verifier 에이전트 위임)

`tracking-data.json`의 후보 전체를 `source-verifier` 서브에이전트에 넘긴다. 후보 수가 많으면 카테고리(service/design/dev)별로 나눠 **병렬** 호출 (한 메시지에 여러 Agent 호출).

source-verifier는 각 후보의 최종 기준 원문을 직접 열어 구체 사실 3개+를 추출하고 `검증 통과` / `원문 부족` / `원문 미확인`으로 판정한 결과를 `runs/YYYY-MM-DD/magazine/source-verification.json`에 저장해 돌려준다. 상세는 `.claude/agents/source-verifier.md`.

## Phase 4: 타겟 적합성 분류 (target-classifier 에이전트 위임)

`검증 통과` 후보를 `target-classifier` 서브에이전트에 넘긴다. target-classifier는 [docs/target-fit-classifier-agent.md](../../../docs/target-fit-classifier-agent.md) 기준으로 `core_ecommerce` / `commerce_adjacent` / `design_dev_reference` / `weak_promo` / `exclude` 판정과 `P0` / `P1` / `P2` / `제외` 우선순위를 부여한 결과를 `runs/YYYY-MM-DD/magazine/target-classification.json`에 저장해 돌려준다.

`weak_promo`와 `exclude`는 shortlist에 포함하지 않고 제외 메모로만 남긴다.

### Phase 4.5: ★ 자동 후보 등록 (council 2026-05-27 끝판왕 결정 #1)

지난 회차(가장 최근 날짜의 `runs/`)에서 다음을 읽어 *이번 회차 후보 풀에 P1로 자동 합류*시킨다:
- `runs/YYYY-MM-DD-1/references/{design,service,dev}.md`의 **★ 항목**
- `runs/YYYY-MM-DD-1/trend-radar.md`의 **★ 항목**
- `runs/YYYY-MM-DD-1/team-board/inspiration.md`의 **★ 항목** (있을 때)

**자동 등록 규칙**:
- 매거진 본문 강제 승격 X (메모리 룰 `feedback_curation_no_quota.md` 정합) — *후보 풀에 P1로 합류*만
- magazine-writer가 최종 채택은 자율 결정
- 이전 회차 출처가 이번 회차 자동 제외 룰(`_blocked-sources.json` `auto_exclude_keywords`)과 일치하면 자동 등록 보류
- 같은 사이트가 직전 2회차 안에 매거진 본문에 이미 발행됐다면 자동 등록 제외 (중복 회피)

`source-verifier`·`target-classifier`는 자동 등록 후보도 같은 흐름으로 검증·분류. 단 *★ 출처라는 신호*는 priority 가산점으로 한 칸 반영.

## Phase 5: shortlist 작성

`runs/YYYY-MM-DD/magazine/shortlist-20-30.md`를 작성한다.

**선발은 카테고리별로 독립적으로 수행한다.** SERVICE / DESIGN / DEV 세 카테고리는 한 풀에서 경쟁하지 않는다.

- **SERVICE**: 검증 통과 후보 중 P0 → P1 → P2 순으로 5~10개 선발. `core_ecommerce` 우선, `commerce_adjacent` 그 다음.
- **DESIGN**: 검증 통과 후보 중 P0 → P1 → P2 순으로 5~10개 선발. 디자인 시스템·화면 구현·브랜드 경험 직결 후보 우선.
- **DEV**: 검증 통과 후보 중 P0 → P1 → P2 순으로 5~10개 선발. 프론트엔드 구현·접근성·브라우저 QA·디자인-코드 연동 직결 후보 우선.
- 통과 후보가 5개 미만인 카테고리는 있는 것만 담고 강제로 채우지 않는다.
- 같은 점수면 [docs/data-collection-strategy.md](../../../docs/data-collection-strategy.md) 우선순위를 따른다.
- 각 항목에는 카테고리(Service/Design/DEV) + 소분류 + 직무 태그(`웹디자인`/`웹서비스기획`/`웹DEV`) + 최종 기준 원문 URL + 핵심 사실 3개 + 이미지 URL을 포함한다.
- **항목 제목(`### N. [...] 제목` 의 제목 부분)은 `source-verification-{service,design,dev}.json` 의 `title`(=원문 제목)을 그대로 사용한다.** 매거진 톤으로 다시 쓰거나 한국어로 번역·각색·요약하지 않는다. 영어 원문은 영어로, 한국어 원문은 한국어로. (룰 근거: [docs/magazine-writing-standard.md](../../../docs/magazine-writing-standard.md) "타이틀 작성 원칙" — 9c544b6 에서 결정. 매거진 본문과 shortlist 모두 동일 룰. 매니저가 슬랙 검토 시 매거진 편집본이 아닌 원문으로 판단할 수 있어야 한다.)
- 하단에 `## 수집했지만 제외한 것` 섹션을 두고 `weak_promo`·`exclude`·`원문 부족` 항목을 브랜드/출처/대분류/제외 사유/다시 볼 조건과 함께 남긴다.

shortlist는 글쓰기 단계에서 다시 줄이지 않는다는 점을 첫 줄에 명시한다.

## Phase 6: 사용자 보고

마무리로 한 메시지에 다음을 보고한다:

- 카테고리별 검증 통과/shortlist 선발/제외 개수 (예: SERVICE 12건 중 7 선발, DESIGN 8건 중 6 선발, DEV 6건 중 5 선발)
- shortlist 총 개수 (SERVICE N + DESIGN N + DEV N = 합계)
- 다음 단계 안내: "글쓰기로 진행하려면 `/magazine-write YYYY-MM-DD`" (스킬 미구현 시: "shortlist를 검토해주세요. 다음은 글쓰기 단계입니다.")

## 하지 않을 일

- 매거진 본문(요약/인사이트) 작성 — 글쓰기 스킬 범위.
- Notion 업로드 — 명시 요청 시에만.
- 뉴스레터 발송 — 별도 스킬.
- 사용자가 묻지 않은 카테고리 추가·삭제. shortlist 기준은 위 문서를 따른다.
