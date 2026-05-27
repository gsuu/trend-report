#### 06. 검색엔진은 우리 사이트를 어떻게 발견할까?

- 날짜: 2026-05-21
- 태그: SEO, GEO, robots.txt, AI 크롤러
- 국가: KR
- 카테고리: seo_geo
- 직무 태그: 웹디자인|웹서비스기획|웹DEV
- 출처 유형: guide
- 출처: pxd story
- 출처 URL: https://pxdstory.tistory.com/1899
- 이미지: https://pxdstory.tistory.com/1899
- 이미지 설명: pxd story 본문 다이어그램 — 크롤링·인덱싱·랭킹 3단계 흐름도
- 요약: pxd UX Engineer 시리즈가 검색엔진의 크롤링→인덱싱→랭킹 흐름을 짚으면서, `robots.txt`·`sitemap`·`canonical`·내부 링크·리다이렉트 5개 항목을 실무 체크 포인트로 정리하고, GPTBot 같은 학습용 봇과 OAI-SearchBot 같은 검색노출용 봇을 `robots.txt`에서 분리 제어하는 GEO 관점 예시까지 다뤘습니다.

##### 요약

- pxd UX Engineer 연재 2편은 "크롤링이 안 되면 인덱싱도 불가능하고, 인덱싱이 안 되면 검색 결과에 절대 나타나지 않는다"는 전제를 두고, 크롤링→인덱싱→랭킹 3단계 중 프론트엔드가 직접 손댈 수 있는 크롤링·인덱싱 구간을 5개 체크 항목으로 분해합니다.
- `robots.txt`는 파일 누락, 개발 환경의 `Disallow: /`를 운영에 그대로 배포, `/product/`·`/service/` 같은 핵심 디렉터리 차단이 흔한 실수로 꼽혔고, Next.js에서는 `app/robots.ts`에 `MetadataRoute.Robots`를 반환해 `allow: '/'`와 `disallow: ['/admin/', '/api/', '/private/']`, `sitemap` 경로를 함께 선언하는 코드 예시가 제시됐습니다.
- 사이트맵은 단일 파일당 최대 50,000개 URL 제한이 있고 초과 시 sitemap index로 묶어야 하며, 모든 URL의 `lastmod`를 배포 스크립트가 현재 날짜로 자동 갱신하는 패턴은 크롤러가 실제 변경 페이지를 판단하지 못하게 만든다고 지적합니다.
- 리다이렉트는 Googlebot이 최대 10홉까지 따라가지만 실무에서는 3~5회 이하 유지 권장, 삭제 페이지는 대체가 있으면 301, 없으면 `410 Gone`을 돌려 크롤 예산을 절약하라고 안내합니다.
- `<link rel="canonical">`은 페이지가 하나뿐이어도 자기 자신을 가리키는 self-canonical로 두어 필터·정렬·세션 ID 같은 쿼리 파라미터가 만드는 중복 URL을 흡수하도록 권장합니다.
- 내부 링크는 `<a href>`나 프레임워크의 `Link` 컴포넌트 기반이어야 하고, `<div onClick={() => router.push(...)}>` 식의 JS 이벤트 네비게이션은 크롤러가 따라가지 못한다고 명시했습니다.
- GEO 관점에서는 OpenAI의 GPTBot(학습)과 OAI-SearchBot(검색 노출), Anthropic의 ClaudeBot(학습)과 Claude-SearchBot(검색 노출)을 분리 제어하는 예시가 등장합니다 — `User-agent: GPTBot / Disallow: /` 와 `User-agent: OAI-SearchBot / Allow: /` 를 함께 두는 식입니다.
- 인용 기반 인덱스도 정리됐습니다. ChatGPT의 실시간 검색은 Bing, Gemini는 Google, Perplexity는 자체 크롤러+복수 엔진을 씁니다. ChatGPT 인용을 노린다면 Google Search Console만이 아니라 Bing Webmaster Tools도 같이 봐야 하고, 국내 트래픽은 네이버 서치어드바이저에서 `User-agent: Yeti` 허용 여부를 확인해야 합니다.
- AI 학습 봇(GPTBot·ClaudeBot·PerplexityBot)은 약 5.7억 건 요청을 분석한 결과 JavaScript 실행 흔적이 0건이라, CSR로만 노출되는 콘텐츠는 AI 인용에 잡히지 않습니다. Next.js SSR/SSG로 HTML에 본문을 직접 포함시키는 방식이 권장됩니다.

##### 매거진 인사이트

> SEO 체크리스트가 GEO 체크리스트로 확장됐고, 그 분기점은 `robots.txt` 한 파일에서 시작됩니다.

검색엔진이 우리 사이트를 발견하는 경로는 그대로인데, 인용해 가는 쪽이 Google·네이버뿐 아니라 ChatGPT·Gemini·Perplexity·Claude로 늘었습니다. pxd 연재는 그 변화를 새 SEO 도구를 추가하는 식이 아니라, 기존 5개 항목(`robots.txt`·sitemap·canonical·내부 링크·리다이렉트)을 점검할 때 학습용 봇과 검색노출용 봇을 따로 다룬다는 한 줄을 더해 풀어냅니다.

###### 왜 지금 이 업데이트인가

ChatGPT·Gemini·Perplexity가 실시간 답변에 출처를 붙이기 시작하면서, "내 사이트가 AI 답변에 인용되는가"가 새 KPI로 들어왔습니다. 그런데 학습 데이터에 쓰이는 것과 검색 결과에 인용되는 것은 OpenAI·Anthropic이 봇을 분리해 두면서 다른 결정이 됐고, 이 결정을 표현하는 자리가 결국 `robots.txt` 한 파일입니다. 연재가 SEO/GEO를 한 묶음으로 묶은 이유도 여기에 있습니다 — 새 파일이 늘어난 게 아니라, 기존 파일이 의미하는 범위가 달라졌습니다.

###### 구현 관점

가장 먼저 손볼 곳은 `robots.txt`의 User-agent 블록 구성입니다. GPTBot·ClaudeBot은 학습 차단으로 두되 OAI-SearchBot·Claude-SearchBot은 허용하는 분리 설정이 필요한지, 아니면 전사 정책상 모두 차단할지를 결정해야 합니다. Next.js라면 이 결정이 `app/robots.ts`의 `rules` 배열에 그대로 드러납니다.

sitemap은 50,000개 URL 제한과 `lastmod` 자동 갱신을 먼저 점검합니다. 배포 스크립트가 모든 URL의 `lastmod`를 빌드 시각으로 일괄 갱신하고 있다면, 실제 콘텐츠 수정 시각을 CMS·DB에서 끌어와 채우도록 바꿔야 합니다. 삭제된 상세 페이지가 sitemap에 남아 있거나, 반대로 살아 있는 페이지가 빠져 있는 케이스도 같이 봅니다.

리다이렉트 체인은 운영 중에 점진적으로 길어지는 항목입니다. 도메인 이전, www 통일, HTTPS 강제, 카테고리 URL 개편이 누적되면 3~5홉을 쉽게 넘깁니다. 삭제 페이지에 무조건 메인으로 301을 거는 관행도 다시 봅니다 — 대체가 없는 페이지는 `410 Gone`이 크롤 예산 관점에서 더 정확합니다.

내부 링크는 디자인 시스템 단위에서 검수합니다. 네비게이션·푸터·카드 컴포넌트가 `<a href>`나 `Link`로 렌더되는지, `onClick`으로 라우터를 부르는 자리에 `href`가 함께 붙어 있는지를 컴포넌트 props 단계에서 강제하는 편이 안전합니다. CSR로만 본문이 채워지는 상세 페이지가 있다면, AI 학습 봇의 JS 미실행 특성을 감안해 SSR/SSG 우선으로 옮기는 결정을 빠르게 가져갑니다.

###### 실무에 어떻게 적용할 수 있을까

다음 분기 QA 체크리스트에 다음 5개를 한 줄씩 넣어 두는 것으로 충분합니다.

- `/robots.txt` 200 응답 확인, 핵심 디렉터리 비차단 확인, 학습/검색 봇 분리 정책 명시 여부
- `/sitemap.xml` 50,000개 이하·sitemap index 분할·`lastmod`가 실제 수정 시각인지 점검
- 모든 페이지 self-canonical 적용, 쿼리 파라미터 페이지가 원본 canonical을 가리키는지 점검
- 주요 URL 리다이렉트 체인 3홉 이하, 삭제 상품/콘텐츠는 410 응답 정책 적용
- Google Search Console + Bing Webmaster Tools + 네이버 서치어드바이저 등록, 색인 상태 주간 모니터링

특히 커머스·콘텐츠 사이트는 ChatGPT 인용 노출을 노린다면 Bing Webmaster Tools 등록이 별도 작업으로 들어가야 합니다. Google에만 등록해 둔 채 ChatGPT 인용이 안 잡힌다고 진단하는 사례가 흔합니다.

###### 같이 보면 좋은 기술

- Next.js `app/robots.ts` / `app/sitemap.ts` Metadata API — 정적·동적 사이트 모두에서 코드로 두 파일을 관리할 수 있어 환경별 분기(개발 차단/운영 허용)를 명시적으로 둘 수 있습니다.
- Google Search Console `URL 검사` — 특정 URL이 실제 색인됐는지, 어떤 canonical로 정규화됐는지 즉시 확인하는 가장 빠른 도구입니다.
- Bing Webmaster Tools `Site Explorer` — ChatGPT 인용 노출에 직접 연결되는 인덱스 상태를 보는 자리입니다.

###### 점검 질문

- 우리 `robots.txt`가 GPTBot·ClaudeBot은 차단하면서 OAI-SearchBot·Claude-SearchBot은 허용하도록 분리되어 있는가, 아니면 한 줄짜리 와일드카드로 끝나 있는가?
- 우리 sitemap의 `lastmod`가 빌드 시각으로 일괄 갱신되고 있지는 않은가? CMS의 실제 수정 시각으로 바꿀 수 있는가?
- 카드·네비게이션 컴포넌트의 클릭 동작이 `<a href>` 없이 JS 라우터 호출로만 처리된 곳이 남아 있는가?
- 삭제된 상세 페이지에 일괄 301을 걸고 있는가, 아니면 대체가 없는 경우 410을 돌리고 있는가?
- ChatGPT 인용을 KPI로 본다면, Bing Webmaster Tools와 Google Search Console을 동시에 모니터링하고 있는가?
