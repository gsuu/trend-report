#### 16. 검색엔진은 우리 사이트를 어떻게 발견할까?

- 날짜: 2026-05-21
- 태그: SEO, GEO, robots.txt, AI 크롤러
- 국가: KR
- 카테고리: web
- 직무 태그: 웹DEV, 웹기획자, 웹디자인
- 출처 유형: guide
- 출처: pxd story
- 출처 URL: https://pxdstory.tistory.com/1899
- 이미지: https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2F8f8TG%2FdJMcaf0Vsby%2FAAAAAAAAAAAAAAAAAAAAAO2JVdNtIgTScG-SBx4oKsEZFSPPF7eys_EXUe7hM8x9%2Fimg.webp%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1780239599%26allow_ip%3D%26allow_referer%3D%26signature%3DZ41aYTRVjgjnB%252BfI880bHw%252BVTfw%253D
- 이미지 설명: pxd story 본문 다이어그램, 크롤링·인덱싱·랭킹 3단계 흐름과 robots.txt 예시 코드
- 요약: pxd UX Engineer 연재가 크롤링·인덱싱·랭킹 3단계 흐름에 맞춰 robots.txt·sitemap·canonical·내부 링크·리다이렉트 다섯 항목을 다시 짜고, GPTBot 같은 학습용 봇과 OAI-SearchBot 같은 검색 노출용 봇을 robots.txt에서 따로 통제하는 AI 시대 정책을 예시 코드와 함께 제안합니다.

##### 요약

- pxd는 검색 노출 작업을 크롤링·인덱싱·랭킹 3단계로 끊고, 크롤링이 막히면 뒤 단계가 모두 무력해진다는 전제로 robots.txt·sitemap·canonical·내부 링크·리다이렉트 다섯 항목에 대한 실무 체크 포인트를 정리했습니다.
- robots.txt는 파일이 없으면 기본 허용이 되지만 sitemap 위치를 명시할 수 없고, 개발 환경의 `Disallow: /*`를 운영에 올리는 사고가 잦으므로 배포 직후 `https://도메인/robots.txt`에 직접 접속해 응답을 확인하라고 권합니다.
- sitemap은 URL당 50,000개를 넘기면 sitemap index로 쪼개고, `lastmod`는 빌드 날짜가 아닌 실제 콘텐츠 수정일을 넣어야 하며, Next.js에서는 `sitemap.ts`로 게시물 목록을 받아 동적으로 생성하는 코드 예시를 함께 제시합니다.
- 내부 링크는 `<a href>`·`<Link href>`처럼 마크업 단계에서 URL이 드러나야 안정적으로 잡히고, `<div onClick={() => router.push(...)}>` 형태는 AI 크롤러처럼 JavaScript를 실행하지 않는 봇이 따라가지 못한다고 짚습니다.
- canonical은 중복 URL 정리뿐 아니라 자기 자신을 가리키는 self-canonical도 권장하고, 리다이렉트는 HTTP→HTTPS 301과 www 통일을 기본으로 두되 체인 홉은 3~5회 안쪽으로 제한하며, 삭제 페이지는 410이나 대체 경로로 향하는 301로 분리해 응답하라고 정리합니다.
- AI 시대의 핵심은 학습용 봇과 검색 노출용 봇을 분리 통제하는 것이고, GPTBot·ClaudeBot은 막더라도 OAI-SearchBot·Claude-SearchBot은 열어 두는 robots.txt 예시 코드로 정책 분리를 보여 줍니다.
- ChatGPT 인용은 Bing 색인을 따라가고 Gemini는 Google 검색에 직접 의존하며 Perplexity는 자체 크롤러와 복수 엔진을 함께 쓰는 식으로 AI 서비스별 검색 인덱스 출처가 다르므로, Google Search Console·Bing Webmaster Tools·네이버 서치어드바이저를 동시에 등록해 색인 상태를 확인하라고 마무리합니다.

##### 디자인 인사이트

> AI 봇이 학습과 인용을 같이 가져가는 시점에는, robots.txt 한 줄이 브랜드 노출 정책이 된다.

pxd 연재는 검색 최적화(SEO)에 생성형 엔진 최적화(GEO) 관점을 얹은 가이드입니다. 같은 robots.txt 안에서 학습용 봇과 검색 노출용 봇을 따로 다루도록 정리해, SEO 점검 항목이 곧 AI 인용 정책이라는 사실을 한 화면 안에서 보여 줍니다.

###### 왜 참고할 만한가

학습용 봇을 막느냐 마느냐는 그동안 법무·홍보 영역에서 따로 다뤄지던 결정이었는데, 이번 글은 그 결정을 robots.txt 몇 줄의 작성 규칙으로 끌어내려 정리합니다. GPTBot은 막고 OAI-SearchBot은 여는 식의 정책 분리가 가능하다는 점이 예시 코드로 드러나 있어, SEO 점검 회의 자리에서 AI 인용 정책까지 같이 결정할 수 있는 기준이 됩니다. 크롤링·인덱싱·랭킹 3단계 흐름을 SEO 가이드의 머리에 두는 구성도 익숙한 항목들을 새로 묶어 보게 만듭니다.

###### 어디에 적용할 수 있을까

브랜드 사이트·커머스·기획전 페이지처럼 검색 유입과 AI 인용 노출을 함께 챙겨야 하는 화면 전반에 바로 대입할 수 있습니다. 신규 도메인을 띄울 때 점검하는 SEO 체크리스트에 학습 봇·검색 봇 분리 정책 한 줄을 추가하고, 사이트맵 자동 생성 스크립트에 `lastmod`가 빌드 날짜로 채워지지 않는지 확인하는 과정을 끼워 둘 수 있습니다. CMS 운영팀에는 삭제 콘텐츠의 410 응답 규칙과 리다이렉트 체인 한도를 운영 문서에 명문화해 두면 좋습니다.

###### 디자인 관점

내부 링크가 `<a href>`로 잡혀야 한다는 점은 디자인 단계에서 `<div onClick>`으로 만든 의사 링크 컴포넌트를 검수 대상에 올려야 한다는 뜻입니다. 캠페인 페이지의 카드형 CTA를 마크업으로 어떻게 떨어뜨릴지, 모달이나 라우터 푸시에 의존하는 패턴이 검색·AI 봇 노출 화면에 들어가도 괜찮은지 컴포넌트 단계에서 미리 결정해야 합니다. canonical과 리다이렉트 정책은 페이지 IA 문서와 URL 명명 규칙에 함께 적어 두고, 같은 콘텐츠를 다른 경로로 노출하는 룩북·기획전 변형이 self-canonical로 묶이는지 확인합니다.

###### 점검 질문

- 우리 robots.txt는 GPTBot·ClaudeBot 같은 학습용 봇과 OAI-SearchBot·Claude-SearchBot 같은 검색 노출용 봇을 분리해서 통제하고 있는가, 아니면 `User-agent: *` 한 줄로 모두 같은 정책을 받고 있는가?
- 우리 사이트의 sitemap은 URL 50,000개 한도와 sitemap index 분리 기준을 운영 문서에 적어 두었고, `lastmod`가 빌드 날짜가 아닌 실제 콘텐츠 수정일로 채워지는가?
- 캠페인·기획전 페이지의 카드형 CTA는 `<a href>`·`<Link href>`로 떨어지는가, 아니면 `<div onClick>` 같은 JavaScript 의사 링크에 기대고 있어 AI 크롤러가 따라가지 못하는가?
- 삭제 페이지·구버전 URL을 410(Gone)과 대체 경로 301로 나눠 응답하고 있는가, 그리고 현재 리다이렉트 체인이 3~5회 한도 안쪽에 들어오는가?
- ChatGPT(Bing)·Gemini(Google)·Perplexity(자체) 인용 흐름을 모두 챙기기 위해 Google Search Console·Bing Webmaster Tools·네이버 서치어드바이저에 우리 도메인이 모두 등록돼 있는가?
