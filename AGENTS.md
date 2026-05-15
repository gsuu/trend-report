# Project Operating Rules

## Newsletter Approval Flow

When the user provides a PDF, asks to collect source material, and then asks to send the newsletter:

1. Build the report and magazine site from the collected material.
2. Push the site/data changes to the repository.
3. Use `https://magazine.cttd.co.kr` as `MAGAZINE_BASE_URL`.
4. Send the first test email only to `jisuk@cttd.co.kr`.
5. Wait for the user's explicit confirmation that the test email is okay.
6. After confirmation, send the final email to `cxd@cttd.co.kr`.

Do not send directly to `cxd@cttd.co.kr` before the test email has been confirmed.

## Magazine Tag Standard

Apply this tag rule to every Service, Design, and DEV magazine item.

- Choose tags from words that appear often in the original source or define the article's core context.
- Prefer concrete source terms: product names, feature names, method/framework names, campaign names, expression or production techniques, tools/APIs/properties, output types, and issue terms.
- Do not invent decorative or editorial tags only to make the item sound appealing.
- Do not duplicate the job/audience tag.
- Do not force a fixed count; use only useful tags, usually 2-4.

## Magazine Summary Standard

Apply this summary-layer rule to every Service, Design, and DEV magazine item. The single source of truth is [docs/magazine-writing-standard.md](docs/magazine-writing-standard.md). The rules below mirror that document; if anything diverges, the standard wins.

- Do not force a fixed total issue count across Service, Design, and DEV. Publish as many items as pass the editorial bar for that run, and do not pad the issue to reach `20-30` combined items.
- Apply the **self-contained 요약** rule: a reader who never opens the source URL must, from the metadata `요약:` line and the body `##### 요약` bullets alone, understand who did what, what the core change or argument is, and why this article matters. Replace banner phrasing like `~를 다룹니다`, `~를 소개합니다`, `~에 대한 글입니다` with the actual finding.
- Add a `요약` metadata line for the article-header deck. It should be 1-2 sentences and put `subject + what + how/why` into a single sentence. It must not repeat the source name, title, body summary, or a promotional reason-to-read.
- The first bullet of the body `##### 요약` is the **single-line conclusion of the article**. Subsequent bullets carry concrete supporting facts (feature names, scope, screen changes, numbers, author's argument with evidence). Do not cap the bullet count: include as many meaningful points as the source supports, but do not pad with filler bullets. For DEV, at least one of the first two bullets must include a tech name, API, version, or browser condition (a content requirement, not a count cap).
- Write the body summary only after opening the original source URL. Summarize important source facts, not RSS excerpts or existing digest sentences.
- Keep the metadata `요약`, body summary, and insight layer distinct. Do not repeat the same sentence across these layers.
- Do not force a fixed bullet count for body summaries; include the meaningful points needed to represent the source.
- If the original source is a blog or opinion article rather than a product release note, summarize who is arguing what, which evidence or examples they use, and what CTTD can practically reference from it.
- Use only the locked sub-heading sets defined in [docs/magazine-writing-standard.md](docs/magazine-writing-standard.md) for the `##### 매거진 인사이트` / `##### 디자인 인사이트` body. Do not invent new sub-headings (e.g. `이 레퍼런스에서 먼저 볼 장면`, `검수 포인트`, `도입 전 검수 포인트`); fold any such content into one of the four locked sub-headings for that area.

## SERVICE Digest Source Standard

SERVICE는 "이커머스 산업 중심 인사이트"를 단일 축으로 운영합니다. 좋은 기사 몇 건을 고르는 큐레이션이 아니라, CTTD 클라이언트 관심사 모니터링 시스템으로 매주 어떤 시장을 훑었고 무엇을 남겼는지 운영 기록을 남깁니다.

SERVICE 이커머스 5축 (메인 채택 기준):

1. **상품 탐색·홈** — 홈 개편, 카테고리 분리, 개인화 피드, 브랜드관, 큐레이션, 검색 결과 UI
2. **비교·선택** — AI 추천, 유사 상품, 듀프, 리뷰 요약, 성분/취향/사이즈 기반 비교, 필터 개선
3. **구매·전환** — 장바구니, 결제, 쿠폰, 포인트, 멤버십, 페이백, 구독, 무료배송 조건
4. **멤버십·재방문** — 멤버십 등급, 알림, 찜, 재입고, 출석, 리워드, 앱 전용 혜택, CRM
5. **리뷰·추천·O2O** — 리뷰 UX, AI 후기, 추천 근거 노출, 매장 픽업, 앱 쿠폰 회수, 방문 후 CRM

SERVICE Tier 구조:

- **Tier 1 (1급 관심사)**: 패션 커머스, 뷰티 커머스, 종합 커머스/마켓플레이스, 멤버십·CRM, 프로모션형 구매 경험. 매주 기본 모니터링 대상.
- **Tier 2 (참고군)**: 브랜드 콘텐츠 커머스, 생활/가전 커머스, 로컬 서비스, 핀테크, 리서치/조사 자료. 클라이언트 회의에서 바로 질문으로 바꿀 수 있을 때만 메인 후보로 올립니다. Tier 2 항목은 구체 화면·플로우·정책·조건·승인·추천 근거·운영 흐름이 원문에서 확인되어야 합니다.

SERVICE 명시 제외:

- 제휴카드, e쿠폰, 단순 프로모션, 오프라인 이벤트, 비즈니스 실적, 채용, ESG, 브랜드 캠페인 (원문에 구체 화면·플로우·정책 변화가 없으면 제외)
- 단순 매출/거래액/투자 소식 (사용자 화면이 안 바뀌면 제외)
- 글로벌 비이커머스 콘텐츠 서비스 (Spotify 같은 음악·콘텐츠는 SERVICE에서 제거)

운영 기준:

- `news-tracking/service-sources.json`과 `npm run fetch:service`로 후보를 모읍니다.
- 후보 출처는 신세계/쿠팡/컬리/오늘의집/네이버·11번가·G마켓·Kream·Brandi·SSF SHOP·S.I.VILLAGE·무신사·CJ올리브영·카카오스타일(한국 이커머스 Tier 1), 카카오·당근·야놀자(플랫폼 Tier 2), 토스 테크·우아한형제들(한국 서비스 운영 UX), Shopify Engineering·Stripe Sessions·Klarna(글로벌 이커머스 표준), 오픈서베이·PUBLY(리서치, discovery)을 1차로 봅니다.
- 후보 수집 후 `docs/service-digest-agent-prompt.md`를 적용해 채택/제외를 판단합니다. LLM API를 자동 수집 단계에서 호출하지 않습니다.
- 각 회차는 모니터링 트레일을 남깁니다: `이번 주 무엇을 모니터링했나` / `최종 채택 TOP 항목` / `수집했지만 제외한 것 (사유 포함)`.
- 메인 후보는 세 필터를 모두 통과해야 합니다: ① CTTD 클라이언트 관심사 직접 닿음 ② 화면/플로우/정책/조건/추천 근거/운영 흐름 중 구체 변화 확인됨 ③ 클라이언트 회의에서 바로 던질 질문 한 문장으로 만들 수 있음.
- 패션·뷰티 비중이 한 회차에 강해도 억지로 카테고리를 펼치지 않습니다. 약한 항목 끼워넣어 합계 맞추지 않습니다.
- 발행은 공식 출처 우선(공식 공지·뉴스룸·앱스토어 릴리즈 노트·리서치 원문). 매거진/디스커버리는 후보 발견 출처로만 사용합니다.
- Magazine Summary Standard의 자체 완결 요약·잠금 소제목 셋을 그대로 적용합니다. 일반 UX 칭찬이 아니라 구체 클라이언트 질문에 정착해야 합니다.
- Notion으로 SERVICE를 발행하지 않습니다 (사용자가 명시 요청한 경우만 예외).

## DEV Digest Source Standard

DEV는 GeekNews 스타일의 "프론트엔드 UIUX 개발자에게 유익한 최신 기술 소식"을 목표로 운영합니다. 배경은 단순 뉴스 큐레이션이 아니라, 클라이언트 화면을 만드는 실무자가 "지금 이걸 알아야 한다" 싶은 신호만 모으는 것입니다.

DEV 4축 스코프 (이 안에 들어가는 것만 채택):

1. **프론트엔드 표준·브라우저** — HTML/CSS/JavaScript, Web Platform API, Chrome/Safari/Firefox/WebKit 릴리즈, Baseline/Interop, Web Component
2. **UIUX 구현·접근성** — 컴포넌트 구현, 디자인-코드 연동, 접근성(ARIA/WCAG/스크린 리더/키보드), 성능 (Core Web Vitals)
3. **AI 코딩·도구** — Claude Code, Cursor, Copilot, v0, Bolt, Replit, OpenAI Codex 등 프론트엔드 실무 워크플로우를 바꾸는 AI 도구
4. **디자인 시스템 자동화** — Storybook, shadcn/ui, Builder.io, Locofy, Anima, Figma Dev Mode 등 디자인-코드 파이프라인 자동화

DEV 명시 제외 (이건 DEV로 쓰지 않음):

- 백엔드/서버/DB/인프라/DevOps/Kubernetes/Kafka/메시지 큐/머신러닝 모델 학습
- CLI 도구·OS·클라우드 관리자 콘솔 (프론트엔드 구현 영향 없는 것)
- 채용·세미나·웨비나·교육 모집·투자/펀딩
- 백엔드 중심 API 사용법 글 (단, 브라우저 API/CSS/HTML/ARIA 명세는 포함)

운영 기준:

- `news-tracking/dev-sources.json`과 `npm run fetch:dev`로 후보를 모읍니다. 자동 수집은 위 4축에 매핑되는 출처로만 구성하고, 각 출처에 `includeTitlePatterns`/`excludeTitlePatterns`로 백엔드/채용 노이즈를 차단합니다.
- 후보 출처는 GeekNews(한국 큐레이션), Frontend Focus·CSS Weekly·JavaScript Weekly(글로벌 뉴스레터), Smashing/CSS-Tricks/web.dev/MDN/WebKit/Chrome for Developers(표준·실무), Vercel/Astro/React/Svelte(프레임워크), Anthropic/OpenAI/GitHub Copilot/Cursor/v0/Replit/Builder.io(AI 코딩·디자인 시스템 자동화), Sara Soueidan/Adrian Roselli/Scott O'Hara/A11y Project/Deque(접근성), Naver D2/KakaoEnt FE/Line Engineering KR(한국 FE)을 1차로 봅니다.
- 후보 수집 후 `docs/dev-digest-agent-prompt.md`를 적용해 채택/제외를 판단합니다. LLM API를 자동 수집 단계에서 호출하지 않습니다.
- 기준에 통과한 후보는 모두 포함합니다. 무리해서 줄이지 않습니다.
- 같은 7일 안에 같은 주제·릴리즈·논쟁이 여러 출처에 나오면 묶음 항목 하나로 발행하고, 보조 원문은 `보조 출처 1`, `관련 링크 1` 메타로 모두 표시합니다.
- 원문 제목을 최대한 보존합니다. 명세·릴리즈·가이드는 `출처/제품 + 핵심 기능·API + 자료 성격`이 드러나야 합니다. 묶음 항목만 공통 변화가 드러나는 제목으로 정리합니다.
- 각 항목 메타데이터에 `출처 유형`을 반드시 작성합니다 (`news`, `release_note`, `blog_opinion`, `reference`, `guide`, `research` 중 하나). 공식 릴리즈·브라우저 업데이트는 `release_note`, 기술 블로그/오피니언은 `blog_opinion`, 명세·가이드는 `guide`, 리서치/벤치마크는 `research`.
- 각 DEV 본문 요약 불릿은 원문에서 확인한 구체 사실(기능명, 도구명, API/속성, 브라우저·접근성·성능 조건, 수치, 제한점, 검증 방법) 또는 작성자의 핵심 주장과 근거를 담습니다.
- Markdown 백틱은 코드성 표현(명령어, 파일명, 패키지, API, CSS/HTML/ARIA 속성, 설정값)에만 씁니다. 기능명·제품명·한국어 UI 문구·강조 문장에는 쓰지 않습니다.
- 썸네일은 원문 페이지의 대표 이미지(`og:image`, `twitter:image`, 첫 본문 이미지 순서)를 씁니다.
- Magazine Summary Standard의 자체 완결 요약·잠금 소제목 셋을 그대로 적용합니다.
- Notion으로 DEV를 발행하지 않습니다 (사용자가 명시 요청한 경우만 예외). `runs/YYYY-MM-DD/magazine-report.md` 갱신 후 매거진 JSON/사이트 데이터만 새로고침합니다.

## Design Digest Source Standard

Design은 "웹디자이너가 다음 시안에 저장해두고 싶은가"를 단일 기준으로 운영합니다. 단순한 디자인 매거진 큐레이션이 아니라, 한국 UIUX 사례를 우선으로 두고 글로벌은 표현 트렌드를 보강하는 축으로만 씁니다.

Design 3축 스코프 (이 안에 들어가는 것만 채택):

1. **한국 UIUX 사례** — 토스/카카오/라인/삼성/네이버 등 국내 서비스의 화면·컴포넌트·브랜드 시스템 사례 (가장 우선)
2. **글로벌 시각 표현·UX 패턴** — Awwwards/Siteinspire/Mobbin/Page Flows/It's Nice That/The Brand Identity 등에서 확인되는 레이아웃·타이포·모션·플로우 레퍼런스
3. **디자인 도구·시스템 (디자이너 워크플로우 관점)** — Figma/Adobe/Canva/Framer/Webflow의 디자이너 작업 흐름 변화, NN/g·Smashing의 UX 가이드, 디자인 시스템 거버넌스/도큐멘테이션 (코드 자동화 도구는 DEV로 보냄)

Design 명시 제외:

- 코드 구현·CSS/JS/접근성 구현·브라우저 API → DEV
- 디자인 시스템 자동화·design-to-code 도구(Storybook/shadcn/Builder.io/Locofy/v0) → DEV
- 결과 이미지만 예쁘고 화면 구조·톤·제작 방식·적용 포인트가 설명 안 되는 글
- 단순 캠페인 소개·매장 오픈·전시 공간만 있는 글 (온라인 화면 변화가 없으면 제외)
- AI 기능 출시 홍보지만 입력 방식·결과물·디자이너 작업 흐름이 설명되지 않는 글

운영 기준:

- `news-tracking/design-sources.json`과 `npm run fetch:design`으로 후보를 모읍니다. 자동 수집 출처는 위 3축으로만 구성합니다.
- 후보 출처는 DIGITAL iNSIGHT·pxd story·디자인 컴파스·디자인스펙트럼·삼성 디자인·토스 디자인·카카오 디자인·라인 디자인(한국), Awwwards/Siteinspire/Lapa Ninja/Cosmos/Mobbin/Page Flows/The Brand Identity/It's Nice That/Muzli/Brand New/Fonts In Use/Typewolf(글로벌 표현 트렌드), Figma/Adobe/Framer/Webflow/Canva·NN/g·Smashing UX·Figma DS Blog·Into Design Systems(디자이너 워크플로우)을 1차로 봅니다.
- 후보 수집 후 `docs/design-digest-agent-prompt.md`를 적용해 채택/제외를 판단합니다. LLM API를 자동 수집 단계에서 호출하지 않습니다.
- 한국 UIUX 사례가 있으면 글로벌 레퍼런스보다 먼저 채택합니다. 한국 후보만으로 폭이 부족할 때만 글로벌로 보완합니다.
- 발행은 항상 원문(공식 제품 블로그·릴리즈 노트·뉴스룸·디자인 시스템 문서·실제 사이트)으로 역추적해 확인합니다. 매거진 큐레이션 글은 후보 발견 출처로만 사용합니다.
- 원문 제목을 최대한 보존하되, 화면 레퍼런스·브랜드 사례는 독자가 볼 포인트를 바로 알 수 있는 관점형 제목을 허용합니다. 가이드·리서치는 `출처 + 정리한 주제 + 자료 성격`이 드러나야 합니다.
- 메타데이터에 `출처 유형`을 반드시 작성합니다(`news`/`release_note`/`blog_opinion`/`reference`/`guide`/`research`).
- Magazine Summary Standard의 자체 완결 요약·잠금 소제목 셋을 그대로 적용합니다.
- Markdown 백틱은 코드성 표현에만 씁니다.
- 썸네일은 원문 페이지의 대표 이미지를 씁니다 (디자인 판단에 도움이 될 때만).
- Notion으로 Design을 발행하지 않습니다 (사용자가 명시 요청한 경우만 예외).

## Korean Naturalization Skill

When translating, adapting, polishing, or drafting Korean newsletter or magazine copy from source material, use the installed `humanize-korean` skill as the Korean naturalization standard.

- The repository includes a vendored copy at `docs/agent-skills/humanize-korean/SKILL.md`.
- If `humanize-korean` is not installed in the current Codex environment, read and follow `docs/agent-skills/humanize-korean/SKILL.md` and the files under `docs/agent-skills/humanize-korean/references/`.
- Apply this standard not only to translation but also to original Korean writing for `runs/YYYY-MM-DD/shortlist-20-30.md`, `runs/YYYY-MM-DD/magazine-report.md`, newsletter copy, and other source-based editorial output.
- Preserve source facts, product names, feature names, API/property names, version numbers, dates, and metrics.
- Use `humanize-korean` to remove translationese, AI-like phrasing, stiff English sentence order, and unnatural Korean rhythm.
- Before finalizing Korean editorial copy, check for literal translation patterns, AI-like phrasing, stiff sentence openings, awkward headings, and expressions that sound unnatural in Korean even when the facts are correct.
- Do not use the skill to add claims, examples, numbers, or interpretations that are not present in the source.
- For code-related expressions such as commands, filenames, packages, APIs, CSS/HTML/ARIA properties, and config values, preserve the original technical spelling.
