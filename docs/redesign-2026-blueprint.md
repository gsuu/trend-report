# Trend Report 재설계 청사진 (2026)

> 작성일: 2026-04-29
> 결정자: 지수 (gsuu.kwak@gmail.com)
> 상태: **설계 초안** — 검토 후 PoC 착수 예정

---

## 0. 한 줄 요약

기존의 **자체 스크래퍼 + Notion 연동 + 직렬 fetch + 정규식 메타 파싱**을 버리고,
**RSS 우선 + Claude Haiku 큐레이션 + 검증 라이브러리 + GitHub Actions 크론 + 정적 JSON 커밋**의 단순한 파이프라인으로 전환한다.

---

## 1. 결정사항 (Locked)

| 항목 | 결정 |
|---|---|
| 최종 결과물 | **웹잡지 사이트** (현 Vue 프론트 유지) |
| 수집 전략 | **RSS 우선 + AI 필터링** + got-scraping/metascraper로 메타 보강 |
| 실행 환경 | **GitHub Actions** (주간 cron) |
| 저장 방식 | **주차별 파일 분리 + manifest** — `src/data/weekly/{slug}.json` + `src/data/manifest.json` |
| 이슈 단위 | **주간** (월요일 발행) |
| 백안 보존 | **누적** (주차별 파일로 영구 보존) |
| 아티클 깊이 | **풍부** — `takeawayHtml + deckHtml + sections[].blocks[]` (현 수준 유지) |
| AI 모델 | `claude-haiku-4-5` (필터링은 배치, 에디토리얼 생성은 아티클당 호출) |
| 이메일 발송 | **nodemailer (Node 재작성)** — Python `send_newsletter.py` 대체 |
| 구독자 소스 | `config/subscribers.{audience}.txt` 텍스트 파일 |
| 이미지 | OG 이미지 **hotlink** (자체 호스팅 X) |
| Notion 연동 | **드롭** |
| 기존 소스 | 참고만 하고 sources.yaml로 새로 정의 |

---

## 2. 아키텍처

```
config/sources.yaml
config/subscribers.{service|design|dev}.txt
        │
        ▼
┌────────────────────────────────────────────┐
│  GitHub Actions: .github/workflows/        │
│    trend-weekly.yml (월요일 06:00 KST)     │
└──────────────────┬─────────────────────────┘
                   │
   ┌───────────────▼───────────────────────┐
   │  scripts/collect/index.ts             │
   │                                       │
   │  1) sources.yaml 로드                 │
   │  2) RSS fetch (rss-parser, 7일치)     │
   │  3) 이전 주차 manifest로 dedup        │
   │  4) AI 1차 필터 (Haiku 배치)          │
   │     - 관련도 점수 0~10, 카테고리      │
   │  5) 상위 N건만 본문 fetch             │
   │     (got-scraping + metascraper)      │
   │  6) AI 2차 에디토리얼 생성 (Haiku)    │  ← 풍부 아티클
   │     - takeawayHtml, deckHtml          │
   │     - sections[].blocks[] (HTML)      │
   │     - tags, referenceLinks            │
   │  7) src/data/weekly/{slug}.json 작성  │
   │  8) src/data/manifest.json 갱신       │
   │  9) src/data/report.json = 최신호 복사│  ← Vue 호환
   │  10) scripts/collect/notify.ts 호출   │
   │      → nodemailer로 audience별 발송   │
   │  11) git commit & push                │
   └───────────────┬───────────────────────┘
                   │ push trigger
   ┌───────────────▼───────────────┐
   │  Vercel: Vue 자동 빌드/배포   │
   └───────────────────────────────┘
```

---

## 3. 폴더 구조 (After)

```
trend-report/
├── src/
│   ├── App.vue                       ← 변경 최소화 (manifest+weekly 로드 추가)
│   └── data/
│       ├── manifest.json             ← 모든 주차 메타 목록
│       ├── weekly/                   ← 주차별 풍부 아티클
│       │   ├── 2026-W17.json
│       │   └── 2026-W18.json
│       ├── report.json               ← 최신호 복사본 (Vue 호환)
│       └── report.example.json       ← 폴백
├── scripts/
│   └── collect/                      ← 신규 (기존 scripts/tracking 대체)
│       ├── index.ts                      진입점 (workflow 오케스트레이션)
│       ├── fetch.ts                      RSS fetch + dedup
│       ├── enrich.ts                     got-scraping + metascraper
│       ├── filter.ts                     AI 1차 필터 (Haiku 배치)
│       ├── editorial.ts                  AI 2차 풍부 아티클 생성
│       ├── store.ts                      manifest + weekly + report 직렬화
│       ├── notify.ts                     nodemailer 발송 (audience별)
│       ├── types.ts
│       └── prompts/
│           ├── filter.system.txt
│           └── editorial.system.txt
├── config/
│   ├── sources.yaml                  ← 모든 소스 단일 출처
│   ├── subscribers.service.txt       ← 한 줄 한 이메일
│   ├── subscribers.design.txt
│   └── subscribers.dev.txt
├── templates/
│   └── newsletter.html               ← 기존 템플릿 재활용 (Mustache 치환만 변경)
├── .github/
│   └── workflows/
│       └── trend-weekly.yml          ← 월요일 cron
├── package.json
└── ...

# 삭제 대상
- scripts/tracking/*       (8 파일)
- scripts/notion/*         (Notion 드롭)
- scripts/newsletter/*     (Python 이메일 → Node nodemailer로 대체)
- news-tracking/*.json     (sources.yaml로 통합)
- runs/                    (주차별 파일이 아카이브 역할)
```

---

## 4. sources.yaml 스키마

```yaml
# config/sources.yaml
defaults:
  locale: global
  fetchTimeoutMs: 15000
  maxItemsPerSource: 30
  freshnessDays: 7

categories:
  - id: design
    label: 디자인
    audience: uiux
  - id: service
    label: 서비스
    audience: uiux
  - id: dev
    label: 개발
    audience: dev

sources:
  - id: ditoday-uiux
    name: DIGITAL iNSIGHT
    category: design
    rss: https://ditoday.com/feed/
    homepage: https://ditoday.com/ui-ux/
    sourceRole: reference
    locale: KR
    topics: [UIUX, Korean Design, Case Study]
    # 정규식 필터는 AI가 흡수 → 거의 안 씀
    # 단, 아주 명백한 노이즈만 예외 처리
    excludePatterns:
      - 채용|부트캠프|웨비나

  - id: figma-releases
    name: Figma Releases
    category: design
    rss: https://figmareleases.blogspot.com/feeds/posts/default
    sourceRole: official
    topics: [Figma, Design Tool, Workflow]

  # ... 기존 design/service/dev 통합 (예상 30~40개 소스)
```

**핵심 변화**: `includeTitlePatterns` / `valueTags` 같은 **수십 줄짜리 정규식 룰을 AI 큐레이터가 대체**한다. 사람이 정규식 룰을 유지보수할 필요가 사라짐.

---

## 5. AI 파이프라인 (2-Stage)

### Stage 1: 필터링 (배치, Haiku)

```ts
// scripts/collect/filter.ts (개념도)
// 30~80건 후보를 1회 배치로 처리
const FILTER_PROMPT = `
당신은 한국 웹에이전시(웹서비스/UIUX/웹퍼블리싱 전문)의 트렌드 큐레이터입니다.
다음 기사 후보를 검토하고 각각에 대해 JSON 배열로 출력:
{ id, relevance: 0~10, category: 'design'|'service'|'dev', tags: string[] }
관련도 6점 미만은 제외하고 결과 배열에서 빼주세요.
`;
// 1주에 1회 × 입력 ~30K + 출력 ~3K 토큰 ≈ $0.04
```

### Stage 2: 풍부 에디토리얼 생성 (아티클당, Haiku)

```ts
// scripts/collect/editorial.ts
// 통과한 5~10건 각각에 대해 본문 fetch 후 호출
const EDITORIAL_PROMPT = `
당신은 한국 웹에이전시 트렌드 매거진의 시니어 에디터입니다.
입력: 기사 본문 (fetch된 HTML 텍스트)
출력 (JSON):
{
  "takeawayHtml": "한 줄 핵심 — 우리 업무에 어떤 의미인지",
  "deckHtml": "2~3문장 데크 — 변화의 본질",
  "tags": ["...", "..."],   // 3~5개
  "sections": [
    {
      "title": "서비스 변화 요약",
      "blocks": [{ "kind": "list", "html": "..." }]
    },
    {
      "title": "우리 적용 시 고려",
      "blocks": [{ "kind": "list", "html": "..." }]
    }
  ],
  "referenceLinks": [{ "label": "관련 뉴스", "title": "...", "url": "..." }]
}
모든 텍스트는 한국어. HTML은 짧고 의미 있는 리스트 위주.
`;
// 7건 × (입력 4K + 출력 2K) × Haiku 단가 ≈ $0.08/주
```

**총 AI 비용 (월간)**: 약 $0.32 (필터 4주 + 에디토리얼 4주). Sonnet으로 에디토리얼 격상 시 ~$1.5/월.

---

## 6. GitHub Actions 워크플로우

```yaml
# .github/workflows/trend-weekly.yml
name: Weekly Trend Collection
on:
  schedule:
    - cron: '0 21 * * 0'   # 일요일 UTC 21:00 = 월요일 KST 06:00
  workflow_dispatch:

jobs:
  collect:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run collect
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
      - run: npm run notify
        env:
          SMTP_HOST:    ${{ secrets.SMTP_HOST }}
          SMTP_USER:    ${{ secrets.SMTP_USER }}
          SMTP_PASS:    ${{ secrets.SMTP_PASS }}
          MAIL_FROM:    ${{ secrets.MAIL_FROM }}
      - name: Commit & push
        run: |
          git config user.name "trend-bot"
          git config user.email "trend-bot@cttd.local"
          git add src/data/
          git diff --staged --quiet || git commit -m "data: $(date -u +'%Y-W%V') 주간 트렌드 갱신"
          git push
```

**Vercel 자동 배포**: push 즉시 Vue 사이트 빌드/배포.

**실패 격리**: `notify`가 실패해도 `collect`로 만들어진 데이터는 commit되도록 step 분리 가능 (선택).

---

## 7. 데이터 스키마

### 7.1 `src/data/manifest.json` — 주차 인덱스

```json
{
  "generatedAt": "2026-04-29T21:00:00Z",
  "weeks": [
    { "slug": "2026-W18", "weekLabel": "2026년 18주차", "publishedAt": "2026-04-29", "issueCount": 7 },
    { "slug": "2026-W17", "weekLabel": "2026년 17주차", "publishedAt": "2026-04-22", "issueCount": 6 }
  ]
}
```

### 7.2 `src/data/weekly/{slug}.json` — 주차별 풍부 데이터

기존 `src/data/report.json` 구조를 그대로 따른다 (`slug`, `title`, `description`, `issues[]` 그리고 각 issue가 `takeawayHtml`, `deckHtml`, `sections[].blocks[]`, `referenceLinks[]`, `tags`, `image` 보유).

### 7.3 `src/data/report.json` — Vue 호환 최신호

매주 cron 마지막 단계에서 `weekly/{최신주차}.json`을 그대로 복사. 현 Vue 코드(`import fallbackReport from "./data/report.example.json"`)는 변경 거의 없음.

### 7.4 Vue 추가 변경 (최소)

- `src/App.vue`에 manifest 로드 + 주차 선택 드롭다운 1개 추가
- 선택 시 `fetch('/data/weekly/${slug}.json')`로 동적 로드
- 메인 라우트(`/`)는 항상 최신호(report.json) 표시 — 기존 동작 유지
- 라우트 `/issue/:slug` 추가하면 백안 직링크 가능

---

## 8. 마이그레이션 단계 (4 + 1단계)

### Phase 0: 기준선 캡처 (1시간)
- 현재 `runs/2026-04-28/`을 별도 백업
- 현재 `report.json` 백업
- 지금 사이트 스크린샷 보관 (회귀 테스트 기준)

### Phase 1: 신규 파이프라인 PoC (반나절)
- `config/sources.yaml`에 **소스 3개만** 정의 (각 카테고리당 1개)
- `scripts/collect/index.ts` 최소 구현 (fetch → curate → JSON 출력)
- 로컬에서 1회 실행 → 결과 검수
- **합격 기준**: 관련도 ≥6 기사 5건 이상, 사람이 봤을 때 "맞다" 판단

### Phase 2: 전체 소스 확장 (1일)
- 기존 design/service/dev 소스 전체를 sources.yaml로 이전
- 큐레이터 프롬프트를 한국 웹에이전시 컨텍스트로 튜닝
- 메타 보강(metascraper) 추가
- **합격 기준**: 일 30건 이상 채택, 카테고리 분포 design/service/dev 균형

### Phase 3: GitHub Actions 자동화 (반나절)
- `.github/workflows/trend-collect.yml` 추가
- `secrets.ANTHROPIC_API_KEY` 등록
- 수동 트리거(`workflow_dispatch`)로 3회 검증
- **합격 기준**: 3회 연속 성공, 커밋 정상

### Phase 4: 운영 전환 + 구코드 제거 (반나절)
- 1주일 자동 실행 모니터링
- 안정화 확인 후 `scripts/tracking/`, `scripts/notion/`, `news-tracking/` 삭제
- README 갱신

### Phase 5 (선택): 회고 & 추가 개선
- 주간 리포트 자동 생성, 이메일 발송 등은 차후 결정

---

## 9. 비용 추정 (월간)

| 항목 | 비용 |
|---|---|
| GitHub Actions | 무료 (주 1회 cron 약 10분 사용) |
| Vercel 호스팅 | 무료 (현재 그대로) |
| Claude Haiku API | ~$0.32/월 (필터링 + 풍부 에디토리얼 4주분) |
| SMTP | 무료~ (Gmail/네이버 등) 또는 SendGrid 무료 tier |
| **합계** | **~$0.32/월** |

Sonnet 에디토리얼 격상 시 ~$1.5/월.

---

## 10. 리스크 & 완화책

| 리스크 | 영향 | 완화책 |
|---|---|---|
| RSS 일부 사이트가 부분 콘텐츠만 제공 | 큐레이션 정확도 저하 | metascraper로 OG description 보강 |
| Claude Haiku가 한국어 큐레이션 정확도 부족 | 채택률 저하 | A/B 테스트 후 필요 시 Sonnet 부분 사용 |
| GitHub Actions 빌드 시간 초과 | cron 실패 | 직렬 → 병렬 fetch (P-limit), 실패 소스 skip |
| OG 이미지 hotlink 깨짐 | UI 빈 이미지 | Vue에서 `onerror` 폴백 이미지 처리 |
| 봇 차단으로 metascraper 실패 | 메타 빈 값 | RSS의 `content:encoded` / `enclosure`로 폴백 |
| AI 환각으로 잘못된 요약 | 신뢰도 저하 | `relevance` < 6 자동 제외 + 주 1회 샘플 검수 |

---

## 11. 의사결정 (Resolved)

1. ✅ **주간 단위** 발행 (월요일 06:00 KST)
2. ✅ **주차별 파일 분리 + manifest** 누적
3. ✅ **이메일은 nodemailer Node 재작성**, 구독자는 `config/subscribers.{audience}.txt`

---

## 12. 다음 액션

- [ ] **이 설계 검토** — 누락/이의 있는지 확인 (지수)
- [ ] sources.yaml 초안 30~40개 작성
- [ ] PoC 코드 (`scripts/collect/index.ts` 최소 구현)
- [ ] 첫 실행 결과 함께 검수
