# UIUX/Web Service Weekly Trend Report

한국 웹에이전시가 클라이언트 미팅에서 국내 이커머스 업계 동향, 서비스 변화, UI/UX 트렌드를 근거 있게 이야기하기 위해 운영하는 주간 리포트 저장소입니다.

## 목적

- 국내 주요 이커머스, 백화점, 뷰티, 도서/콘텐츠 서비스의 UI/UX 변경, 신규 서비스, AI/추천/검색/결제/알림 기능 업데이트를 주 1회 확인합니다.
- 앱스토어 릴리즈 노트, 공식 뉴스룸, 주요 미디어를 기반으로 팩트를 수집합니다.
- 국내 UIUX·서비스 기획 매거진, 공신력 있는 컨퍼런스/YouTube, OpenAI·Claude·Figma·Adobe·Gemini 등 디자인 AI 도구의 최신 변화도 별도 축으로 확인합니다.
- 클라이언트 미팅에서 바로 말할 수 있는 인사이트와 질문으로 정리합니다.

## 운영 원칙

- 공식 출처를 우선합니다.
- 수치가 있으면 반드시 출처를 남깁니다.
- 출처가 불명확한 수치는 `추정`으로 표시합니다.
- 단순 안정화/버그 수정은 제외하되, 결제/검색/추천/홈 화면처럼 핵심 여정에 영향이 있으면 포함합니다.
- 할인/프로모션은 독립 소식이 아니라 새로운 서비스 흐름이나 UI/UX 변화가 있을 때만 포함합니다.
- 매출, 거래액, MAU, 전환율 등 성과 수치는 독립 섹션보다 서비스 변화의 근거로 함께 남깁니다.
- 수집 원본은 풍부하게 작성하고, 발행 리포트는 짧고 실무적으로 압축합니다.
- 매거진 상세페이지에는 수집 요약보다 긴 배경, 사용자 여정 해석, 클라이언트 적용 포인트를 별도 작성합니다.
- 후보군 인사이트는 단서로만 사용하고, 발행 리포트는 공식 발표, 제품 블로그, 릴리즈 노트, 뉴스룸, 앱스토어/플레이스토어 등 최종 기준 원문을 확인한 뒤 작성합니다.
- 외국어 원문은 직역하지 않고, 원문의 팩트와 고유명사는 보존하되 국내 서비스 기획·디자인·개발 실무자가 자연스럽게 읽는 한국어로 패치합니다. 자세한 기준은 [매거진 상세 글쓰기 가이드](docs/editorial-style-guide.md)의 `해외 원문 한국어 패치`를 따릅니다.
- 후보군에서 출발한 글은 최종 기준 원문이 대기업, 공공성이 큰 공식 기관, 또는 주요 스타트업의 공식 자료일 때만 Notion 글로 등록합니다.
- 최종 기준 원문을 찾지 못한 후보도 내용과 직접 관련된 신뢰 가능한 글이 있으면 `관련 글`로 찾아 남깁니다. 단, 관련 글은 후보 이해와 제외 메모 보강용이며 Notion 글 등록 기준을 대체하지 않습니다.
- 공식 제품 YouTube와 공식 컨퍼런스 영상은 매주 독립 수집 축으로 확인합니다. 공식 채널의 제품 발표/데모/세션 영상은 최종 기준 원문이 될 수 있고, 개인·인터뷰·큐레이션 영상은 후보 발견 출처나 관련 글로 남긴 뒤 공식 문서로 재확인합니다.
- 채택하지 않은 후보도 버리지 않고, 최종 리포트 하단의 `수집했지만 제외한 것`에 짧게 남깁니다.

## 데이터 품질 기준

상세 기준은 [데이터 수집 전략](docs/data-collection-strategy.md)을 기준으로 합니다.

1. 클라이언트 대화 가치: “그래서 우리 서비스는 무엇을 점검해야 하나?”에 답해야 합니다.
2. 출처 신뢰도: 공식 릴리즈, 공식 뉴스룸, 앱스토어/플레이스토어, 신뢰 가능한 미디어를 우선합니다.
3. UI/UX 근거: 화면, 진입점, 행동 변화가 설명되지 않으면 우선순위를 낮춥니다.
4. 성과 근거: 매출/거래액/전환율/MAU 수치는 기간과 비교 기준을 함께 적습니다.
5. 적용 가능성: 특정 플랫폼 뉴스라도 패션, 뷰티, 도서, 커머스 클라이언트에 응용 가능한 포인트가 있어야 합니다.
6. 온라인 서비스 가치: 해외 진출, 역직구 성장, 멤버십, 개인화, AI 추천, 결제, CRM처럼 온라인 서비스 구조나 사용자 여정을 바꾸는 이슈를 우선 수집합니다.
7. 국내외 디자인·서비스 UX 가치: 국내 모니터링 범위 밖이라도 같은 주에 화제가 된 글로벌 서비스, 디자인 도구, 커머스, 콘텐츠, AI 서비스 경험 변화가 웹기획자, PM, 웹디자이너의 레퍼런스로 유용하면 UIUX 후보로 수집합니다.
8. DEV 실무 가치: 브라우저, 웹 표준, 접근성, CSS/HTML/JavaScript, 디자인 시스템, 컴포넌트, 프론트엔드 AI 도구처럼 UIUX 개발자가 구현·검증에 바로 연결할 수 있으면 DEV 후보로 수집합니다.
9. AI 도구 추적: OpenAI, Claude, Figma, Photoshop/Adobe Firefly, Gemini, Canva, Framer, Webflow 등은 매주 확인하되, 디자인·기획·프로토타이핑·디자인-코드 워크플로우 변화가 있을 때 우선 채택합니다.
10. 직무 태그: 수집 후보에는 `웹디자인`, `웹서비스기획`, `웹DEV` 중 하나 이상을 반드시 붙입니다.
11. 제외 원칙: 단순 버그 수정, 단순 할인, 출처 없는 예측, 화면 변화 없는 홍보성 뉴스는 제외하거나 후보로만 둡니다.
12. 원문 역추적: 매거진, YouTube, 큐레이션 글에서 발견한 후보는 해당 글이 가리키는 원문을 찾아 `최종 기준 원문`으로 기록합니다.
13. 균형 수집: 최종 best 20은 품질 기준으로 고르되, 수집 단계에서는 Service / Design / DEV와 공식 출처, 국내 매거진, 공식 YouTube, AI·디자인 도구, DEV 릴리즈를 모두 확인합니다.
14. 후보군 글 등록 제한: 후보 발견 출처가 매거진/개인 블로그/YouTube일 경우, 최종 기준 원문이 대기업·주요 스타트업·공식 기관 자료로 확인될 때만 글 등록합니다.

## 목표 수집 수준

샘플 PDF 수준의 원천 데이터를 기준으로 삼습니다. 즉, 한 이슈는 단순 기사 요약이 아니라 아래 정보가 있어야 채택합니다.

매주 Notion에 추가할 채택 이슈는 Service / Design / DEV를 합쳐 최대 20개까지 고릅니다. 이 20개는 노출 제한이 아니라 수집 품질 기준입니다. 사이트와 뉴스레터는 Notion에 채택되어 있는 데이터를 별도 개수 제한 없이 읽습니다.

같은 주에 같은 브랜드가 여러 번 등장해도 대카테고리가 다르면 분리합니다. 병합은 `대카테고리 + 브랜드 + 소카테고리 + 독자 가치`가 같을 때만 검토합니다.

1. 업데이트 상세: 기능, 화면, 정책, 캠페인 구조가 최소 3개 이상 구체적으로 설명되어야 합니다.
2. 변경 전/후: 사용자가 이전에 하던 행동과 바뀐 행동을 비교할 수 있어야 합니다.
3. 수치 근거: 성장률, 거래액, 전환율, 이용료, 적립률, 기간 등 숫자가 있으면 원문 기준 그대로 남깁니다.
4. 인사이트: 변화의 의미, 예상 효과, 서비스 적용 관점을 중복 없이 묶어 적습니다.
5. 출처 URL: 발행 뉴스레터에는 숨기더라도 수집 원본에는 반드시 남깁니다.
6. 검증 상태: 공식 확인, 미디어 보도, 앱스토어 릴리즈, 추정 여부를 구분합니다.
7. 이미지 근거: 화면 변화가 중요한 이슈는 최종 기준 원문의 공식 스크린샷, 앱스토어 이미지, 공식 뉴스룸 이미지처럼 출처가 확인되는 이미지를 함께 남깁니다.
8. 제외 메모: 보류/제외한 후보도 출처, 제외 사유, 다시 볼 조건을 남겨 리포트 하단에 요약할 수 있어야 합니다.

좋은 데이터 예시는 `무신사 멀티 스토어 홈`, `화해 듀프템 찾기`, `네이버플러스 스토어 쇼핑 AI 에이전트`, `G마켓 꼭 멤버십`, `SSF SHOP 브랜드관 방문 보상`, `올리브영 일본 진출`처럼 기능 구조, 사용자 변화, 비즈니스 효과, 해외 확장 전략이 함께 보이는 국내 사례입니다.

## 채택선

메인 리포트에 올릴 이슈는 아래 4개 중 최소 3개를 충족해야 합니다.

1. 실제 기능, 화면, 정책, 혜택 구조 중 하나가 바뀌었습니다.
2. 사용자의 탐색, 비교, 구매, 재방문, 로그인, 알림 행동이 달라집니다.
3. 수치, 기간, 가격, 적립률, 전환율, 성장률 중 하나 이상의 팩트가 있습니다.
4. 해외 진출, 역직구 성장, 멤버십, 개인화, AI 추천, 결제, CRM처럼 온라인 서비스 확장 전략을 보여줍니다.
5. 클라이언트에게 바로 던질 수 있는 점검 질문이 나옵니다.

이 기준을 넘지 못한 이슈는 `제외 후보`로 남깁니다. 제 기준에서는 단순 “앱 안정화”, “일부 기능 개선”, “봄맞이 할인전”은 화면 변화나 행동 변화가 확인되지 않으면 메인 이슈가 아닙니다.

UIUX는 웹기획자, PM, 웹디자이너가 흥미롭게 읽을 기사만 채택합니다. 서비스 구조, 정책/혜택 설계, 전환 플로우, 화면 구성, 정보구조, 콘텐츠 표현, 브랜드 경험, 온보딩, AI 추천/생성 인터페이스처럼 기획자와 디자이너가 레퍼런스로 삼을 수 있는 변화가 있어야 합니다. OS 설정, 클라우드 관리자 도구, 범용 업무 자동화처럼 웹기획·PM·웹디자인 실무와 거리가 먼 이슈는 UIUX에서 제외합니다.

DEV는 UIUX 개발자가 흥미롭게 읽을 기사만 채택합니다. CSS/HTML/JavaScript, 브라우저 호환성, 웹접근성, 디자인 시스템, 컴포넌트 구현, 시각 회귀/접근성 테스트, 디자인-코드 연동 도구처럼 화면 구현과 검증에 바로 연결되는 변화가 있어야 합니다.

수집 단계에서는 대분류와 별도로 직무 태그를 붙입니다. `웹디자인`은 UI, 비주얼, 브랜드 경험, 콘텐츠 표현, 디자인 시스템 관점이고, `웹서비스기획`은 정책, 혜택, 플로우, 정보구조, 전환, 리텐션 관점이며, `웹DEV`는 프론트엔드 구현, 브라우저 호환성, 접근성 QA, 컴포넌트, 디자인-코드 연동 관점입니다.

## 플랫폼 카드 필수 항목

발행 리포트의 플랫폼별 카드는 아래 항목을 기본으로 작성합니다.

1. UIUX `서비스 변화 요약`: 업데이트, 서비스 맥락, 변경 전/후, 수치·팩트를 한 섹션 안에 묶습니다.
2. DEV `기술 변화 요약`: 업데이트, 기술 맥락, 변경 전/후, 확인할 영향을 한 섹션 안에 묶습니다.
3. 매거진 인사이트: 뉴스 요약을 반복하지 않고 UIUX는 배경, 사용자 여정 해석, 클라이언트 질문을, DEV는 기술 판단과 실무 적용 포인트를 하나의 글로 확장합니다.

각 항목은 회의에서 바로 읽을 수 있게 짧게 씁니다. 한 카드 안에서 `무엇이 바뀌었는지`, `사용자 행동이 어떻게 달라졌는지`, `확인 가능한 수치가 있는지`, `클라이언트가 무엇을 점검해야 하는지`가 1분 안에 읽혀야 합니다. 수치가 없으면 수치가 없다는 문장을 쓰지 않습니다.

웹사이트 상세페이지에만 길게 보여줄 내용은 `매거진 인사이트` 섹션에 작성합니다. 이 섹션은 뉴스레터 목록에는 노출하지 않고, 매거진 아티클 페이지에서만 렌더링합니다. 여기에는 기사 요약을 반복하지 말고 `배경`, `사용자 여정 해석`, `클라이언트 적용 포인트`를 하나의 매거진 글처럼 씁니다. 문체는 [매거진 상세 글쓰기 가이드](docs/editorial-style-guide.md)를 따릅니다.

## 리포트 카테고리

리포트는 먼저 대분류를 `Service`, `Design`, `DEV`로 나누고, 각 대분류 안에 소분류를 둡니다.

1. Service: 웹기획자와 PM이 서비스 구조, 정책, 혜택, 정보구조, 전환 흐름 관점에서 읽을 이슈
2. Design: 웹디자이너가 UI, 비주얼, 브랜드 경험, 콘텐츠 표현, 디자인 시스템, 디자인 AI 워크플로우 관점에서 읽을 이슈
3. DEV: UIUX 개발자가 화면 구현, 브라우저/웹 플랫폼, 접근성 QA, 디자인 시스템, 컴포넌트, AI 개발 도구 관점에서 읽을 이슈

## UI/UX 선정 우선순위

1. 홈, 검색, 상품 상세, 장바구니, 결제, 마이페이지 등 핵심 화면 변경
2. 추천, 개인화, AI 에이전트, 이미지 검색, 성분/취향 기반 탐색 기능
3. 멤버십, 쿠폰, 포인트, 알림처럼 사용자 행동을 바꾸는 서비스 구조 변경
4. 로그인, 뷰어, 책갈피, 재고 확인, 픽업/배송 안내 등 사용성 개선
5. 단순 안정화는 제외

## 리포트 우선순위

1. platform: 로컬, 커뮤니티, 콘텐츠, 리서치, 검색/추천처럼 공급자와 사용자를 연결하는 플랫폼 서비스
2. fintech: 결제, 송금, 정산, 포인트, 캐시, 가맹점/사장님 도구처럼 돈의 흐름을 다루는 서비스
3. ecommerce: 종합몰, 마켓플레이스, 홈쇼핑, 배달/생활 커머스
4. fashion: 패션 플랫폼, 브랜드관, 룩북, 찜/재입고, 스타일 추천
5. beauty: 뷰티 커머스, 리뷰/성분/피부 진단, 개인화 추천
6. book_content: 도서, 전자책, 웹툰/웹소설, 이어보기, 콘텐츠 추천
7. department_store: 백화점 앱, VIP/멤버십, 온라인 혜택, 선물/픽업

수집은 국내 모니터링 범위의 모든 서비스를 확인합니다. 위 순서는 수집 제외 기준이 아니라, 리포트에 올릴 이슈를 선별하고 배치할 때의 우선순위입니다.

## UIUX 소분류

`Service` 대분류 안에서는 업종뿐 아니라 서비스 구조 기준으로 나눕니다. 각 카드 안에서 홈, 검색, 추천, 찜, 로그인, 결제, 멤버십 같은 UX 여정을 분석합니다.

1. platform: 로컬, 커뮤니티, 콘텐츠, 리서치, 검색/추천, 양면시장 플랫폼
2. fintech: 결제, 송금, 정산, 포인트, 캐시, 금융/가맹점 운영 UX
3. ecommerce: 종합몰, 마켓플레이스, 홈쇼핑, 배달/생활 커머스
4. fashion: 패션 플랫폼, 브랜드관, 룩북, 찜/재입고, 스타일 추천
5. beauty: 뷰티 커머스, 리뷰/성분/피부 진단, 개인화 추천
6. book_content: 도서, 전자책, 웹툰/웹소설, 이어보기, 콘텐츠 추천
7. department_store: 백화점 앱, VIP/멤버십, 온라인 혜택, 선물/픽업
8. global_service_ux: 국내외 주요 서비스, 디자인 도구, 커머스, 콘텐츠, AI 서비스의 서비스 구조·정책/혜택·전환 플로우·화면·브랜드 경험·콘텐츠 표현·온보딩 변화

## Design 소분류

`Design` 대분류 안에서는 디자인 실무에서 참고할 변화의 성격으로 나눕니다.

1. AI: ChatGPT Images, Claude Design, Figma AI, Adobe Firefly, Gemini/Imagen, Canva 등 AI 기반 이미지 생성, 프로토타이핑, 디자인 시스템 적용, 디자인-코드 핸드오프 변화
2. global_service_ux: 브랜드 경험, 제품 디자인 회고, 콘텐츠 표현, 정보구조, 온보딩, 서비스 화면 레퍼런스

## DEV 소분류

`DEV` 대분류 안에서는 개발 영향 범위 기준으로 나눕니다. 사이트 빌드 시 dev 이슈는 플랫폼명, 카테고리, 태그, 요약 문장을 기준으로 아래 소분류에 자동 배치됩니다.

1. AI: AI 개발 도구, 코딩 에이전트, 코드 어시스턴트, MCP, 에이전트 기반 UI 구현/검증
2. Update: 브라우저, Safari/WebKit, Chrome/Chromium, Firefox/Mozilla, iOS/iPadOS 릴리즈와 호환성 업데이트
3. HTML: 마크업, DOM, 시맨틱 HTML, 웹 컴포넌트
4. CSS: 레이아웃, 반응형, 스타일, 애니메이션, Baseline, 신규 CSS 속성/API
5. JAVASCRIPT: JavaScript, TypeScript, 프레임워크, 런타임, 컴포넌트, 디자인 시스템, Astro
6. 웹접근성: 접근성, WCAG, ARIA, 스크린리더, 키보드/focus 동작
7. TOOL: 테스트, 품질, 빌드, 배포, 모니터링
8. DATA/API: 데이터, API, 서버, 백엔드, 인증

DEV 수집은 “개발자에게 흥미로운 뉴스”가 아니라 “UIUX 개발자가 화면 구현, 디자인 시스템 운영, 접근성 QA, 브라우저 호환성 판단에 바로 쓸 수 있는 정보”만 우선합니다. 매주 금주 기준 최신 릴리즈를 확인하고, 프론트엔드 AI 도구와 디자인-코드 연동 이슈는 동일 점수라면 먼저 배치합니다. 접근성, CSS, JavaScript, HTML, iOS/Safari/WebKit, Chrome/Chromium, Firefox/Mozilla 속성·API 업데이트 사례는 필수 확인 축으로 둡니다.

## DEV 아티클 작성 구조

`DEV` 이슈의 `매거진 인사이트`는 UIUX 이슈와 다른 소제목을 사용합니다. 개발자가 바로 적용할 수 있는 기술 판단과 실행 포인트가 보여야 합니다.

1. `기술 변화 요약`: 업데이트, 기술 맥락, 변경 전/후, 확인할 영향을 씁니다.
2. `왜 지금 이 업데이트인가`: 릴리즈 배경과 기술 흐름을 설명합니다.
3. `프론트엔드 개발 전문가 관점`: 프레임워크, 브라우저, 빌드/품질 도구, 런타임, 배포 환경 관점에서 봐야 할 판단을 씁니다.
4. `실무에 어떻게 적용할 수 있을까`: 화면 구현 실무 기준으로 마크업/CSS, 접근성, 반응형, 브라우저 QA, 배포 검증 포인트를 `- ...` 리스트 3개 이상으로 씁니다.
5. `같이 보면 좋은 기술`: 함께 검토할 API, 라이브러리, 설정, 런타임, 도구를 `- 기술명: 왜 같이 봐야 하는지` 리스트로 씁니다.

DEV 영역에서는 `Frontend Development 관점`, `개발자는 무엇을 덜 해도 될까`, `클라이언트에게 던질 질문` 소제목을 쓰지 않습니다. `scripts/notion/report_parser.py`와 `scripts/newsletter/send_newsletter.py`는 DEV 영역에서 이 구 소제목이 발견되면 중단합니다.

## 이미지 사용 기준

- 최종 기준 원문에서 제공하는 공식 앱스토어/플레이스토어 스크린샷, 공식 뉴스룸 이미지, 공식 이벤트 페이지 이미지를 우선합니다.
- 매거진, YouTube, 보조 기사에서 발견한 후보라도 이미지는 해당 후보 매체가 아니라 최종 기준 원문에서 가져옵니다.
- 웹사이트와 상세페이지에 넣을 이미지는 `https`로 접근 가능해야 합니다.
- 캡처 이미지는 원본 출처와 캡처 날짜를 수집 원본에 남깁니다.
- 이미지가 UI 변화를 설명하지 못하고 분위기만 만드는 경우에는 넣지 않습니다.
- 리포트에는 `이미지:`와 `이미지 설명:`을 적으면 웹사이트 상세페이지에 이미지가 표시됩니다.
- 새로 추가한 후보/아티클은 발행 전에 `scripts/tracking/fill_missing_images.py`로 빈 `이미지:`를 먼저 채웁니다. 자동 탐색은 최종 기준 원문의 App Store 공식 스크린샷, 페이지 `og:image`, `twitter:image` 순으로 시도합니다. 관련 뉴스/보조 출처 이미지는 대체 이미지로 쓰지 않고, 그래도 없으면 `이미지 확보 메모:`에 못 찾은 이유를 남깁니다.

## 국내 모니터링 범위

- 1순위 패션: 무신사, SSF SHOP, 코오롱몰, LF몰, W Concept, 29CM, EQL 등
- 2순위 이커머스: 쿠팡, SSG.COM, 롯데ON, G마켓, 네이버플러스 스토어, 당근마켓, 지그재그, 에이블리 등
- 3순위 백화점: 신세계백화점, 롯데백화점, 현대백화점, 갤러리아 등
- 4순위 뷰티: 올리브영, 화해 등
- 5순위 도서/콘텐츠: YES24, 교보문고, 알라딘, 리디, 밀리의서재 등

## 주간 작업 흐름

주간 작업은 [매거진 에이전트 운영 흐름](docs/magazine-agent-workflow.md)의 `수집 에이전트 → 원문 검증 에이전트 → 분류 에이전트 → 글쓰기 에이전트 → 리뷰 에이전트 → QA 에이전트` 순서를 따릅니다.

1. 수집 에이전트가 `data/platforms.json`의 국내 모니터링 범위, 공식 뉴스룸, 앱스토어, 공식 블로그, 주요 미디어, DEV 릴리즈 출처를 확인해 Service / Design / DEV 후보 20~30개를 모읍니다.
2. 후보 이슈를 `templates/raw-collection.md` 형식으로 풍부하게 수집합니다. 이때 기능명만 적지 않고 `출처 원문`, `화면·플로우 관찰`, `사용자 행동 변화`, `수치·팩트`, `비즈니스 맥락`, `매거진 인사이트 확장 메모`까지 채웁니다.
3. 원문 검증 에이전트가 후보 발견 출처와 최종 기준 원문을 분리합니다. 원문에서 구체 사실 3개 이상을 뽑지 못하면 메인 이슈로 승격하지 않습니다.
4. 분류 에이전트가 Service / Design / DEV와 소분류를 확정합니다. 디자인 AI는 `design/ai`, 개발 AI는 `dev/ai`로 정리하고, 화면 구현과 무관한 DATA/API 중심 글은 제외합니다.
5. Service / Design / DEV와 출처 유형이 한쪽으로 몰리지 않았는지 확인합니다. 채택할 이슈가 없는 축도 확인한 출처와 제외 사유를 남깁니다.
6. 이미지/미디어 검수 에이전트가 원천 수집 파일의 이미지 출처를 확인하고, 필요하면 `scripts/tracking/fill_missing_images.py collections/YYYY-MM-DD-raw-trend-collection.md`로 빈 이미지를 보강합니다.
7. `scripts/legacy/new_report.py`로 이번 주 리포트 파일을 생성합니다.
8. 글쓰기 에이전트가 발행 리포트에 UIUX 이슈는 `서비스 변화 요약`, `매거진 인사이트` 순서로, DEV 이슈는 `기술 변화 요약`, `매거진 인사이트` 순서로 작성합니다.
9. 글쓰기 에이전트는 각 글에 원문에서 확인한 구체 항목 3개 이상을 반영하고, 최종 리포트 하단의 `수집했지만 제외한 것`에 제외 후보의 출처, 대분류, 제외 사유, 다시 볼 조건을 짧게 남깁니다.
10. 리뷰 에이전트가 작성된 20~30개 매거진 문구의 `출처 URL`을 다시 열어 원문 대조 리뷰를 수행합니다. 원문 핵심이 빠졌거나 일반론으로 바뀐 글, 카테고리가 잘못된 글, 원문에 없는 효과를 단정한 글은 원문 기준으로 다시 수정합니다.
11. 카테고리/라우팅 QA 에이전트가 `dev/ai_design`, `dev/ai_dev`, `dev/data_api` 같은 잘못된 경로와 article 번호/route를 점검합니다.
12. Notion 동기화 에이전트가 `runs/YYYY-MM-DD/magazine-report.md`, `public/data/magazine.json`, Notion DB의 제목, 카테고리, deck, 태그가 같은지 확인하고 필요한 곳을 다시 맞춥니다.
13. 뉴스레터 프리뷰 에이전트가 이메일 카드 길이, 링크, 이미지, CTA를 확인합니다. 테스트 확인 전에는 최종 수신자에게 발송하지 않습니다.
14. UIUX `서비스 변화 요약`에는 업데이트, 서비스 맥락, 변경 전/후, 실제 수치만 묶어 넣고, DEV `기술 변화 요약`에는 업데이트, 기술 맥락, 변경 전/후, 확인할 영향을 묶어 넣습니다. `매거진 인사이트`에는 배경, 사용자 여정 해석 또는 기술 적용 포인트를 하나의 글로 추가합니다.

## 새 리포트 만들기

```bash
python3 scripts/legacy/new_report.py
```

특정 날짜로 만들고 싶으면:

```bash
python3 scripts/legacy/new_report.py 2026-04-20
```

생성 파일은 `reports/YYYY-MM-DD-uiux-web-service-weekly-trend-report.md`에 저장됩니다.

## 원천 수집 체크리스트 만들기

```bash
python3 scripts/tracking/new_collection.py
```

특정 날짜로 만들고 싶으면:

```bash
python3 scripts/tracking/new_collection.py 2026-04-20
```

생성 파일은 `collections/YYYY-MM-DD-raw-trend-collection.md`에 저장됩니다. 체크리스트는 모든 서비스를 포함하고, 리포트 배치 참고용으로 `data/platforms.json`의 `contentPriority` 순서를 따릅니다.

자동 추적 결과를 기존 raw collection 템플릿으로 검수하려면 아래 순서로 실행합니다.

```bash
npm run fetch:tracking
npm run tracking:brief
npm run collect:raw -- --date=2026-04-27
```

`collect:raw`는 기본적으로 `news-tracking/selected/YYYY-MM-DD.json`을 읽어 `collections/YYYY-MM-DD-raw-trend-collection.md`를 만듭니다. 이미 사람이 수정한 raw collection이 있으면 덮어쓰지 않습니다. 다시 생성해야 할 때만 `--overwrite`를 붙입니다.

```bash
npm run collect:raw -- --date=2026-04-27 --overwrite
```

다른 입력을 쓰고 싶으면 `--source=candidates`, `--source=articles`, 또는 `--input=상대/절대경로.json`을 사용할 수 있습니다. 이 단계에서 만든 md는 최종 발행물이 아니라 원문 확인, 이미지 확인, 제외 사유 기록을 위한 검수 레이어입니다.

## 누락 이미지 채우기

새로 추가한 수집 후보나 리포트 아티클에 `이미지:`가 비어 있으면 아래 명령으로 공식 출처의 대표 이미지를 채웁니다.

```bash
python3 scripts/tracking/fill_missing_images.py reports/2026-04-20-uiux-web-service-weekly-trend-report.md
```

원천 수집 파일에도 같은 방식으로 실행할 수 있습니다.

```bash
python3 scripts/tracking/fill_missing_images.py collections/2026-04-20-raw-trend-collection.md
```

실제 수정 전에 확인만 하려면 `--dry-run`을 붙입니다. 이미지를 못 찾은 항목은 출력 목록을 보고 직접 공식 화면이나 캡처 가능 여부를 확인합니다.

## 뉴스레터 미리보기 만들기

```bash
python3 scripts/newsletter/send_newsletter.py reports/2026-04-20-uiux-web-service-weekly-trend-report.md
```

HTML 미리보기는 `newsletters/`에 생성됩니다.

뉴스레터 본문은 제목, 짧은 설명, 매거진 링크, 태그 중심으로 발행합니다. 상세 내용은 매거진 사이트의 이슈별 아티클에 둡니다.

제목은 발표 사실을 그대로 적기보다 각 타깃이 확인해야 할 가장 중요한 판단 포인트로 정리합니다. 예를 들어 `지그재그가 임부복 카테고리를 신설했습니다`보다 `상황 언어가 온라인 카테고리 구조로 바뀌고 있는가`처럼 웹기획자, PM, 웹디자이너, UIUX 개발자가 바로 확인할 질문이 보여야 합니다. 설명에는 발표 사실, 날짜, 범위, 기능명을 넣어 근거를 보완합니다. 제목과 설명의 역할을 서로 바꾸지 않고, 제목만 독자 관점으로 다듬습니다.

Dev 카테고리 또는 태그가 붙은 이슈만 발송용으로 확인하려면 `--audience dev`를 붙입니다. 생성 파일은 일반 뉴스레터와 겹치지 않도록 `newsletters/*-dev.html`로 저장됩니다. dev 뉴스레터는 카테고리, 태그, 플랫폼명, 요약 문장을 기준으로 세부 섹션을 자동으로 나눕니다. 기존 `--audience develop`도 호환용 별칭으로 동작합니다.

dev 세부 섹션은 아래 키워드로 구분합니다. AI 키워드는 다른 키워드와 함께 있어도 최우선 분류합니다.

1. AI: `ai_development`, `code_assistant`, `copilot`, `ai_coding`, `agent`, `mcp`
2. HTML: `html`, `dom`, `markup`, `semantic_html`, `web_components`, `popover`, `dialog`
3. CSS: `css`, `css_grid_lanes`, `grid`, `layout`, `responsive`, `animation`, `baseline`, `anchor_positioning`, `view_transition`
4. JAVASCRIPT: `javascript`, `typescript`, `node`, `nextjs`, `react`, `vue`, `astro`, `component`, `design_system`
5. 웹접근성: `accessibility`, `a11y`, `wcag`, `aria`, `screen_reader`, `웹접근성`
6. TOOL: `testing`, `qa`, `eslint`, `ci`, `build`, `deploy`, `monitoring`
7. DATA/API: `data`, `api`, `backend`, `graphql`, `server`, `auth`, `node`

예를 들어 `- 카테고리: dev`인 항목의 플랫폼명이 `Next.js`이면 `JAVASCRIPT`로 묶이고, `#AI개발도구` 태그가 있으면 `AI`로 우선 배치됩니다. 특정 세부 키워드가 없으면 `JAVASCRIPT`로 묶입니다.

```bash
python3 scripts/newsletter/send_newsletter.py \
  reports/2026-04-20-uiux-web-service-weekly-trend-report.md \
  --audience dev
```

## 매거진 사이트 만들기

Vercel에 올리는 매거진 사이트는 Vue/Vite 앱으로 구성합니다. 화면은 Vue가 렌더링하고, 매거진 데이터는 런타임에 `/api/magazine`이 Notion 데이터베이스를 읽어 내려줍니다. `src/data/report.json`은 API 실패 시에만 쓰는 fallback 데이터입니다.

```bash
npm install
npm run dev
```

Notion 연동에는 아래 환경변수가 필요합니다.

```dotenv
NOTION_TOKEN=secret_xxx
NOTION_DATABASE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Notion 업로드, 매거진 API, 뉴스레터 데이터 동기화에는 `NOTION_TOKEN`, `NOTION_DATABASE_ID`가 필요합니다. 현재 기본 운영은 AI가 작성한 `runs/YYYY-MM-DD/magazine-report.md`를 최종본으로 보고 Notion에 업로드하는 흐름입니다.

```bash
npm run build
```

Vercel 설정은 저장소 루트의 `vercel.json`에 들어 있습니다.

- Build Command: `npm run build`
- Output Directory: `dist`
- Framework Preset: `Vite`

## 수집 자료를 Notion에 올리기

`collect_materials.mjs`는 원자료 수집, 분류, 출처 정리만 담당합니다. 이 단계의 결과물은 `runs/YYYY-MM-DD/tracking-data.json`과 `runs/YYYY-MM-DD/editorial-brief.md`입니다. 제목 보정, 채택/보류/제외 판단, 매거진 본문 작성은 AI가 `scripts/tracking/new_collection.py`와 `docs/*` 기준을 읽고 수행합니다.

AI가 작성한 최종 Markdown 리포트는 Notion 데이터베이스에 적재합니다. Vue 사이트는 `/api/magazine`을 통해 런타임에 Notion 데이터를 읽고 `/articles/번호` 라우트에서 렌더링합니다.

`.env` 또는 Vercel 환경변수에 아래 값을 설정합니다.

```dotenv
NOTION_TOKEN=secret_xxx
NOTION_DATABASE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

동기화 전에는 dry-run으로 들어갈 항목을 확인합니다.

```bash
python3 scripts/notion/push_notion.py runs/2026-04-27/magazine-report.md --dry-run
```

문제가 없으면 Notion DB에 추가/업데이트합니다.

```bash
python3 scripts/notion/push_notion.py runs/2026-04-27/magazine-report.md
```

Notion 데이터베이스에 `Source Key` 또는 `Slug` 속성이 있으면 같은 리포트/번호 항목을 새로 만들지 않고 업데이트합니다. 해당 속성이 없어도 제목·브랜드·대카테고리가 같은 항목은 기존 페이지를 업데이트합니다. 권장 속성은 `Title`, `Platform`, `Area`, `Category`, `Date`, `Tags`, `Takeaway`, `Deck`, `Source URL`, `Source Title`, `Image`, `Image Caption`, `Report Slug`, `Source Key`입니다.

## 주간 뉴스레터 자동 발송

Vercel Cron이 매주 월요일 16:00 KST에 `/api/weekly-newsletters`를 호출합니다. Vercel Cron은 UTC 기준이므로 `vercel.json`에는 `0 7 * * 1`로 설정합니다.

Cron 함수는 KST 기준 지난주 월요일 16:01부터 이번 주 월요일 16:00 전까지의 현재 Notion 데이터만 읽습니다. 로컬 `reports/*.md`나 `news-tracking/*.json`은 발송 데이터로 사용하지 않습니다. 이후 중복 항목을 제거하고 `대카테고리=DEV` 이슈와 나머지 UIUX 이슈를 나눠 각각 기존 뉴스레터 톤의 HTML 메일로 발송합니다. 발송 대상 데이터에는 별도 개수 제한을 두지 않습니다.

Vercel Environment Variables에 아래 값을 설정합니다.

```dotenv
CRON_SECRET=random-string-at-least-16-chars
NEWSLETTER_SUBSCRIBERS_DATABASE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NEWSLETTER_UNSUBSCRIBE_SECRET=random-string-at-least-32-chars
GITHUB_ARCHIVE_TOKEN=github_pat_xxx
GITHUB_ARCHIVE_REPOSITORY=gsuu/trend-report
GITHUB_ARCHIVE_BRANCH=main
GITHUB_ARCHIVE_DIR=newsletter-archives
```

SMTP와 Notion 환경변수도 Production 환경에 있어야 합니다.

```dotenv
SMTP_HOST=smtps.hiworks.com
SMTP_PORT=465
SMTP_USER=sender@cttd.co.kr
SMTP_PASSWORD=mail-app-password
SMTP_FROM=sender@cttd.co.kr
SMTP_TLS=false
SMTP_SSL=true
NOTION_TOKEN=secret_xxx
NOTION_DATABASE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NEWSLETTER_SUBSCRIBERS_DATABASE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NEWSLETTER_UNSUBSCRIBE_SECRET=random-string-at-least-32-chars
SITE_URL=https://cttd-magazine.vercel.app
VITE_NEWSLETTER_API_BASE_URL=https://cttd-magazine.vercel.app
```

구독자 DB는 `Email`, `Status`, `Audience`, `Unsubscribed At` 속성을 사용합니다. `Status`가 `Unsubscribed` 또는 `Inactive`인 행은 발송 대상에서 제외됩니다. `Audience`가 비어 있으면 전체 뉴스레터 대상으로 보고, 값이 있으면 `Service/Design` 또는 `DEV`에 맞는 구독자에게만 발송합니다. 메일 하단의 구독 해지 링크는 `/api/unsubscribe`에서 확인 후 `Status=Unsubscribed`, `Unsubscribed At=현재 시각`으로 갱신합니다.
매거진 사이트의 Subscribe UI는 `/api/subscribe`를 호출합니다. 사이트를 `/magazine` 같은 정적 경로에 올릴 때는 `VITE_NEWSLETTER_API_BASE_URL`을 Vercel API가 배포된 도메인으로 설정합니다.

로컬 또는 수동 테스트는 아래처럼 호출합니다.

```bash
curl "https://YOUR-DEPLOYMENT.vercel.app/api/weekly-newsletters?secret=$CRON_SECRET"
```

메일 발송 후에는 같은 이슈 목록을 Markdown으로 만들어 GitHub에 커밋합니다. 기본 저장 경로는 `newsletter-archives/YYYY-MM-DD_weekly-newsletter.md`입니다. `GITHUB_ARCHIVE_TOKEN`이 없으면 메일 발송만 진행하고 Markdown 아카이브는 건너뜁니다.

## 뉴스레터 발송하기

프로젝트 루트의 `.env` 또는 셸 환경변수에 SMTP 값을 설정한 뒤 `--send`를 붙입니다.

PDF 기반 자료 수집 후 UIUX 뉴스레터를 보낼 때는 먼저 `jisuk@cttd.co.kr`로 테스트 메일을 보내고, 사용자가 확인한 뒤에만 `cxd@cttd.co.kr`로 최종 발송합니다. 자세한 운영 규칙은 `AGENTS.md`를 따릅니다.

처음 설정할 때는 예시 파일을 복사해 실제 값을 채웁니다.

```bash
cp .env.example .env
```

`.env`는 git에 올라가지 않습니다.

```bash
export SMTP_HOST=smtp.example.com
export SMTP_PORT=587
export SMTP_USER=sender@example.com
export SMTP_PASSWORD=app-password
export SMTP_FROM=sender@example.com
export SMTP_TLS=true
export SMTP_SSL=false
export SITE_URL=https://cttd-magazine.vercel.app

python3 scripts/newsletter/send_newsletter.py \
  reports/2026-04-20-uiux-web-service-weekly-trend-report.md \
  --to product@example.com \
  --send
```

발송 시 `더보기` 링크는 `SITE_URL` 또는 `--magazine-base-url` 기준의 매거진 앱 경로 라우트(`/articles/번호`)로 연결됩니다. `MAGAZINE_BASE_URL`은 기존 환경과의 호환용 fallback으로만 사용합니다.

하이웍스 계정으로 보낼 때는 보통 아래처럼 설정합니다. 하이웍스 웹메일에서 [메일 > 환경설정 > 기본 설정 > POP3/SMTP]를 `사용 함`으로 바꾸고, 메일 전용 비밀번호가 있으면 `SMTP_PASSWORD`에 그 값을 입력합니다.

```dotenv
SMTP_HOST=smtps.hiworks.com
SMTP_PORT=465
SMTP_USER=sender@cttd.co.kr
SMTP_PASSWORD=mail-app-password
SMTP_FROM=sender@cttd.co.kr
SMTP_TLS=false
SMTP_SSL=true
SITE_URL=https://cttd-magazine.vercel.app
```

수신자가 많으면 `config/subscribers.example.txt`를 복사해 `config/subscribers.txt`로 만들고 사용합니다.

```bash
python3 scripts/newsletter/send_newsletter.py \
  reports/2026-04-20-uiux-web-service-weekly-trend-report.md \
  --subscribers config/subscribers.txt \
  --send
```

UIUX 최종 발송 수신자는 `cxd@cttd.co.kr`입니다. 테스트 메일 확인 후 아래 명령으로 발송합니다.

```bash
python3 scripts/newsletter/send_newsletter.py \
  reports/2026-04-20-uiux-web-service-weekly-trend-report.md \
  --stage final \
  --approved \
  --send
```

dev용으로 발송할 때도 같은 옵션을 사용합니다. 단, 대상 이슈가 없으면 실제 발송은 중단됩니다.

```bash
python3 scripts/newsletter/send_newsletter.py \
  reports/2026-04-20-uiux-web-service-weekly-trend-report.md \
  --audience dev \
  --stage test \
  --send
```

dev 최종 발송 수신자는 `config/dev-final-subscribers.txt` 목록만 사용합니다. 테스트 메일 확인 후 아래 명령으로 발송합니다.

```bash
python3 scripts/newsletter/send_newsletter.py \
  reports/2026-04-20-uiux-web-service-weekly-trend-report.md \
  --audience dev \
  --stage final \
  --approved \
  --send
```
