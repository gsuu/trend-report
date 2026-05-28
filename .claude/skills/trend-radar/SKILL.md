---
name: trend-radar
description: 대한민국 핫트렌드(비즈니스·서비스·문화·세대·브랜드)를 trend-hunter 에이전트로 매주 능동 수집해 runs/YYYY-MM-DD/trend-radar.md에 정리한다. CTTD 패션·뷰티 클라이언트 제안 자료의 *맥락 보강용* 라인 — 매거진·references와 분리된 별도 산출물. 트리거 — "한국 트렌드", "이번 주 트렌드", "trend radar", "trend hunter", "핫트렌드 수집", "한국 시장 동향".
---

# trend-radar — 대한민국 핫트렌드 주간 정찰 오케스트레이터

매주 1회 trend-hunter 에이전트를 호출해 한국 비즈니스·서비스·문화·세대·브랜드 트렌드를 5-10건 수집한다. CTTD 패션·뷰티 클라이언트 제안 자료의 *맥락 보강*용. 매거진·references와 별도 라인.

## 흐름

```
사용자 트리거 또는 매주 1회 (월요일 권장)
        ↓
  [Phase 1] 출력 폴더 준비
  runs/YYYY-MM-DD/  mkdir -p
        ↓
  [Phase 2] 입력 점검
  - runs/_feedback/senior_voice.json (있을 때) — 시니어 반복 wish를 검색 우선순위로
  - 이전 회차 trend-radar.md (있으면) — 중복 회피
        ↓
  [Phase 3] trend-hunter 호출 (Agent tool)
  - RSS (outstanding.kr + mobiinside)
  - 페이지 스크래핑 (careet · longblack · platum)
  - WebSearch (한국 매체 능동 검색)
  - 본문 직접 확인 후 5-10건 선별
        ↓
  [Phase 4] 결과 정리 + 보고
  - runs/YYYY-MM-DD/trend-radar.md 생성 확인
  - 카테고리 분포 + ★ 수 한 줄 보고
        ↓
  [Phase 5] (옵션) senior_voice.json에 트렌드 신호 누적
  - 핫키워드를 system_meta에 기록해서 다음 회차 senior-meeting / reference-scout가 참조
```

## Phase 1 — 출력 폴더

```bash
DATE=$(date +%Y-%m-%d)
mkdir -p runs/$DATE
```

## Phase 2 — 입력 점검

- `runs/_feedback/senior_voice.json` 읽기 (있을 때)
  - 세 직무의 `wish_history` 최근 회차 + 빈도 누적된 키워드 추출
  - trend-hunter에 *우선 검색 키워드*로 전달
- `runs/YYYY-MM-DD-1/trend-radar.md` 같은 이전 회차 (있으면) — 같은 트렌드 키워드 중복 회피용으로 trend-hunter에 전달

## Phase 3 — trend-hunter 호출

`Agent` tool로 1회 호출. prompt에 포함:
- CTTD 컨텍스트 (`cttd_company_context.md`, `cttd_persona_focus.md`)
- 명세 위치 (`.claude/agents/trend-hunter.md`)
- 출력 파일 경로 (`runs/YYYY-MM-DD/trend-radar.md`)
- 시니어 우선 키워드 (Phase 2에서 추출)
- 이전 회차 중복 회피 리스트 (Phase 2)

## Phase 4 — 결과 정리

`trend-radar.md` 파일 확인:
- 총 항목 수 / ★ 수
- 카테고리별 분포 (패션/뷰티/라이프스타일·세대/콘텐츠·문화/비즈니스·서비스/AI·기술)
- 다음 주 관찰 포인트

한 단락 보고 사용자에게.

## Phase 5 — (옵션) 핫키워드 누적

`senior_voice.json`의 `system_meta`에 다음 추가:

```json
"system_meta": {
  "rounds": [...],
  "total_meetings": N,
  "hot_keywords_by_round": {
    "2026-05-27": ["키워드1", "키워드2", ...]
  }
}
```

다음 회차 reference-scout·senior-meeting이 이 hot_keywords를 보조 신호로 활용.

## 트리거

- "한국 트렌드" / "이번 주 트렌드"
- "trend radar" / "trend hunter" / "핫트렌드 수집"
- "한국 시장 동향" / "한국 뷰티 트렌드" / "한국 패션 트렌드" (특정 도메인)
- 정기: 사용자가 schedule로 매주 월요일 트리거 가능 (자동 트리거 X — 사용자 명시)

## 다른 시스템과의 관계

| 시스템 | 시점 |
|---|---|
| **trend-radar** | *지금 한국 시장*이 어떻게 움직이는가 (외부 맥락) |
| reference-scout | 디자인·서비스·DEV 라이브 레퍼런스 (자료 발견) |
| senior-meeting | 우리 산출물 평가 (내부) |
| tf-leader | 우리 vs 외부 글 비교 (벤치마크) |
| digest-collect → magazine-write → magazine-review | 매거진 본 라인 |

trend-radar 결과는 *매거진·reference-scout 본 라인에 직접 끼지 않는다*. 대신 다음 회차들이 *맥락으로 참조*:
- senior-meeting에서 시니어가 "지금 한국에서 X가 뜨는데 우리 매거진에 없다" 같은 비평 근거로
- reference-scout가 *지금 뜨는 키워드 도메인*의 사이트 우선 탐색
- magazine-writer가 글 본문에 *지금 한국 맥락* 한 줄로 인용 (예: "2026-05-27 outstanding.kr에 따르면 ...")

## 절대 규칙

- **매거진 발행 흐름과 분리**. 매거진 글 본문에 trend-radar 결과를 *강제 삽입* 금지.
- **자동 발행/뉴스레터/Notion 동기화 일절 없음**. CTTD 운영 규칙 그대로.
- **민감 정보(클라이언트 내부 계약·금액) 검색 키워드 포함 금지**.
- **단순 PR·정치·시사 거부** — 트렌드 신호만.
