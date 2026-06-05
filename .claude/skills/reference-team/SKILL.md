---
name: reference-team
description: CTTD 레퍼런스 수집 단일 진입점. 두 모드 — (A) 주간 팀 보드 5 멤버(design/service/dev-reference-scout · trend-hunter · inspiration-scout)가 team-board/에 모으는 정기 수집, (B) 카테고리 집중 스카우트(scout 1~3명만 references/{cat}.md + ★5건 시 매거진 승격). 매거진 발행 흐름과 분리된 보강 자료 라인. 트리거 — 팀 모드 "레퍼런스 팀"·"reference team"·"팀 보드"·"이번 주 팀 보드" / 집중 모드 "레퍼런스 수집"·"디자인 레퍼런스만"·"reference scout"·"이번주 레퍼런스 찾아줘".
---

# reference-team — CTTD 레퍼런스 수집 단일 진입점

레퍼런스 수집은 이 스킬 하나로 들어온다. 트리거에 따라 두 모드로 갈린다. (구 `reference-scout` 스킬은 2026-06-05 이 스킬의 **Mode B**로 흡수됨.)

## 모드 라우팅

| 모드 | 언제 | 멤버 | 출력 |
|---|---|---|---|
| **A. 주간 팀 보드** (기본) | 카테고리 미지정 + "팀/주간/보드" | scout 3 + trend-hunter + inspiration-scout (5) | `team-board/digest.md` + history |
| **B. 집중 스카우트** | 카테고리 지정("디자인만") 또는 "레퍼런스 수집/scout" | 지정 카테고리 scout만 (1~3) | `references/{cat}.md` + ★5 시 매거진 승격 |

- "팀 보드", "reference team", "이번 주 팀 보드" → **Mode A**
- "레퍼런스 수집", "디자인 레퍼런스만", "reference scout" → **Mode B**
- 모호하면 한 줄로 되묻는다: "주간 팀 보드(5영역)인가요, 특정 카테고리 집중 수집인가요?"

아래 Phase 1~4는 **Mode A**. Mode B는 맨 아래 "## Mode B — 집중 스카우트" 참조.

---

## Mode A — 주간 팀 보드

5 멤버가 매주 같은 자리에 모여 *팀 보드*에 결과를 쌓는다. 각자 다른 시점 — 실무·시장·영감 — 으로 수집해서, *디자이너 180·퍼블리셔 30·기획자 10 누구도 흥미 한 가지는 가져갈* 풀을 만든다.

| 멤버 | 시점 | 출력 |
|---|---|---|
| design-reference-scout | 실무 디자인 라이브 사이트 | `team-board/design.md` |
| service-reference-scout | 한국 서비스 화면·정책 | `team-board/service.md` |
| dev-reference-scout | 라이브 데모 + 코드 | `team-board/dev.md` |
| trend-hunter | 한국 핫트렌드 | `team-board/trend.md` |
| **inspiration-scout** | **영감·무드·잡담거리** | `team-board/inspiration.md` |

## 흐름

```
사용자 트리거 (기본 주 1회 권장, 월요일 아침)
        ↓
  [Phase 1] 팀 보드 폴더 준비
  runs/YYYY-MM-DD/team-board/  mkdir
        ↓
  [Phase 2] 5 멤버 병렬 호출 (Agent tool 5개)
        ↓
  [Phase 3] team-board 종합 — 회사 라운지용 한 페이지
  runs/YYYY-MM-DD/team-board/digest.md
  - 5 영역에서 ★ 1-2건씩 (총 5-10건)
  - "오늘의 한 컷": 가장 임팩트 있는 1건
  - 영역별 분포
        ↓
  [Phase 4] 누적 — runs/_team-board/history.json
  - 회차별 ★ 키워드 / 발견 매체 / 화제거리 누적
  - 같은 사이트·키워드 중복 회피 신호
```

## Phase 1 — 폴더 준비

```bash
DATE=$(date +%Y-%m-%d)
mkdir -p runs/$DATE/team-board
mkdir -p runs/_team-board
```

## Phase 2 — 5 멤버 병렬 호출

`Agent` tool로 5개 동시. 각 prompt:
- CTTD 컨텍스트 (`cttd_company_context.md`, `cttd_persona_focus.md`)
- 본인 명세 위치 (scout 3 + inspiration-scout → `.claude/agents/scouts/{role}.md`, trend-hunter → `.claude/agents/market/trend-hunter.md`)
- 출력 파일 (`runs/YYYY-MM-DD/team-board/{role}.md`)
- 누적 메모리 (`runs/_team-board/history.json` — 있으면 중복 회피)
- senior_voice.json (있으면 시니어 wish를 우선 키워드로)

5명은 *서로 독립적으로* 본인 시점 수집. 의견 충돌 없음 (영역이 다름).

## Phase 3 — 팀 보드 종합

오케스트레이터(메인)가 5개 파일 읽고 한 페이지 종합 작성:

`runs/YYYY-MM-DD/team-board/digest.md`

```markdown
# 팀 보드 — 이번 주 (YYYY-MM-DD)

> 5 멤버가 모은 레퍼런스. 디자이너·퍼블리셔·기획자 누구도 *한 가지 흥미*는 가져갈 풀.

## 오늘의 한 컷
- (5개 영역 중 가장 임팩트 강한 1건, URL + 한 줄)

## 영역별 ★ TOP 2

### 디자인 — 실무 라이브 사이트
1. ★ ...
2. ★ ...

### 서비스 — 한국 화면·정책
1. ★ ...
2. ★ ...

### DEV — 라이브 데모 + 코드
1. ★ ...
2. ★ ...

### 한국 트렌드
1. ★ ...
2. ★ ...

### 영감·잡담거리 (inspiration)
1. ★ ...
2. ★ ...

## 영역별 분포 + 메타
- 디자인 X건 / 서비스 Y / DEV Z / 트렌드 W / 영감 V (총 N)
- 한국 매체 비율 / 글로벌 비율
- 신규 발견 매체 (이전 회차 없던)
- 중복 회피된 사이트 수 (history.json 기반)
```

## Phase 4 — 누적 (runs/_team-board/history.json)

```json
{
  "rounds": ["2026-05-27"],
  "discovered_sites": [
    {"url": "...", "first_seen": "2026-05-27", "by": "design-reference-scout"}
  ],
  "hot_keywords_by_round": {
    "2026-05-27": ["키워드1", "키워드2", ...]
  },
  "media_diversity": {
    "design": ["Hover States", "Awwwards", "Lapa", ...],
    "service": [...], "dev": [...], "trend": [...], "inspiration": [...]
  },
  "team_meta": {
    "total_rounds": 1,
    "total_items": 0
  }
}
```

다음 회차 5명이 이 history를 *중복 회피*에 활용. 같은 사이트가 또 들어오지 않음.

## 트리거

- "레퍼런스 팀" / "reference team"
- "팀 보드" / "team board"
- "팀 레퍼런스 수집" / "이번 주 팀 보드"
- 특정 멤버만 명시 가능: "팀 보드 — inspiration만"
- 정기: 사용자가 schedule로 매주 월요일 (자동 트리거 X)

## 다른 시스템과의 관계

| 시스템 | 역할 | 출력 |
|---|---|---|
| **reference-team** | *주 1회 팀 수집* — 5 영역 한 풀 | `team-board/digest.md` |
| (이 스킬 Mode B) | 단독 카테고리 깊이 호출 | `references/{cat}.md` |
| senior-meeting | 산출물 *평가* | `senior-meeting/` |
| tf-leader | 외부 *비교* | `tf-leader-report.md` |
| cttd-council | *방향 결정* 5명 합의 | `council/final-plan.md` |

Mode A는 *주간 정기 수집*, Mode B는 *특정 영역 깊이 작업*. 한국 트렌드(trend-hunter)는 별도 trend-radar 스킬을 폐지하고 이 스킬의 한 멤버로만 수집한다.

---

## Mode B — 집중 스카우트 (구 reference-scout)

카테고리를 지정한 단독 수집. scout 1~3명만 호출해 `references/{cat}.md`를 만들고, ★가 모이면 매거진 글로 승격할 수 있다. Mode A의 team-board/·history·inspiration·trend는 쓰지 않는다.

### 카테고리별 타겟 (각자 다름, 공통은 한국 시장)

| 에이전트 | 메인 독자 | 보여주는 것 |
|---|---|---|
| **service-reference-scout** | 한국 웹서비스 기획자 / PM | 다음 OKR·스프린트 회의에 끌어올 IA·화면 분기·정책·CRM·멤버십 사례 |
| **design-reference-scout** | 한국 UIUX 디자이너 / 웹디자이너 | 다음 시각·브랜드·캠페인 시안에 끌어올 라이브 사이트 |
| **dev-reference-scout** | 한국 웹 퍼블리셔 / 프론트엔드 | 다음 스프린트에 바로 끌어다 쓸 라이브 데모 + 코드 패턴 |

공통점 = **한국 시장**. 글로벌 일반론으로 흐르면 약함. (배경: feedback_reference_scout_audience 메모)

### 흐름

```
[B1] mkdir -p runs/YYYY-MM-DD/references
[B2] 지정 카테고리 scout 호출 (미지정이면 3개 병렬) → references/{cat}.md
[B3] 결과 정리 — 카테고리별 항목 수 / ★ 수 / 봇 차단 수 한 줄 보고
[B4] (옵션) ★ 5건 이상이면 "이번 주 {카테고리} 레퍼런스 5선" 매거진 글 승격 제안
```

- **B4 승격 동의 시**: references/{cat}.md의 ★ 5개를 magazine-writer에 입력 → 5장 카드 형식 한 글 → 기존 `magazine-write → magazine-review` 흐름.
- **승격은 사용자 트리거만**. 자동 승격 금지.
- 각 파일은 카테고리별 에이전트 출력 형식(`.claude/agents/scouts/{category}-reference-scout.md`)을 따른다.

### Mode B 절대 규칙
- 매거진 발행 흐름과 분리. references/는 보강 자료.
- 자동 발행/뉴스레터/Notion 동기화 없음.
- 봇 차단되면 그 항목 빼고 솔직히 보고. 우회 금지.

## 절대 규칙

- **매거진 발행 흐름과 분리** — 팀 보드는 라운지용, 매거진 본문에 *강제 삽입* X
- **자동 발행/뉴스레터/Notion 동기화 X**
- **민감 정보(클라이언트 작업·내부 자료) 노출 금지**
- **5 멤버 결과는 가공 없이 종합만** — 각자 시점 유지
- **history.json 중복 회피** — 같은 사이트 또 안 들어오게
- **★ 5건 미만이면 미만으로** — 채워넣기 금지

## 첫 회차 (2026-05-27)

오늘 이미 4 멤버(design-reference-scout v2 / service-reference-scout v2 / dev-reference-scout v2 / trend-hunter) 결과가 `runs/2026-05-27/references/`와 `trend-radar.md`에 있다. 신규 inspiration-scout만 단독 호출 + 결과 5개를 *team-board/*에 모아 첫 digest 작성. 다음 회차부터는 5명 모두 새로 호출.
