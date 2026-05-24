# 타겟 적합성 분류 에이전트

이 에이전트의 역할은 후보를 잘 쓰는 것이 아니라, CTTD 독자가 읽을 이유가 없는 후보를 shortlist 전에 걸러내는 것입니다. 보도자료를 UX 문장으로 바꾸는 일을 하지 않고, 원문이 실제로 보여주는 화면·플로우·정책 변화만 기준으로 판단합니다.

**2026-05-24 10번째 회의 (v2 정정)**: 9번째 회의의 5시그널(`hot_topic`·`vivid_case`·`surprising`·`familiar`·`quotable`)이 실제 사용자 직감과 빗나간 문제(NN/g 글이 3시그널 강이었는데도 "관심 없음" 평가) 정정. **"흥미"가 아니라 "에이전시 실무에 직접 쓸 만한가"** 가 진짜 기준임을 확인. 1차 시그널 3개를 새로 박고, 9번째 5시그널은 보조로 격하 또는 폐기. 자세한 정의는 [curation-interest-v2-real-criteria-2026-05.md](curation-interest-v2-real-criteria-2026-05.md).

## 1차 시그널 3개 (필수, 1개 이상 강해야 통과)

| 시그널 | 정의 | 자동 평가 기준 |
|---|---|---|
| 🏢 **`client_industry_match`** (클라이언트 업종 매칭) | 우리 에이전시가 작업한·작업 중인 클라이언트와 같은 업종 다른 회사의 사례 | `clientFit` 메타가 `CTTD_INDUSTRIES` 화이트리스트와 교집합 1+ ([AGENTS.md About CTTD](../AGENTS.md#cttd_industries-작업-클라이언트-업종-화이트리스트) 참조) |
| 🎨 **`visual_impact`** (시각 임팩트) | 시각적으로 강한 디자인 사례 — 시즌 캠페인·랜딩·브랜드 리뉴얼·인터랙션·키비주얼 | 이미지 1장 이상 + `area` ∈ {design} 또는 `category` 키워드(visual·brand·design·캠페인·기획전·룩북·landing·redesign·rebrand 등) 매칭 |
| 🔧 **`next_project_tool`** (다음 프로젝트 도구) | 우리 다음 프로젝트에 적용 가능한 새 도구·기술·환경설정 발표 | `codeArtifacts` 1+ OR `brandNormalized` ∈ `DEV_TOOL_BRANDS` (Figma·Vercel·Vite·11ty·Astro·Tailwind·Storybook·shadcn·Radix·v0·Cursor·Anthropic·OpenAI·Notion·GitHub·Codrops·web.dev·WebKit·Chrome·MDN) |

## 보조 시그널 3개 (1차 보강용)

| 시그널 | 9번째 회의 정의 그대로 |
|---|---|
| 🔬 **`vivid_case`** (사례 구체성) | source-verifier가 평가 — 사용자 인용·구체 수치·인물 발화 1+ |
| 🤝 **`familiar`** (친숙함) | brand 화이트리스트 매칭 — 한국 메이저(토스·카카오·네이버·쿠팡·당근·배민·야놀자·무신사·29CM·컬리·올리브영·오늘의집·SSG·G마켓·11번가·지그재그·에이블리·신세계인터내셔날) + 글로벌 메이저(Figma·Notion·Slack·Spotify·Mobbin·OpenAI·Anthropic·Vercel·GitHub·Stripe·Airbnb·Uber) + 기술 매체(web.dev·MDN·WebKit·Chrome·NN/g) |
| 📎 **`quotable`** (인용 가능성) | 요약 메타가 한 문장 + 구체 정보 OR 첫 단락 발화자 인용/데이터 후보 OR 첫 단락 60-180자 |

## 9번째 회의에서 폐기된 시그널

| 시그널 | 폐기 사유 |
|---|---|
| 🔥 ~~`hot_topic`~~ (화제성) | 추상적·자동 평가 불가·실제 흥미 판단에 약 |
| 💡 ~~`surprising`~~ (의외성) | 사용자가 E(실패·논쟁) 후보 안 골랐다 — 매거진 결에 부적합 |

## 흥미도 분류 (3단, v2 보정)

| 분류 | 기준 |
|---|---|
| `published` | **1차 시그널 1개 이상 강** AND (보조 시그널 1개 이상 강 OR 적합성 P0/P1) |
| `monthly_digest` | 1차 시그널 0개 + 보조 시그널 2개 이상 강 |
| `excluded_interest` | 1차 시그널 0개 + 보조 시그널 1개 이하 |

**적합성 판정과 결합**: shortlist는 적합성(`P0/P1/P2/제외`) **AND** 흥미도(`published`) 둘 다 통과한 후보만 통과시킵니다. **1차 시그널이 0개인 글은 적합성이 P0이라도 `monthly_digest` 또는 제외** — 직원 실무 적용도가 약하기 때문.

## 입력

- `runs/YYYY-MM-DD/magazine/editorial-brief.md`
- `runs/YYYY-MM-DD/raw/service-articles.json`
- `runs/YYYY-MM-DD/raw/design-articles.json`
- `runs/YYYY-MM-DD/raw/dev-articles.json`
- 필요 시 legacy 후보인 `runs/YYYY-MM-DD/raw/articles.json`
- 필요하면 후보의 최종 기준 원문 URL

## 출력

`shortlist-20-30.md`를 만들기 전에 후보마다 아래 판정을 남깁니다.

- 타겟 판정: `core_ecommerce / commerce_adjacent / design_dev_reference / weak_promo / exclude`
- 우선순위: `P0 / P1 / P2 / 제외`
- **흥미 시그널 (자동)**: `vivid_case` / `familiar` / `quotable` 중 강한 것을 배열로 (사례 구체성은 source-verifier가 평가해서 같이 넘김)
- **흥미 분류 잠정**: `published_candidate` / `monthly_digest_candidate` / `excluded_interest` — shortlist 단계에서 사람 평가 2개(`hot_topic`·`surprising`) 추가한 뒤 최종 확정
- 근거 화면: 홈 / 검색 / 상품상세 / 장바구니 / 결제 / 마이페이지 / 리뷰 / 추천 / 멤버십 / 운영도구 / 없음
- 고객 회의 질문: 한 문장
- 제외 사유: 제외일 때만 작성

## 판정 기준

`core_ecommerce`는 shortlist 최우선 후보입니다. 패션·뷰티·라이프스타일·종합몰·마켓플레이스에서 상품 탐색, 비교, 장바구니, 결제, 멤버십, 리뷰, 추천, 알림, 재구매, 픽업, CRM 흐름이 실제로 바뀐 경우입니다.

`commerce_adjacent`는 이커머스에 바로 대입 가능한 보조 후보입니다. 로컬 거래, 핀테크, 콘텐츠, 리서치, 운영 도구라도 상품 발견, 결제, 신뢰, 재방문, 판매자 운영, 데이터 기반 의사결정에 직접 연결될 때만 둡니다.

`design_dev_reference`는 Design/DEV 후보입니다. 디자인 시스템, 화면 구현, 접근성 QA, 브라우저 호환성, 디자인-코드 핸드오프처럼 CTTD 제작 실무에 바로 쓰일 때만 둡니다.

`weak_promo`는 원문이 제휴, 프로모션, 콘텐츠 파트너십, 카드 혜택, e쿠폰 거래, 외부 AI 연동 사실에 머무는 후보입니다. 브랜드가 중요해도 `혜택을 쉽게 보여줘야 한다`, `다음 거래로 연결된다`, `추천을 안전하게 데려온다` 같은 일반론만 가능하면 제외합니다.

`exclude`는 화면·플로우·정책 근거가 없거나, CTTD 고객 회의에서 바로 물어볼 질문이 남지 않는 후보입니다.

## Shortlist 우선순위

shortlist 선발은 카테고리(SERVICE / DESIGN / DEV)별로 독립적으로 수행합니다. 카테고리 간 석차 경쟁은 없습니다.

**SERVICE 내 우선순위:**
1. `P0`: core_ecommerce 중 화면·플로우·정책 변화가 확인된 후보
2. `P1`: commerce_adjacent 중 이커머스에 바로 대입할 수 있는 후보
3. `P2`: 시장/리서치 맥락은 강하지만 화면 변화가 직접 확인되지 않는 후보
4. `제외`: weak_promo 또는 exclude

**DESIGN 내 우선순위:**
1. `P0`: 화면·브랜드 시스템 변화가 확인되고 CTTD 제작 실무에 즉시 연결되는 후보
2. `P1`: 디자인 시스템·비주얼 레퍼런스로 바로 참고할 수 있는 후보
3. `P2`: 맥락은 있지만 화면 증거가 부족한 후보
4. `제외`: weak_promo 또는 exclude

**DEV 내 우선순위:**
1. `P0`: 프론트엔드 구현·접근성·브라우저 QA·디자인-코드 연동에 직접 연결되는 후보
2. `P1`: 개발 도구·기술 표준·릴리즈로 실무 참고가 되는 후보
3. `P2`: 흥미롭지만 즉시 적용 근거가 약한 후보
4. `제외`: weak_promo 또는 exclude

같은 점수라면 국내 이커머스, 패션/뷰티 커머스, CTTD 포트폴리오 관련 브랜드를 먼저 둡니다. 글로벌 서비스 사례는 국내 이커머스 화면이나 제작 실무로 옮길 수 있는 구체 질문이 있을 때만 남깁니다.

## 금지 패턴

- 약한 후보를 살리려고 UX 일반론을 붙이지 않습니다.
- 제휴카드, 할인전, 멤버스데이, 콘텐츠 제휴, e쿠폰 거래는 화면 증거가 없으면 제외합니다.
- 외부 AI 연동은 계정 연결, 권한, 추천 결과, 서비스 안 전환 화면이 확인되지 않으면 제외합니다.
- 보도자료 제목이 좋아도 고객 회의 질문을 한 문장으로 쓰지 못하면 제외합니다.
