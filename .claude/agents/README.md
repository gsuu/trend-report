# .claude/agents — 에이전트 구조 가이드

CTTD 매거진·레퍼런스 파이프라인의 서브에이전트를 **역할군별 폴더**로 묶었다.
에이전트 호출은 frontmatter의 `name`으로 식별되므로 **폴더 위치는 호출에 영향 없다** (분류·탐색용).

## 그룹

| 폴더 | 에이전트 | 역할 |
|---|---|---|
| `personas/` | senior-designer · senior-publisher · senior-planner | CTTD 시니어 3 직무 측장 페르소나 |
| `scouts/` | design-reference-scout · dev-reference-scout · service-reference-scout · inspiration-scout | 레퍼런스 능동 탐색 |
| `market/` | trend-hunter · tf-leader | 시장 신호(트렌드) · 외부 벤치마크 |
| `pipeline/` | source-verifier · target-classifier · magazine-writer · magazine-reviewer · category-qa | 매거진 발행 파이프라인 |
| `orchestrator/` | council-orchestrator | 라운드 회의 진행자 |

## 에이전트 ↔ 스킬 매트릭스

`■` = 해당 스킬이 그 에이전트를 호출.

| 에이전트 | digest-collect | magazine-write | magazine-review | reference-scout | reference-team | senior-meeting | cttd-council |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| senior-designer | | | | | | ■ | ■ |
| senior-publisher | | | | | | ■ | ■ |
| senior-planner | | | | | | ■ | ■ |
| design/dev/service-reference-scout | | | | ■ | ■ | | |
| inspiration-scout | | | | | ■ | | |
| trend-hunter | | | | | ■ | | ■ |
| tf-leader | | | | | ■ | ■(옵션) | ■ |
| source-verifier | ■ | | ■ | | | | |
| target-classifier | ■ | | | | | ■ | |
| magazine-writer | | ■ | | ■(승격) | | | |
| magazine-reviewer | | | ■ | | | | |
| category-qa | | | ■ | ■(승격) | | | |
| council-orchestrator | | | | | | | ■ |

## 재사용·중복 메모

- **시니어 3 페르소나**는 senior-meeting·cttd-council이 공유 — senior-meeting=*직무 간 합의*, council=*운영 방향 합의*.
- **scout 3 에이전트**는 reference-scout·reference-team 둘이 공유하지만 **오케스트레이션·출력·용도가 다름** (의도적 분리):
  - `reference-scout` → `runs/.../references/{cat}.md` + ★5건 시 magazine-writer 승격 플로우 (매거진 보강 자료 라인)
  - `reference-team` → `runs/.../team-board/digest.md` + history.json 누적 + inspiration·trend 포함 (회사 라운지용 주간 수집)
  - 자세한 관계: `reference-team/SKILL.md`의 "다른 시스템과의 관계" 표.
- **trend-hunter / tf-leader**는 여러 스킬이 공유하는 횡단 에이전트.

## 변경 이력

- 2026-06-05: 평면 26개 → 역할군 폴더 구조로 재배치. 사용 빈도가 낮던 `avengers-assemble` 스킬과
  전용 스페셜리스트 12개(`avengers/`), 단독 실행 0회였던 `trend-radar` 스킬을 제거.
  trend-hunter 에이전트는 council·reference-team에서 계속 쓰이므로 `market/`에 보존.
