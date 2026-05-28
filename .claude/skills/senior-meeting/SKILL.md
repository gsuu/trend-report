---
name: senior-meeting
description: CTTD 시니어 3명(senior-designer / senior-publisher / senior-planner) + 옵션으로 tf-leader(외부 벤치마크)를 한자리에 모아 매거진·references 산출물을 평가하고, 회의록 + 누적 의견(senior_voice.json) + 외부 벤치마크 보고서(옵션)를 만든다. 트리거 — "시니어 미팅", "senior meeting", "시니어 소집", "이번 호 시니어 평가". TF Leader 함께 호출: "시니어 미팅 + 벤치마크", "외부 비교 포함" 또는 별도 "벤치마크" / "외부 비교" / "더 좋은 자료 조사".
---

# senior-meeting — CTTD 시니어 페르소나 미팅 오케스트레이터

매 회차 산출물(매거진 + references)을 받아 **시니어 3명을 병렬 호출**, 직무별 회의록을 모으고 누적 의견을 `runs/_feedback/senior_voice.json`에 쌓는다. 다음 회차 reference-scout·writer·digest-collect가 그 누적을 참조해 점진적으로 개선된다.

설계 배경: 2026-05-27 사용자가 처음 Hermes Agent(PyPI)로 시니어 페르소나를 구현하려 했으나 보안 마찰(키 노출·classifier 차단)로 자체 시스템으로 전환. Hermes의 "skill self-improvement" 패턴 = CTTD의 sub-agent + senior_voice.json 누적.

## 흐름

```
사용자 트리거 또는 정기 (매 회차 발행 후)
        ↓
  [Phase 1] 입력 수집
  - public/data/magazine.json (또는 지정 magazine-report.md)
  - runs/YYYY-MM-DD/references/{design,service,dev}.md
  - runs/_feedback/senior_voice.json (있을 때)
        ↓
  [Phase 2] 시니어 3명 병렬 호출 (Agent tool, 같은 메시지에 3개 호출)
  - senior-designer
  - senior-publisher
  - senior-planner
        ↓
  [Phase 2.5] (옵션) tf-leader 호출 — "+벤치마크", "외부 비교 포함" 트리거 시
  - 시니어 ★ 후보·Borderline·반복 wish 항목을 외부와 직접 비교
  - 결과: runs/YYYY-MM-DD/tf-leader-report.md
        ↓
  [Phase 3] 회의록 정리
  - runs/YYYY-MM-DD/senior-meeting/{designer,publisher,planner}.md 확인
        ↓
  [Phase 4] 누적 갱신
  - runs/_feedback/senior_voice.json append + merge
  - 같은 pattern은 count 증가, 새 pattern은 append, last_round_summary는 덮어쓰기
        ↓
  [Phase 5] 종합 보고
  - 세 시니어 합의 (Cut/Keep 공통)
  - 직무별 wish 한 줄씩
  - 누적 압력 신호 (예: "디자이너 wish '한국 디자인 시스템 운영기' 3회 누적 → 채널 추가 검토")
```

## Phase 1 — 입력 수집

기본 입력:
- 매거진: `public/data/magazine.json` (54건 누적) 또는 사용자가 명시한 `runs/YYYY-MM-DD/magazine/magazine-report.md`
- references: `runs/<오늘>/references/design.md`, `service.md`, `dev.md` (없는 카테고리는 생략)
- 누적: `runs/_feedback/senior_voice.json` (없으면 첫 회차)

출력 폴더 준비:
```bash
DATE=$(date +%Y-%m-%d)
mkdir -p runs/$DATE/senior-meeting
mkdir -p runs/_feedback
```

## Phase 2 — 시니어 3 병렬 호출

`Agent` tool로 3개 호출 (같은 메시지). 각 호출의 prompt에 *공통 컨텍스트*:
- CTTD 정체성 (`~/.claude/projects/.../memory/cttd_company_context.md`) — 패션 이커머스 디자인 에이전시, 180:30:10
- 회의 주제 (기본: "이번 회차 산출물 평가 + 다음 호 wish 누적")
- 입력 파일 경로 (위)
- 누적 메모리 위치 (`runs/_feedback/senior_voice.json`)
- 본인 출력 파일 경로 (예: `runs/YYYY-MM-DD/senior-meeting/designer.md`)

세 에이전트는 *서로 독립적으로 직무 시점*만 갖고 평가한다. 의견 충돌은 의도된 신호.

## Phase 3 — 회의록 정리

세 파일이 모두 생성됐는지 확인:
- `runs/YYYY-MM-DD/senior-meeting/designer.md`
- `runs/YYYY-MM-DD/senior-meeting/publisher.md`
- `runs/YYYY-MM-DD/senior-meeting/planner.md`

빠진 게 있으면 보고.

## Phase 4 — senior_voice.json 누적

세 에이전트가 각자 `senior_voice.json`의 자기 섹션을 갱신했다. 오케스트레이터는 *동시 쓰기 충돌* 위험을 막기 위해:
- 세 에이전트가 *각자 별도 임시 파일*(`runs/YYYY-MM-DD/senior-meeting/{role}-voice.json`)에 본인 섹션만 쓰게 한다
- Phase 4에서 오케스트레이터가 세 파일을 읽어 `senior_voice.json` 한 파일로 merge

merge 규칙:
- 각 섹션(designer/publisher/planner)은 독립
- `wish_history`는 append (회차별)
- `strong_rejects`는 같은 pattern이면 count 증가, 없으면 추가
- `discovered_patterns`는 같은 pattern 없을 때만 추가
- `last_round_summary`는 덮어쓰기

## Phase 5 — 종합 보고

사용자에게 한 페이지로:

```markdown
## 시니어 미팅 종합 (YYYY-MM-DD)

### 세 시니어 합의 Cut
- 매거진 X건, references Y건이 세 명 모두 Cut 지목

### 직무별 Keep (가장 강한 한 건씩)
- 디자이너: ...
- 퍼블리셔: ...
- 기획자: ...

### 다음 호 wish (직무별 한 줄)
- 디자이너: ...
- 퍼블리셔: ...
- 기획자: ...

### 누적 압력 신호
- 디자이너 wish '한국 디자인 시스템 운영기' 누적 N회 → 채널 추가 검토
- 퍼블리셔 reject '백엔드 비교 글' 누적 M회 → exclude 룰 강화 검토

### 시스템 제안 (세 시니어 합쳐 가장 강한 하나)
```

## senior_voice.json 스키마 (전체)

```json
{
  "designer": {
    "wish_history": [{"round": "YYYY-MM-DD", "items": ["..."]}],
    "strong_rejects": [{"pattern": "...", "since": "YYYY-MM-DD", "count": 1}],
    "discovered_patterns": [{"pattern": "...", "first_seen": "YYYY-MM-DD", "example": "..."}],
    "last_round_summary": "..."
  },
  "publisher": { /* 동일 구조 */ },
  "planner": { /* 동일 구조 */ },
  "system_meta": {
    "rounds": ["2026-05-27", "..."],
    "total_meetings": 1
  }
}
```

## 다른 에이전트의 senior_voice.json 활용

- **reference-scout 3종** — 회차 시작 시 `senior_voice.json` 읽고 *각 직무의 누적 wish*를 탐색 우선순위로
- **magazine-writer** — 본문 쓸 때 누적 reject 패턴 회피 (예: "N% 매출 PR" 자동 톤 회피)
- **target-classifier** — 강한 reject가 누적된 발행처/주제는 P1 이하로 자동 강등

매거진 시스템 모든 에이전트가 *시니어의 목소리를 읽고 반영*하도록 점진 통합.

## 트리거

- "시니어 미팅" / "senior meeting"
- "시니어 소집" / "이번 호 시니어 평가"
- "직무별 평가 받아줘"
- 사용자가 명시 호출만 (자동 트리거 X)

## 절대 규칙

- **세 에이전트는 독립**. 한 에이전트가 다른 에이전트 결과를 보고 의견 바꾸지 않음.
- **CTTD 컨텍스트 매번 베이스**. 일반론 금지.
- **누적 갱신은 오케스트레이터가 안전하게**. 동시 쓰기 충돌 방지 (임시 파일 → merge).
- **사용자 자동 발송·자동 발행 흐름과 분리**. 회의록은 산출물일 뿐, 매거진 자동 수정 X.
- **민감 정보(API 키, 클라이언트 내부 정보) 회의록에 노출 금지**.
