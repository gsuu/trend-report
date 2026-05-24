# trend-report 리팩토링 회의록 (2026-05-24)

> 한국 패션/뷰티/종합 이커머스 시니어 PM, UIUX 퍼블리셔, UIUX 비주얼 디자이너가 실제로 어떻게 레퍼런스를 수집하는지 학습한 결과를 토대로, trend-report 매거진 파이프라인을 어떻게 리팩토링할지 회의 형식으로 정리한 문서.

---

## Part 1. 학습한 실태 — 직군별 레퍼런스 수집 패턴

### 시니어 PM (패션/뷰티/종합 이커머스)

- **자사 + 직접 경쟁 3~5개 앱을 매주 직접 깐다.** 앱스토어/플레이스토어 릴리즈 노트가 1순위 신호 — RSS가 없어 수동 트래킹 필수.
- **채용 공고를 본다.** 제품 발표보다 3~6개월 앞서는 전략 로드맵. 무신사·컬리·올리브영 채용 JD에 등장하는 신규 포지션은 다음 분기 기능 예고.
- **운영자 UX 사례.** 토스플레이스 PANDA, 우아한형제들 사장님 어드민, 카카오 셀러 도구 등 "사용자가 고객이 아닌" 화면.
- **유료 리포트 구독.** 오픈서베이 트렌드 리포트(뷰티·식료품·모바일 쇼핑), PUBLY 케이스 스터디, 메조미디어 업종 분석.
- **커뮤니티.** 디스콰이엇(메이커로그), 아웃스탠딩 이슈차트, 요즘IT 팁스터 — 한국판 Product Hunt 역할.
- **공통 페인포인트.** 슬랙·노션·드라이브·지라 분리 → 도구 간 정보 이동에 시간의 ~40%. 일평균 33회 컨텍스트 스위치.
- **결정 기준.** "회의에서 바로 클라이언트에게 던질 질문 한 문장"으로 환원 가능한가. UX 일반론은 곧 버린다.

### UIUX 비주얼 디자이너

- **플로우 단위 아카이브.** Mobbin(글로벌, 30만+ 스크린, onboarding/checkout/upgrade), Refero(2만+ 사이트·iOS 앱 플로우), Page Flows, 유아이볼(국내 최대, 30개 분야 패턴, 사용자 27k+), Designus.
- **비주얼 인스피레이션.** Awwwards / SiteInspire / Lapa Ninja / Cosmos / Godly / FWA — 웹·랜딩 표현 트렌드.
- **작품·디테일.** Behance / Notefolio(한국, 15만+ 회원) / Dribbble.
- **무드보드·시각 클리핑.** Pinterest, Are.na, Eagle. 키비주얼·색·타이포 컬렉션 운영.
- **한국 매거진·블로그.** pxd story, 디자인스펙트럼, 토스 디자인, 카카오 디자인, 라인 디자인, 디자인DB, 디자인플러스 — RSS 누락 다수.
- **브랜드·타이포.** It's Nice That, Brand New, Muzli, Fonts In Use, Typewolf.
- **뉴스레터.** 디독(종료), 신.유.사(신비한 UX 레퍼런스 사전, Stibee 발행).
- **공식 어워드.** GDWeb, 디비컷(DBcut) — 국내 클라이언트 홈페이지·브랜드 사이트 레퍼런스 필수.
- **Mobbin 한계.** 한국 서비스 커버리지 약함, 2025년 1월 지그재그 추가가 큰 뉴스였을 정도. → 한국 사례는 결국 운영자가 모은 것이 필요.

### UIUX 퍼블리셔 (한국 특유 직무, 마크업·CSS·접근성·인터랙션 + FrontDEV 일부)

> **직무 정의 보정 (2026-05-24 사용자 확정):** 퍼블리셔는 마크업·CSS·접근성·인터랙션 구현이 본업이지만 **FrontDEV도 봐야 한다.** 단, **데이터를 직접 다루지 않으므로 데이터·백엔드 개발은 제외.** vite 같은 번들러 환경설정은 필요. 실제 빌드는 **11ty, Astro**를 많이 쓴다.

- **인터랙션·모션.** CodePen, Codrops, Awwwards SOTD/FOTD — GSAP + Lenis + Three.js 조합이 사실상 표준 패턴.
- **접근성.** Sara Soueidan, Adrian Roselli, Scott O'Hara, A11y Project, Deque.
- **표준·릴리즈.** MDN Blog, web.dev, Chrome for Developers, WebKit Blog, Baseline/Interop.
- **가이드.** Smashing Magazine, CSS-Tricks, Frontend Masters.
- **컴포넌트.** shadcn/ui, Radix UI, Headless UI, Ant Design, Storybook 공개 인스턴스.
- **정적 사이트·번들러 (퍼블리셔가 직접 다루는 FrontDEV 범위).** 11ty(Eleventy), Astro 공식 가이드·릴리즈, Vite 환경설정, PostCSS, Tailwind 빌드 파이프라인.
- **디자인 → 코드.** Figma Dev Mode, Builder.io, Locofy, Anima.
- **뉴스.** GeekNews(한국), Frontend Focus, CSS Weekly, JavaScript Weekly.
- **한국 FE.** Naver D2, KakaoEnt FE, Line Engineering KR, 우아한형제들 기술블로그, 토스 테크.
- **제외 범위.** 데이터 파이프라인, 서버·DB·인프라, ML 학습, 서버 사이드 렌더링 백엔드 로직, 메시지 큐 — 퍼블리셔가 직접 다루지 않음.
- **결정 기준.** "코드 스니펫을 복사해 쓸 수 있는가" 혹은 "vite/11ty/Astro 설정 1개를 그대로 옮길 수 있는가." 설명 글은 30초 만에 닫는다.

### 공통 페인포인트 (3직군 합쳐서)

1. **한국 PR 뉴스룸 = 노이즈가 신호를 덮음** (캠페인·매장 오픈·콜라보가 80%).
2. **앱스토어/플레이스토어 릴리즈 노트 = RSS 없음.** UIUX 변화 신호 강도 1위인데 수동.
3. **Mobbin·Refero는 한국 커버리지 부족,** 유아이볼·Designus는 디자이너 위주.
4. **디독·REASIGN 종료** — 한국어 큐레이션 매체 사실상 신.유.사·요즘IT·디스콰이엇만 살아있음.
5. **"모았는데 다시 못 찾는다"** — 클리핑 도구 단편화. 재발견(retrieval)이 정리(collection)보다 약함.

---

## Part 2. 회의 형식 리팩토링 계획

> 회의 시간: 90분 · 참석: 편집장(진행), 클라이언트 PM 페르소나, 비주얼 디자이너 페르소나, 퍼블리셔 페르소나, 시스템 운영자 · 안건 8개

### 안건 1. 직무별 큐레이션 뷰 도입

**편집장**: 현재 `웹기획`/`웹디자인`/`웹DEV` 직무 태그는 분류만 하고, 사이트·매거진·뉴스레터에서 직무별 별도 뷰가 없습니다. 같은 글이 PM이 보면 너무 시각적이고, 디자이너가 보면 너무 기획적이라는 불만 누적.

**클라이언트 PM**: 매거진 열 때 "오늘 PM 7개, Designer 4개, Publisher 2개"가 바로 보이면 됩니다. 카테고리(Service/Design/DEV)와 직무 태그가 직교하는데 사이트는 카테고리만 살아있습니다.

**비주얼 디자이너**: 동의합니다. Service 카테고리에 들어간 무신사 홈 개편 글이 사실 디자이너에게 더 유용한 경우가 많아요. 카테고리 ≠ 독자.

**퍼블리셔**: DEV 카테고리도 절반이 "AI 코딩"인데 저는 코드 스니펫·접근성·인터랙션·vite/11ty/Astro 설정만 봅니다. 그걸 가르는 라벨이 없어요.

**시스템 운영자**: `magazine.json`에 `audience` 배열이 이미 존재합니다(`service`/`design`/`dev`). 사이트 라우팅과 뉴스레터 audience 발송은 이걸 쓰는데, 사이트 메인에서 audience 필터링 UI가 빠져 있습니다.

**결론 (2026-05-24 사용자 확정 + 구현 완료):** 카테고리(Service/Design/DEV)와 독자 직군은 1:1 매핑이다. 별도 직무 축을 만들지 않고, 기존 `areaKey`를 그대로 두되 사이트·구독 모달·문서·태그 라벨에 직군명을 **병기**한다.

- `service` → 기획자 (PM)
- `design` → 디자이너 (UIUX 비주얼)
- `dev` → 퍼블리셔 (UIUX 퍼블리셔, 마크업·CSS·인터랙션 + Vite·11ty·Astro 같은 정적 사이트 빌드. 데이터·백엔드·서버·DB·인프라·ML 제외)

**구현 (PR #2 안에 누적 커밋):**
1. `src/App.vue`에 `AREA_JOB_LABELS` 상수 신설 + `categories` 컴퓨티드에 `jobLabel`/`jobLabelEn` 부여.
2. 헤더 카테고리 칩에 `category-nav-label` + `category-nav-job` 마크업으로 카테고리명 옆에 직군 라벨 노출. 스크린리더 보조 텍스트(`sr-only`) 동봉.
3. 구독 모달의 Service/Design/DEV 체크박스에 `subscribe-job-hint` 보조 텍스트로 직군·범위 힌트 노출.
4. `src/assets/main.css`에 헤더 칩과 구독 힌트 스타일 추가.
5. `AGENTS.md` 최상단에 **Audience ↔ Job Mapping** 절 신설 (카테고리·직군·정의·제외 범위 표).

---

### 안건 2. 수집 소스 확장 — 발견 채널 vs 검증 채널 분리 강화

**편집장**: 현재 `data-collection-strategy.md`의 "후보 발견 출처" 원칙은 잘 잡혀 있지만, 한국 현업이 진짜 쓰는 큐레이션 채널이 빠져 있습니다.

**클라이언트 PM**: 디스콰이엇 메이커로그, 아웃스탠딩 이슈차트, 요즘IT 팁스터, PUBLY 카리스마 — 매주 발견 신호 나옵니다. 특히 디스콰이엇은 한국 PM이 매일 켭니다.

**비주얼 디자이너**: 유아이볼, Designus 웹 레퍼런스, GDWeb 신규 등재작, 디비컷 신작, Notefolio HOT, pxd story, 신.유.사 뉴스레터. Mobbin의 한국 추가분(지그재그) 알림도.

**퍼블리셔**: Codrops, Awwwards SOTD 일일, GSAP 쇼케이스, Frontend Focus 이슈. shadcn/ui Discussions, Radix 릴리즈, 그리고 **11ty 공식 블로그, Astro 공식 블로그, Vite 릴리즈 노트**도요.

**클라이언트 PM**: 그리고 **채용 공고**. 무신사·올리브영·컬리·29CM·SSF SHOP의 PM/디자이너 JD에 "신규 기능 X 담당" 들어오면 그게 3개월 뒤 발표 신호.

**시스템 운영자**: 채용 공고는 원티드·잡코리아·자사 채용 페이지가 각각 다른 구조라 수집은 가능하지만 노이즈 큽니다. JD에서 신호 키워드(예: "신규 X 출시", "0→1", "AI 추천") 화이트리스트가 필요.

**편집장**: 수집은 넓게, 발행은 좁게 원칙은 유지. **소스 두 등급으로 분리:**
- `discovery_source` (디스콰이엇, 유아이볼, GDWeb, Codrops, 채용공고, 11ty/Astro 블로그 등): RSS 없으면 주 1회 수동 스냅샷, 광고·홍보·매장 오픈 자동 필터.
- `verification_source` (공식 뉴스룸·릴리즈 노트·앱스토어·기술 블로그): 글 등록 가능 조건.

**결론**: `news-tracking/` JSON에 `tier: "discovery" | "verification"`, `purpose: "find" | "verify"` 필드 추가. `discovery_source`는 글 등록 자격이 없고 후보 단서로만 인용.

---

### 안건 3. "재발견(retrieval)" 워크플로 신설

**편집장**: 누적된 글이 300+ 인데 "한 달 전 보았던 비슷한 결제 플로우 사례"를 다시 못 찾습니다. 현재 검색은 제목·태그 기반.

**비주얼 디자이너**: Mobbin이 잘하는 게 "Checkout 플로우만 모아보기"인데 우리는 못합니다. 화면·플로우 단위 태깅이 없거든요.

**클라이언트 PM**: 저도 같은 페인. "올리브영의 멤버십 정책 변화 히스토리"를 시간순으로 보고 싶은데 카테고리 페이지가 평면입니다.

**시스템 운영자**: 글에 `flow` (예: `checkout/payment`, `onboarding`, `search`, `review`, `membership`, `personalization`), `brand` (정규화된 브랜드명), `change_type` (`policy`, `screen`, `flow`, `feature`, `removal`) 메타데이터를 추가하면 됩니다.

**퍼블리셔**: 검색 UX는 다중 필터 칩(브랜드 × 플로우 × 변화 유형)이 좋습니다. SPA니까 클라이언트 필터로 충분.

**결론**:
1. 메타 스키마에 `flow`, `brand_normalized`, `change_type` 추가.
2. 사이트에 브랜드/플로우/직무 다중 필터 페이지(`/explore`) 신설.
3. 누적 글 메타 백필은 LLM 1회 실행으로 처리.

---

### 안건 4. 비주얼 디자이너용 "스크린샷 갤러리" 모드

**비주얼 디자이너**: 저는 본문보다 **스크린샷이 먼저** 보여야 합니다. 지금 매거진 글은 텍스트 본문 위에 이미지 1장. Mobbin·유아이볼은 정반대.

**편집장**: 텍스트 매거진 정체성을 흔들지 않는 선에서. 별도 뷰 추가는 가능합니다.

**시스템 운영자**: `/gallery` 페이지에 카드 그리드 — 큰 스크린샷, 호버 시 1줄 요약, 클릭하면 본문. 글마다 `images: [{url, caption, source}]` 정렬해두면 됩니다.

**비주얼 디자이너**: 한 발 더 가서, 같은 플로우에 속한 스크린샷을 **여러 브랜드 가로 비교**로 보고 싶어요. "올리브영 vs 무신사 뷰티 vs 컬리 결제" 같은.

**클라이언트 PM**: 그건 사실상 PM이 회의에서 띄우는 자료입니다. 가치 큽니다.

**편집장**: 안건 3의 `flow` 메타가 있으면 자동 묶음 가능. 안건 3과 의존성. 같이 진행.

**결론**:
1. `images[]` 메타로 다중 스크린샷.
2. `/gallery?flow=checkout&brands=oliveyoung,musinsa` 같은 가로 비교 뷰.
3. 글 본문은 그대로 유지(텍스트 정체성 보존).

---

### 안건 5. 퍼블리셔 직무 명시화 + 코드/환경설정 자산화

> **2026-05-24 사용자 보정:** 퍼블리셔는 마크업·CSS만이 아니라 **FrontDEV도 본다.** 단 **데이터·백엔드 제외.** vite 환경설정 같은 건 필요. 실무에서 **11ty, Astro**를 많이 쓴다. 이 정의를 그대로 운영 문서에 박는다.

**퍼블리셔**: AGENTS.md는 "DEV = 프론트엔드 UIUX 개발자"라고만 정의합니다. 한국 퍼블리셔는 마크업·CSS·접근성·인터랙션이 본업이지만 vite·11ty·Astro 같은 정적 사이트 빌드와 환경설정도 직접 합니다. 다만 **데이터·서버·DB·ML은 안 합니다.** 이 경계가 운영 문서에 없습니다.

**편집장**: 한국 시장 현실 반영하면 정의 자체를 다시 써야 합니다. DEV 안에서 `publisher`(퍼블리셔 + FrontDEV 일부) vs `engineer`(데이터·백엔드·인프라 — 어차피 우리 스코프 아님) 두 audience. 사실상 우리는 `publisher` 하나만 운영.

**퍼블리셔**: 더 중요한 건 **코드/환경설정 노출 표준화**. 본문에 코드 블록 들어가다 말다 합니다. 퍼블리셔는 다음이 일관되게 있어야 가치:
- CodePen / Stackblitz / Codesandbox 링크
- Storybook 공개 인스턴스 링크
- 코드 스니펫 (HTML/CSS/JS)
- **vite/11ty/Astro 설정 파일 스니펫 또는 GitHub 저장소 링크**

**시스템 운영자**: 글 메타에 `code_artifacts: [{type, url, lang}]` 추가. `type`은 다음 enum:
- `codepen` | `stackblitz` | `codesandbox` (라이브 데모)
- `storybook` (디자인 시스템)
- `snippet` (본문 안 코드 블록)
- `repo` (GitHub)
- `config` (vite.config.js, eleventy.config.js, astro.config.mjs 등 환경설정 파일)

**편집장**: `docs/dev-digest-agent-prompt.md`에 두 가지 추가:
1. **퍼블리셔 직무 정의:** "마크업·CSS·접근성·인터랙션 + vite/11ty/Astro 같은 정적 사이트 빌드와 환경설정. 데이터·백엔드·인프라는 제외."
2. **퍼블리셔용 글은 `code_artifacts` 1개 이상 의무.** vite/11ty/Astro 관련 글은 `config` 타입 1개 이상.

**퍼블리셔**: DEV 4축 스코프도 이걸 반영해 살짝 갱신해주세요. 현재 1번 "프론트엔드 표준·브라우저" 아래에 **"정적 사이트 생성기·빌드 도구 (11ty, Astro, Vite, Tailwind)"**가 명시되면 좋겠습니다.

**시스템 운영자**: AGENTS.md `DEV 4축`과 `news-tracking/dev-sources.json` 둘 다 손봐야 합니다.
- `dev-sources.json`에 추가: 11ty 공식 블로그(https://www.11ty.dev/blog/), Astro 공식 블로그(https://astro.build/blog/), Vite 릴리즈 노트.
- 백엔드/데이터 노이즈 차단을 위해 `excludeTitlePatterns`에 `db|database|backend|server|deploy|kubernetes|kafka|airflow|data\\s*pipeline|warehouse|etl|ml|model\\s*training` 추가.

**결론**:
1. `audience: publisher` 신설 (현 `dev` 대체).
2. `code_artifacts` 메타 + `config` 타입 추가.
3. `docs/dev-digest-agent-prompt.md`에 퍼블리셔 직무 정의 + 산출물 의무 추가.
4. AGENTS.md `DEV 4축` 1번 항목에 정적 사이트 생성기·빌드 도구 추가.
5. `news-tracking/dev-sources.json`에 11ty/Astro/Vite 추가, 데이터·백엔드 키워드 차단 패턴 추가.
6. 사이트에 코드 아티팩트 배지 표시 (`config` 배지는 별도 색상으로 강조).

---

### 안건 6. 시니어 PM용 "회의 한 문장" 라벨 + 채용 신호

**클라이언트 PM**: SERVICE 운영 기준에 "회의에서 바로 던질 질문 한 문장"이 이미 있는데, 실제 글에는 일관되게 안 보입니다. 메타 필드로 박아주세요.

**시스템 운영자**: `meeting_question` 필드 추가, writer 에이전트 출력 형식 의무화. 매거진 본문 상단에 "💬 클라이언트에게 묻기" 박스로 노출.

**클라이언트 PM**: 그리고 **채용 신호 카드** — "지난 30일간 무신사 채용 공고에 '리뷰 AI 요약' 키워드 N건" 같은. 메인 이슈는 아니더라도 사이드바 위젯.

**편집장**: 안건 2의 채용 공고 discovery_source가 들어오면 자동 집계 가능. 다만 메인 매거진 글로는 발행하지 않습니다. **`/signals` 부속 페이지** 형태.

**비주얼 디자이너**: 디자이너도 채용 공고 봅니다. "키비주얼 디렉터" 같은 포지션 = 리브랜딩 신호.

**결론**:
1. 글마다 `meeting_question` 필드(SERVICE는 의무, Design/DEV는 선택).
2. 채용 공고는 메인 매거진 외 `/signals` 페이지에 집계.
3. SERVICE 매거진 상단 "클라이언트 질문" 박스 디자인.

---

### 안건 7. 한국 PR 노이즈 자동 차단 + 앱스토어 릴리즈 노트 수동 보조

**편집장**: `curation-strategy.md`에 "한국 PR 뉴스룸 노이즈" 문제는 명시했지만, 실제 `fetch:service`는 노이즈를 끄집어내 사람이 거르는 구조.

**시스템 운영자**: `service-sources.json`에 `excludeTitlePatterns`는 일부 있지만 약합니다. **패턴 화이트리스트/블랙리스트 강화:**
- 자동 차단: `^(.*캠페인|매장 오픈|콜라보|단독 할인|콘서트|모델|화보|기부|ESG|채용 시작)`
- 자동 표시: `리뉴얼|개편|업데이트|출시|도입|적용|개선|런칭|베타|AI|개인화|추천|멤버십|혜택 변경|결제|리뷰`

**클라이언트 PM**: 자동 차단은 신중해야 합니다. "콜라보"가 실제 화면 변화 동반하는 경우도 있어요.

**시스템 운영자**: 그래서 **블랙리스트는 점수 -2, 화이트리스트는 점수 +2** 가산만 하고, 0점 이상만 후보. 블랙리스트라도 다른 신호 있으면 살아남는 방식.

**클라이언트 PM**: 앱스토어 릴리즈 노트는 RSS가 없으니, 매주 모니터링 대상 30개 앱을 자동 스크랩하면 좋겠어요. 다만 Apple/Google이 봇 차단을 잘 해요.

**시스템 운영자**: Apptweak·Sensor Tower 같은 ASO 도구 API는 유료. 우선 무료 경로: App Store RSS Feed Generator(Apple 제공) 활용 가능.

**결론**:
1. 자동 수집 점수제 도입(블랙/화이트 키워드 ± 가산).
2. 앱스토어 릴리즈 노트 자동 수집: `news-tracking/appstore-tracking.json`(앱 ID 리스트) + 주 1회 cron 스크랩.
3. 수집된 릴리즈 노트는 discovery_source 등급.

---

### 안건 8. 정보 fragmentation 줄이는 단일 운영 뷰

**편집장**: 현재 운영자 시점에서 `runs/YYYY-MM-DD/raw/*.json`, `magazine/shortlist-20-30.md`, `magazine/magazine-report.md`, `public/data/magazine.json`이 분산. shortlist 단계에서 어떤 후보가 어떤 사유로 빠졌는지 매번 grep.

**시스템 운영자**: `runs/YYYY-MM-DD/dashboard.html` 자동 생성 — 카테고리별 후보 수, 통과/제외 사유 요약, magazine-report에 들어간 글 링크, 다음 액션 체크리스트.

**클라이언트 PM**: 그게 있으면 매주 클라이언트 미팅 직전에 "이번 주 모니터링한 풀 + 채택 항목"을 그대로 띄울 수 있습니다.

**비주얼 디자이너**: 스크린샷 미확보 항목·이미지 깨진 글도 한 곳에서 보고 싶어요.

**편집장**: 사용자 피드백(feedback-bonus.json) 누적 결과도 같은 대시보드에서.

**결론**:
1. `npm run dashboard -- --date=YYYY-MM-DD` → `runs/YYYY-MM-DD/dashboard.html` 정적 생성.
2. 섹션: 수집 풀 / shortlist / 채택 / 제외 사유 / 이미지 상태 / feedback 점수 / 다음 액션.
3. 정적 HTML이라 깃에 같이 커밋, 클라이언트 화면 공유 가능.

---

## Part 3. 우선순위와 다음 액션

| 단계 | 안건 | 의존성 | 기간 | 영향 | 상태 |
|---|---|---|---|---|---|
| **1차 (즉시)** | 안건 1: 직무 라벨(service=기획자/design=디자이너/dev=퍼블리셔) 병기 | 없음 | 1~2일 | 사이트 UX 즉시 개선 | ✅ Done (2026-05-24) |
| | 안건 6-A: `meeting_question` 메타 | 없음 | 1일 | SERVICE 매거진 가치 강화 | 다음 |
| | 안건 7-A: 점수제 수집 필터 | 없음 | 2일 | 노이즈 감소, 운영 시간 절약 | 대기 |
| **2차 (1~2주)** | 안건 3: 재발견 메타(`flow`,`brand_normalized`,`change_type`) + `/explore` | 안건 1 | 1주 | 누적 자산 활용도 |
| | 안건 5: 퍼블리셔 분리 + `code_artifacts` + vite/11ty/Astro 소스 추가 | 안건 1 | 3일 | DEV 직군 가치 |
| | 안건 2: discovery vs verification 등급 + 신규 소스 (디스콰이엇·유아이볼·GDWeb·Codrops·11ty/Astro) | 없음 | 1주 | 발견 폭 확장 |
| **3차 (1개월)** | 안건 4: `/gallery` 다중 스크린샷 + 가로 비교 | 안건 3, 안건 1 | 2주 | 디자이너 가치 폭발 |
| | 안건 7-B: 앱스토어 RN 자동 수집 | 안건 7-A | 1주 | 신호 강도 1위 출처 확보 |
| | 안건 6-B: 채용 신호 `/signals` | 안건 2 | 1주 | PM 선행 지표 |
| **4차 (운영)** | 안건 8: 일일 대시보드 | 위 전체 | 3일 | 운영자·클라이언트 단일 뷰 |

### 합의 사항 3가지

1. 카테고리(Service/Design/DEV)는 그대로, **그 위에 직무(PM/Designer/Publisher) 축을 직교로 얹는다.** 모든 후속 작업의 토대.
2. 수집은 **discovery(발견) vs verification(검증)** 두 등급으로 명시 분리. 한국 PR 뉴스룸 노이즈는 점수제로 -2 가산, 화이트리스트 +2 가산, 0점 이상만 후보.
3. 누적 자산을 다시 쓸 수 있게 **flow/brand/change_type 메타와 `/explore`·`/gallery` 페이지**를 도입한다. 매거진은 텍스트 정체성 유지, 스크린샷 뷰는 별도.

### 직무 정의 확정 (2026-05-24)

| 직무 | 본업 | 추가 범위 | 명시 제외 |
|---|---|---|---|
| **PM (웹기획자)** | 서비스 구조·전환·리텐션·정책·플로우 | 운영자 UX(어드민·셀러 도구), 채용 신호 모니터링 | — |
| **Designer (UIUX 비주얼)** | UI·비주얼·브랜드·콘텐츠 표현·디자인 시스템 | 한국 매거진·갤러리(GDWeb, 디비컷, Notefolio) | — |
| **Publisher (UIUX 퍼블리셔)** | 마크업·CSS·접근성·인터랙션 구현 | **FrontDEV 일부 — vite 환경설정, 11ty, Astro 같은 정적 사이트 생성기·빌드 도구** | **데이터·백엔드·서버·DB·인프라·ML** |

---

## 참고 자료 (학습 출처)

### 한국 UIUX 레퍼런스 큐레이션 채널
- 유아이볼(UI Bowl): https://uibowl.io/template
- Designus 웹 레퍼런스: https://ko.designus.design/web-reference
- GDWEB 디자인 어워드: https://www.gdweb.co.kr/
- UPA (UX Pattern Archive, 유저스푼): https://upa.userspoon.com/
- 신비한 UX 레퍼런스 사전 뉴스레터: https://uxnewsletter.stibee.com/
- 디독(D.dok) 아카이브: https://github.com/didok-archive/didok-archive.github.io

### 한국 PM/메이커 커뮤니티·리포트
- Disquiet: https://disquiet.io/
- PUBLY 멤버십: https://publy.co/membership/start
- 오픈서베이 트렌드 리포트: https://contents.opensurvey.io/newsletter_subscribe.html
- 메조미디어 2025 이커머스 업종 분석: https://cdn.cjmezzomedia.com/attach-file/insight-m/2025__20251029164111.pdf

### 글로벌 UX 플로우 아카이브
- Mobbin: https://mobbin.com/
- Refero/Page Flows 비교: https://coolcuration.com/cool/services-mobbin-vs-alternatives

### 퍼블리셔용 정적 사이트·빌드 도구 (안건 5 신규 소스)
- 11ty(Eleventy) 공식 블로그: https://www.11ty.dev/blog/
- Astro 공식 블로그: https://astro.build/blog/
- Vite 릴리즈 노트: https://github.com/vitejs/vite/releases

### PM 워크플로 & 정보 fragmentation
- 바질리 — 슬랙+노션+드라이브 단편화: https://blog.basily.space/slack-notion-drive-team-productivity
- Brainconnect.ai — 경쟁사 분석: https://brainconnect.ai/blog/competitor-analysis-benchmarking-map
- Apptweak — 앱 경쟁자 분석: https://www.apptweak.com/ko/aso-tools/app-competition-monitoring
