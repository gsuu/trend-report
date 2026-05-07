# trend-report — Claude 작업 가이드

이 파일은 **항상 자동 로드되는 운영 컨텍스트**입니다. 세부 기준 문서가 아니라, 작업 시작 시 반드시 알아야 하는 절대 규칙과 자료 위치만 둡니다.

## 절대 규칙

1. **뉴스레터 수동 발송 순서** — `/newsletter-send` 등 사람이 트리거하는 발송은 테스트 메일을 `jisuk@cttd.co.kr`로만 먼저 보내고, 사용자가 채팅에서 명시 확인한 뒤에야 `cxd@cttd.co.kr` 포함 모든 구독자에게 최종 발송합니다. 이 순서는 사용자가 한 번 승인했더라도 매 발송마다 다시 확인합니다. 자세한 흐름은 `AGENTS.md`의 Newsletter Approval Flow.
   - **예외:** Vercel cron(`/api/weekly-newsletters`, 목요일 10시 KST)에 의한 자동 발송은 의도된 동작이며 테스트·확인 단계 없이 Notion 구독자 전원에게 바로 나갑니다. cron 경로에 테스트 단계를 끼워넣지 마세요.
2. **Notion 동기화는 명시 요청 시에만** — Service/Design/DEV 발행 후 자동으로 Notion에 올리지 않습니다. `runs/YYYY-MM-DD/magazine/magazine-report.md` 갱신 후 `public/data/magazine.json`만 새로 고칩니다.
3. **원문 검증 없이 글쓰기 금지** — 모든 매거진 글은 최종 기준 원문(공식 뉴스룸/릴리즈 노트/제품 블로그)을 직접 열고 작성합니다. RSS 발췌나 큐레이션 글에서 본문을 만들지 않습니다.
4. **shortlist는 임의로 줄이지 않음** — `shortlist-20-30.md`의 항목은 글쓰기 단계에서 4~7개로 압축하지 않습니다. 원문 부족·광고성·화면 미확인만 `수집했지만 제외한 것`으로 이동합니다.
5. **위험한 git 작업은 확인** — `--force`, `reset --hard`, branch 삭제는 사용자 명시 승인 후에만.

## 자료 위치

| 무엇이 필요할 때 | 어디를 보나 |
|---|---|
| 운영 규칙 (뉴스레터 흐름, 카테고리별 표준, 한국어 자연스럽게) | [AGENTS.md](AGENTS.md) |
| 11단계 매거진 파이프라인 | [docs/magazine-agent-workflow.md](docs/magazine-agent-workflow.md) |
| 카테고리별 글쓰기 기준 | [docs/service-digest-agent-prompt.md](docs/service-digest-agent-prompt.md), [docs/design-digest-agent-prompt.md](docs/design-digest-agent-prompt.md), [docs/dev-digest-agent-prompt.md](docs/dev-digest-agent-prompt.md) |
| 수집 채널과 채택 기준 | [docs/data-collection-strategy.md](docs/data-collection-strategy.md) |
| 타겟 적합성 판정 기준 | [docs/target-fit-classifier-agent.md](docs/target-fit-classifier-agent.md) |
| 매거진 원고 출력 형식, 글쓰기 문체 | [docs/magazine-writing-standard.md](docs/magazine-writing-standard.md), [docs/editorial-style-guide.md](docs/editorial-style-guide.md) |
| 한국어 자연스럽게 다듬기 | [docs/agent-skills/humanize-korean/SKILL.md](docs/agent-skills/humanize-korean/SKILL.md) |
| 자동화 래퍼와 Task Scheduler 사용법 | [scripts/tracking/workflow-automation.md](scripts/tracking/workflow-automation.md) |

## 자주 쓰는 npm 명령

```bash
npm run fetch:service        # SERVICE 후보 수집
npm run fetch:design         # DESIGN 후보 수집
npm run fetch:dev            # DEV 후보 수집
npm run tracking:prepare     # 위 3개 합쳐 tracking-data.json + editorial-brief.md 생성
npm run tracking:workflow    # 한 번에 전체 파이프라인 (날짜 지정: -- --date=YYYY-MM-DD)
npm run tracking:quality     # 워크플로우 품질 게이트
npm run magazine:export-json # magazine-report.md → public/data/magazine.json
```

## 작업 단위 슬래시 스킬

매거진 발행 흐름은 4개 스킬을 순서대로 호출합니다.

1. `/digest-collect` — 일일 SERVICE/DESIGN/DEV 후보 수집부터 shortlist까지 (Phase 1~5)
2. `/magazine-write` — shortlist를 받아 `magazine-report.md` 작성 (Phase 6)
3. `/magazine-review` — 원문 대조 검수 + 카테고리 QA + magazine.json 재생성 (Phase 7~9)
4. `/newsletter-send` — 테스트 메일 → 명시 확인 → 최종 발송 (Phase 11)

각 스킬 안에서 다음 서브에이전트가 위임 처리됩니다 (`.claude/agents/`):
- `source-verifier` — 원문 검증
- `target-classifier` — 타겟 적합성 분류
- `magazine-writer` — 글쓰기
- `magazine-reviewer` — 9개 점검 항목 검수 + 수정 루프
- `category-qa` — 라우트·번호·areaKey 정합성

## 산출물 위치

- 원자료(JSON/fetch report): `runs/YYYY-MM-DD/raw/`
- 매거진 산출물(shortlist, magazine-report): `runs/YYYY-MM-DD/magazine/`
- 사이트 데이터: `public/data/magazine.json`
- 뉴스 소스 정의: `news-tracking/{service,design,dev}-sources.json`
