---
name: avengers-assemble
description: 직무별 어벤저스팀(웹퍼블리셔 / 웹디자이너 / 이커머스PO)을 소집해, 측장(senior-*) 1명 + 스페셜리스트 4명이 같은 자료(이번 회차 shortlist·매거진·레퍼런스 등)를 각자 시점에서 평가하고 측장이 한 장으로 합친 액션 보고서를 만든다. 트리거 — "어벤저스 소집", "어벤저스팀", "avengers assemble", "퍼블리셔팀 소집", "디자이너팀 소집", "PO팀 소집", "직무팀 평가".
---

# avengers-assemble — 직무별 어벤저스팀 소집 오케스트레이터

CTTD 세 직무팀을 소집해 한 자리에서 같은 자료를 *직무 시점으로 분해 → 측장이 종합*한다. senior-meeting이 시니어 3명의 *직무 간 합의*를 본다면, avengers-assemble은 *한 직무 안의 세부 전문성*을 깊게 판다.

## 팀 편성

| 팀 | 측장(재사용) | 스페셜리스트 4 |
|---|---|---|
| **웹퍼블리셔 어벤저스** | senior-publisher | interaction-engineer · a11y-guardian · css-platform-scout · component-systemizer |
| **웹디자이너 어벤저스** | senior-designer | brand-bx-lead · ux-research-strategist · visual-trend-curator · design-system-architect |
| **이커머스PO 어벤저스** | senior-planner | commerce-flow-pm · ai-commerce-strategist · membership-crm-planner · growth-metrics-analyst |

## Phase 0: 어느 팀, 무슨 자료

1. 사용자 트리거에서 **소집할 팀**을 정한다. 미지정이면 세 팀 모두.
   - "퍼블리셔팀"→publisher, "디자이너팀"→designer, "PO팀"→po.
2. **평가 대상 자료**를 정한다. 미지정이면 가장 최근 `runs/YYYY-MM-DD/`의:
   - `magazine/shortlist-20-30.md` (있으면 우선)
   - 없으면 `magazine/magazine-report.md`
   - 추가로 있으면 `references/*.md`
3. 대상 날짜·팀·자료 경로를 한 줄로 고지: `avengers-assemble — 날짜 YYYY-MM-DD · 팀 [publisher/designer/po] · 자료 <경로>`.

## Phase 1: 스페셜리스트 병렬 호출

선택된 팀마다 스페셜리스트 4명을 **한 메시지에서 병렬**로 호출한다(여러 팀이면 전부 한 번에). 각 에이전트에 동일하게 전달:
- 평가 대상 자료 경로(직접 Read)
- 자기 직무 시점에서 ① 바로 쓸 것 ② 지켜볼 것/경고 ③ 측장에게 넘길 쟁점 으로 분해하라는 지시
- 출력은 `## <agent-name>` 마크다운 섹션 + 한 줄 총평. 근거(URL·명세·화면) 없는 일반론 금지.

각 스페셜리스트 결과를 `runs/YYYY-MM-DD/avengers/<team>/<agent-name>.md`에 저장한다.

## Phase 2: 측장 종합

스페셜리스트 4명 결과가 모이면 해당 팀 측장(senior-*)을 호출한다. 측장에게:
- 스페셜리스트 4개 섹션 전부 + 원자료 경로 전달
- 역할: 중복 제거, 충돌 조정, **팀 차원 우선순위 TOP 3 액션**과 **다음 회차 wish list** 도출
- 기존 누적(`runs/_feedback/senior_voice.json`)과 정합 유지 — 측장은 평소처럼 자기 voice에 누적 가능

측장 종합을 `runs/YYYY-MM-DD/avengers/<team>-report.md` 머리에 싣고, 그 아래 스페셜리스트 4섹션을 붙인다.

## Phase 3: 사용자 보고

팀별로 한 메시지에 보고:
- 소집한 팀과 멤버
- 팀별 **TOP 3 액션** (측장 종합에서)
- 산출물 경로: `runs/YYYY-MM-DD/avengers/<team>-report.md`
- 충돌·미합의로 사용자 결정이 필요한 것이 있으면 명시

## 하지 않을 일
- 자료 자체를 새로 수집하지 않는다(그건 digest-collect·reference-scout). 어벤저스팀은 *이미 있는 자료*를 직무 시점으로 판다.
- 매거진 본문 수정·발행·Notion·뉴스레터 — 범위 밖.
- 측장/스페셜리스트가 shortlist 항목을 임의로 추가·삭제하지 않는다. 평가·우선순위 의견만 낸다.
