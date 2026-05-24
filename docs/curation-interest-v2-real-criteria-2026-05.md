# 매거진 큐레이션 v2 — 진짜 기준은 "에이전시 실무 적용도" 회의록 (2026-05-24)

> 9번째 회의([curation-interest-meeting-2026-05.md](curation-interest-meeting-2026-05.md))에서 정의한 5시그널(`hot_topic`·`vivid_case`·`surprising`·`familiar`·`quotable`)이 실제 사용자 직감과 빗나갔다. NN/g Qwen AI 글이 3개 시그널 강이었는데도 사용자 평가는 "관심 없을 것 같다". 사용자에게 직접 "어떤 글이 흥미로운가" 물었더니 6개 패턴 중 **B (같은 업종 다른 회사) · C (강한 디자인 사례) · D (다음 프로젝트 도구)** 만 골랐고, A(일상 한국 서비스)·E(실패 사례)·F(기타)는 빠졌다.
>
> 사용자 직감의 핵심 의미: **"흥미"가 아니라 "에이전시 실무에 직접 쓸 만한가"가 진짜 기준이다.** 추상적 흥미 시그널 대신 실무 적용도 시그널로 재배치한다.

## 참석자

| 역할 | 정체 |
|---|---|
| 편집장 | 진행 |
| 사용자 직감 대변 | B·C·D 선택 근거 명시 |
| CTTD 시니어 기획자·디자이너·퍼블리셔 | 각 직무가 매거진을 펴는 진짜 순간 |
| 매거진B / 롱블랙 / 서핏 에디터 (9번째 회의에서 이어짐) | 큐레이션 매체 관점 |
| 매거진 편집 라이터 | 시그널 변화가 작성에 미치는 영향 |
| 시스템 운영자 | 자동 평가 가능성 |

---

## 진단

**편집장**: NN/g Qwen AI 글이 9번째 회의 5시그널 평가로 `vivid_case`·`surprising`·`quotable` 3개 강 → `published`였습니다. 그런데 사용자는 "관심 없을 것 같다"고 평가했어요.

**사용자 직감 대변**: 알리바바=중국, 우리 클라이언트와 거리, AI 에이전트로 음료 주문 = 우리가 당장 클라이언트에 제안할 일 X, NN/g 영문 원문 = 친숙함 약. 글의 사용자 인용·수치가 강해도 **우리 에이전시 작업과 거리가 멀면 매거진 펴서 관심 안 가는 게 정상**.

**CTTD 시니어 기획자**: 매거진을 펴는 진짜 순간을 다시 짚어봅니다.
- 회의 직전 — 이번 클라이언트(예: 패션 커머스 PO)에게 들고 갈 사례 찾기
- 시안 작업 중 — 톤·구조 참고할 디자인 찾기
- 다음 분기 도구 검토 — 새 도구·기술 발표 따라잡기

세 순간 모두 **"우리 작업과 직접 연결되는가"** 가 1차 기준입니다. 흥미는 그 다음.

**서핏 큐레이터**: 큐레이션 매체에서 "실용성 우선"이라는 결을 명시 안 했지만, 사실 통과시키는 글 90%가 "독자가 자기 작업에 쓸 만한가"가 1차였습니다. 잡지B 같은 매거진은 다른 결이지만, 우리는 에이전시 자료라 실용 결이 더 강해야 합니다.

**사용자 직감 대변**: 사용자가 고른 B·C·D를 정리하면:
- **B**: 우리가 작업한·작업 중인 클라이언트와 **같은 업종** 다른 회사의 변화 → 클라이언트 업종 매칭
- **C**: 시각적으로 강한 디자인 사례 (시즌 캠페인·랜딩·브랜드 리뉴얼) → 디자이너 시안 인용용
- **D**: 새 도구·기술 발표 (Figma·Vercel·Vite·Storybook·v0 등) → 다음 프로젝트 적용

이 3가지가 **에이전시 실무 적용 1차 기준**.

**매거진 편집 라이터**: A(일상 한국 서비스 변화)가 빠진 게 의외였습니다. 토스·카카오 같은 메이저도 우리 클라이언트와 직결 안 되면 관심 약하다는 뜻?

**사용자 직감 대변**: 정확히. 친숙해도 우리 작업에 쓸 일 없으면 관심 안 갑니다. 친숙함은 보조 시그널.

**시스템 운영자**: 그러면 5시그널을 **1차 / 보조** 두 층으로 재배치하면 됩니다. 1차 1개 이상 강한 글만 통과.

---

## 회의 안건 4개

### 안건 1. 1차 시그널 3개 신설 — 실무 적용도

| 시그널 | 정의 | 자동 평가 가능성 |
|---|---|---|
| 🏢 **`client_industry_match`** (클라이언트 업종 매칭) | 우리 에이전시가 작업한·작업 중인 클라이언트와 같은 업종 다른 회사의 사례 | ✅ 자동 — `clientFit`이 `CTTD_INDUSTRIES` 화이트리스트와 교집합 |
| 🎨 **`visual_impact`** (시각 임팩트) | 시각적으로 강한 디자인 사례 — 시즌 캠페인·랜딩·브랜드 리뉴얼·인터랙션·키비주얼 | △ 자동 일부 — 이미지 1장 이상 + `category` ∈ {design, fashion_brand, visual} + (사람 평가 보강) |
| 🔧 **`next_project_tool`** (다음 프로젝트 도구) | 우리 다음 프로젝트에 적용 가능한 새 도구·기술·환경설정 발표 | ✅ 자동 — `codeArtifacts` 1개 이상 OR `brandNormalized` ∈ DEV_TOOL_BRANDS (Figma·Vercel·Vite·11ty·Astro·Tailwind·Storybook·shadcn·v0·Cursor·Anthropic·OpenAI·Notion 등) |

**합의**: 1차 시그널 1개 이상 강해야 통과. 1차 시그널이 0개면 보조 시그널이 다 강해도 `monthly_digest` 또는 제외.

### 안건 2. CTTD_INDUSTRIES 화이트리스트 정의

**편집장**: `client_industry_match` 자동 평가를 위해 CTTD가 현재 또는 최근 작업한 클라이언트 업종 리스트가 필요합니다.

**CTTD 시니어 기획자**: 현재(2026년 5월 기준) 작업한 업종을 묶으면 (예시):

```
CTTD_INDUSTRIES = [
  "fashion_commerce",    # 패션 커머스
  "beauty_commerce",     # 뷰티 커머스
  "food_d2c",            # 식품 D2C
  "lifestyle_commerce",  # 라이프스타일 커머스
  "content_platform",    # 콘텐츠 플랫폼
  "fintech",             # 핀테크
  "marketplace",         # 마켓플레이스
]
```

(실제 CTTD 운영진과 확인하여 업데이트 필요 — 이번 회의는 스키마와 화이트리스트 자리 정의까지)

**시스템 운영자**: AGENTS.md About CTTD 절에 화이트리스트 자리 신설. 운영진이 분기별로 갱신.

### 안건 3. 보조 시그널 3개 유지 — 1차 보강용

| 시그널 | 9번째 회의 정의 그대로 유지 |
|---|---|
| `vivid_case` (사례 구체성) | 사용자 인용·구체 수치·인물 발화 1+ |
| `familiar` (친숙함) | 한국 메이저 + 글로벌 메이저 + 기술 매체 화이트리스트 |
| `quotable` (인용 가능성) | 한 줄 압축 가능성 |

**합의**: 보조 시그널은 1차 시그널과 함께 있을 때 글의 품질을 보강. 1차 시그널 없이 보조만 강한 글은 통과 X. (9번째 회의의 `hot_topic`·`surprising`은 폐기 — 추상적이고 평가 어려움)

### 안건 4. 새 3단 분류 기준

| 분류 | 기준 |
|---|---|
| `published` | 1차 시그널 1개 이상 강 + (보조 시그널 1개 이상 강 OR 적합성 P0/P1) |
| `monthly_digest` | 1차 시그널 0개 + 보조 시그널 2개 이상 강 |
| `excluded_interest` | 1차 시그널 0개 + 보조 시그널 1개 이하 |

---

## 9번째 회의에서 정정되는 부분

| 9번째 회의 항목 | v2에서 |
|---|---|
| 5시그널 정의 (`hot_topic`·`vivid_case`·`surprising`·`familiar`·`quotable`) | △ 보정 — `hot_topic`·`surprising` 폐기, 3개 1차 시그널 신설(`client_industry_match`·`visual_impact`·`next_project_tool`), `vivid_case`·`familiar`·`quotable`는 보조로 격하 |
| 자동 평가 3개 / 사람 평가 2개 | △ 변경 — 자동 평가 5개(1차 2개·보조 3개) + 사람 평가 0개(폐기). 사람 평가는 운영자가 분기별로 CTTD_INDUSTRIES 화이트리스트 갱신하는 것으로 대체 |
| 3단 분류 기준 (시그널 2+ → published, 1 → monthly_digest, 0 → 제외) | △ 변경 — 1차 시그널이 우선 기준 (안건 4) |
| target-classifier·source-verifier·shortlist 가이드 | △ 새 시그널·자동 평가로 보정 |
| NN/g Qwen AI v3 sample (시그널 강) | ❌ 폐기 — 1차 시그널 0개라 v2 기준으로는 `monthly_digest` 또는 제외 |

---

## 새 v3 sample 후보 — 1차 시그널 강한 글

누적 글 또는 가상 후보 중 1차 시그널 강한 글:

| 후보 | 1차 시그널 | 코멘트 |
|---|---|---|
| **무신사 / 컬리 / 올리브영의 시즌 기획전 화면 리뉴얼** | `client_industry_match`(패션·뷰티·식품) + `visual_impact` | 가장 정합 |
| **Figma Config 발표 — Dev Mode·새 plugin·디자인 시스템 도구** | `next_project_tool` + `familiar` | 디자이너·퍼블리셔 모두 |
| **Vite 7 / Astro 5 새 기능 발표** | `next_project_tool` + (DEV에 한정) | DEV 전용 |
| **토스 디자인 시스템 리뉴얼** | `client_industry_match`(핀테크) + `visual_impact` + `familiar` | 3시그널 강 |
| **NN/g Qwen AI 사용자 테스트** | ❌ 1차 시그널 0개 | v2 기준 통과 X |
| **오늘의집 144종 큐레이션** | △ `client_industry_match`(라이프스타일) 약하게 | v2 기준 `monthly_digest` |

**추천**: **토스 디자인 시스템 리뉴얼** 또는 **무신사 시즌 기획전 화면 리뉴얼** — 1차 시그널 2-3개 강.

---

## 합의 사항 4가지

1. **1차 시그널 3개 신설** — `client_industry_match` · `visual_impact` · `next_project_tool`. 1개 이상 강해야 통과.
2. **보조 시그널 3개로 격하** — `vivid_case` · `familiar` · `quotable` 유지. 9번째의 `hot_topic`·`surprising` 폐기.
3. **CTTD_INDUSTRIES 화이트리스트** AGENTS.md About CTTD 절에 신설 (분기별 갱신). 초기값 7종: fashion_commerce·beauty_commerce·food_d2c·lifestyle_commerce·content_platform·fintech·marketplace.
4. **새 3단 분류** — 1차 우선 (안건 4 표).

---

## 다음 액션 8단계

| 단계 | 작업 | 상태 |
|---|---|---|
| 1 | AGENTS.md About CTTD에 CTTD_INDUSTRIES 화이트리스트 절 신설 | 대기 |
| 2 | docs/target-fit-classifier-agent.md 9번째 5시그널을 1차/보조 재배치 | 대기 |
| 3 | docs/magazine-agent-workflow.md §4 shortlist 가이드의 사람 평가 2개 부분 제거 | 대기 |
| 4 | target-classifier 프롬프트 — 1차 시그널 3개 자동 평가 로직 추가, 9번째 출력 필드 보정 | 대기 |
| 5 | source-verifier 프롬프트 — vivid_case는 보조로 유지 (변경 없음) | 대기 |
| 6 | parser interestSignals/interestClass 호환 유지, INTEREST_SIGNAL_KEYS에 3개 추가·`hot_topic`/`surprising` 호환 처리 | 대기 |
| 7 | magazine-writer 큐레이션 노트 가이드 — 1차 시그널 시점을 자연스럽게 녹임 (예시 갱신) | 대기 |
| 8 | v3 sample 글 교체 — 토스 디자인 시스템 리뉴얼 또는 무신사 시즌 기획전 (1차 시그널 2+ 강) | 대기 |
