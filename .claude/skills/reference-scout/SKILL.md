---
name: reference-scout
description: 한국 시장 시점에서 라이브 레퍼런스(웹사이트·앱 화면·코드 데모)를 카테고리별 에이전트(service/design/dev-reference-scout)가 능동 탐색해 매거진 보강 자료 풀로 정리한다. 매거진 글 발행 흐름과 분리된 별도 산출물 라인. 트리거 — "레퍼런스 수집", "이번주 레퍼런스 찾아줘", "디자인 레퍼런스 갤러리", "reference scout".
---

# reference-scout — 카테고리별 라이브 레퍼런스 능동 탐색

이 스킬은 매거진 글 후보(RSS 기반)와 별도로, **살아있는 시각·구현 레퍼런스**를 카테고리별로 능동 탐색해 매거진 보강 자료 풀로 모은다.

## 카테고리별 타겟 (각자 다름, 공통은 한국 시장)

| 에이전트 | 메인 독자 | 보여주는 것 |
|---|---|---|
| **service-reference-scout** | 한국 웹서비스 기획자 / PM | 다음 OKR·스프린트 회의에 끌어올 IA·화면 분기·정책·CRM·멤버십 사례 |
| **design-reference-scout** | 한국 UIUX 디자이너 / 웹디자이너 | 다음 시각·브랜드·캠페인 시안에 끌어올 라이브 사이트 |
| **dev-reference-scout** | 한국 웹 퍼블리셔 / 프론트엔드 | 다음 스프린트에 바로 끌어다 쓸 라이브 데모 + 코드 패턴 |

세 카테고리 공통점 = **한국 시장**. 글로벌 일반론으로 흐르면 약함. 한국 회사 사례·한국 환경(브라우저 점유율·한국어 타이포)·한국 클라이언트 작업 시나리오를 우선.

> 배경: 2026-05-27 사용자 정정 — "각 카테고리는 타겟이 다르다, 공통은 한국 시장". 자세한 메모: `~/.claude/projects/.../memory/feedback_reference_scout_audience.md`.

설계 배경은 [runs/2026-05-27/reference-scout-design.md](../../../runs/2026-05-27/reference-scout-design.md)를 본다.

## 흐름

```
사용자 트리거 또는 주 1회
        ↓
  [Phase 1] 출력 폴더 준비
  runs/YYYY-MM-DD/references/  mkdir -p
        ↓
  [Phase 2] 카테고리별 에이전트 병렬 호출
  - design-reference-scout  (지금 활성)
  - service-reference-scout (TODO - 다음 단계)
  - dev-reference-scout     (TODO - 다음 단계)
        ↓
  [Phase 3] 결과 정리
  - references/design.md, service.md, dev.md 생성 확인
  - 한 줄 요약 보고 (카테고리별 항목 수, ★ 표시 수)
        ↓
  [Phase 4] (옵션) 매거진 글 승격 제안
  - ★ 5개 이상이면 사용자에게 "이번 주 디자인 레퍼런스 5선" 매거진 글로 승격할지 묻기
```

## Phase 1 — 출력 폴더 준비

```bash
DATE=$(date +%Y-%m-%d)
mkdir -p runs/$DATE/references
```

오늘 KST 기준. 사용자가 다른 날짜를 명시하면 그 날짜 사용.

## Phase 2 — 카테고리별 에이전트 호출

### 활성 (모든 카테고리)
- **service-reference-scout** — Mobbin·Page Flows·한국 서비스 뉴스룸 디자인 변경·디자이너 분석 매거진·새 출시 → `runs/YYYY-MM-DD/references/service.md`
- **design-reference-scout** — Hover States·Typewolf·Minimal Gallery·Godly·ProductHunt·Show HN·Codrops·갤러리(보조) → `runs/YYYY-MM-DD/references/design.md`
- **dev-reference-scout** — CodePen Picks·Codrops·web.dev case studies·Chrome blog·Show HN·GitHub Trending·Smashing UI → `runs/YYYY-MM-DD/references/dev.md`

사용자가 카테고리를 명시하면(예: "디자인 레퍼런스만") 해당 에이전트만 호출. 명시 없으면 세 에이전트 병렬 호출.

## Phase 3 — 결과 정리

각 references/{category}.md 파일에서:
- 항목 수
- ★ 표시 수
- "탐색 중 발견했지만 확인 불가" 섹션의 URL 수

한 줄 보고:
```
DESIGN: 8건 발견 (★ 4건), 봇 차단 1건
```

## Phase 4 — 승격 제안 (옵션)

★ 표시가 한 카테고리에 5개 이상이면 사용자에게 묻는다:

```
DESIGN references에 ★ 5건이 모였습니다. 
"이번 주 디자인 레퍼런스 5선" 매거진 글로 승격하시겠어요?
(승격 시 magazine-writer가 5장 카드 형식으로 한 글 작성)
```

승격 동의 시:
- references/design.md의 ★ 5개를 magazine-writer에 입력
- magazine-writer가 5장 카드 형식 한 글로 작성
- 기존 `magazine-write` → `magazine-review` → `category-qa` 흐름 그대로

승격 거절 시: references/design.md는 보강 자료로만 남는다 (다음 magazine-write 호출 때 자동 참조 안 함 — 명시 요청 시에만).

## 트리거 예시

- "레퍼런스 수집"
- "이번주 레퍼런스 찾아줘"
- "디자인 레퍼런스 갤러리"
- "reference scout" / "ref scout"
- "디자인 레퍼런스만 5개" (특정 카테고리 명시)

## 산출물

```
runs/YYYY-MM-DD/references/
├── design.md    (지금 활성)
├── service.md   (TODO)
└── dev.md       (TODO)
```

각 파일은 카테고리별 에이전트의 출력 형식(`.claude/agents/{category}-reference-scout.md` 참조)을 따른다.

## 절대 규칙

- **매거진 글 발행 흐름과 분리**. references/ 폴더는 별도 산출물.
- **자동 발행/뉴스레터/Notion 동기화 일절 없음**. CTTD 운영 규칙 그대로.
- **승격은 사용자 트리거만**. 자동 승격 금지.
- **봇 차단되면 그 항목 빼고 솔직히 보고**. 우회 시도 금지.
