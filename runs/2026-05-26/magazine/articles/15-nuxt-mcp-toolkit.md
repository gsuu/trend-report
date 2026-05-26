#### 15. [Nuxt] Claude 답변창 안에 우리 Vue 컴포넌트가 그려진다

- 날짜: 2026-05-19
- 태그: Nuxt, MCP, Vue, 인라인 렌더링
- 국가: GLOBAL
- 카테고리: ai
- 직무 태그: 웹DEV
- 출처 유형: release_note
- 출처: Vercel Changelog
- 출처 URL: https://vercel.com/changelog/nuxt-mcp-toolkit-mcp-apps
- 이미지: https://assets.vercel.com/image/upload/contentful/image/e5382hct74si/1vFnL08x8rVHSCyxhGdgty/597b173c421e7b64e85b117f810a565c/nuxt-x-mcp-dark.png
- 이미지 설명: Vercel Changelog 대표 이미지
- 요약: Nuxt MCP Toolkit이 Vue SFC를 빌드 타임에 self-contained HTML로 번들링해 MCP 엔드포인트에서 서빙하도록 바뀌었고, Claude와 ChatGPT 같은 MCP 클라이언트가 그 결과를 텍스트 응답 대신 인터랙티브 UI로 인라인 렌더링한다.

##### 요약

- Nuxt MCP Toolkit(Nuxt 팀이 만든 MCP 서버 빌더)이 2026년 5월 19일 업데이트에서 `defineMcpApp` 매크로와 `useMcpApp` 컴포저블을 추가해, Vue 싱글 파일 컴포넌트를 MCP(Model Context Protocol) 앱으로 묶어 발행할 수 있게 했다.
- `defineMcpApp`에는 `name`, `description`, Zod 기반 `inputSchema`, 그리고 `structuredContent`를 반환하는 비동기 `handler`를 지정한다. 핸들러가 돌려준 데이터가 클라이언트로 pre-hydrate되어 컴포넌트 초기 렌더링에 그대로 들어간다.
- 컴포넌트 안에서는 `useMcpApp`으로 pre-hydrated `data`를 읽고, `callTool()`을 호출해 같은 서버의 다른 툴을 부르거나 후속 프롬프트를 트리거할 수 있다.
- 빌드 단계에서 Vue SFC를 self-contained HTML 파일로 번들링해 MCP 엔드포인트에서 서빙한다. Claude와 ChatGPT처럼 인터랙티브 HTML 응답을 지원하는 MCP 클라이언트는 그 HTML을 대화 안에 인라인 렌더링한다.
- 공식 예제는 도시명을 입력받아 날씨 카드를 인터랙티브하게 그려 보여주는 weather 툴이다. 텍스트로 "맑음, 22도" 같은 답을 돌려주는 대신 카드 UI 자체가 대화창 안에서 렌더링된다.

##### 매거진 인사이트

> MCP 응답이 텍스트에서 컴포넌트로 넘어가는 순간, 디자인 시스템과 접근성의 책임이 챗봇 응답 영역으로 같이 넘어온다.

Nuxt MCP Toolkit의 이번 변화는 단순히 "Vue로 MCP 서버를 만든다"가 아니다. AI 챗 클라이언트의 응답 영역이 텍스트 박스에서 컴포넌트 슬롯으로 바뀌고, 그 안에 우리가 만든 UI가 그대로 들어간다는 뜻이다. 결국 웹 화면을 만들던 사람이 챗 안의 응답 UI도 같이 책임지게 된다.

###### 왜 지금 이 업데이트인가

MCP 자체는 도구 호출과 데이터 전달 규약이라 그동안 응답은 사실상 텍스트나 JSON이었다. Claude와 ChatGPT가 인터랙티브 HTML 응답 렌더링을 받아들이기 시작하면서, 서버 쪽에서도 "이 도구는 이런 컴포넌트로 답한다"를 선언할 수 있는 빌드 도구가 필요해졌다. `defineMcpApp`은 그 선언 지점을 잡아준 매크로다. 핸들러가 돌려준 `structuredContent`가 컴포넌트로 pre-hydrate되는 흐름은 SSR + 하이드레이션을 그대로 MCP 응답에 옮긴 모양이다.

###### 구현 관점

체크할 지점은 세 군데다.

첫째는 번들 격리다. 각 Vue SFC가 self-contained HTML로 묶여 MCP 엔드포인트에서 서빙되기 때문에, 전역 CSS나 디자인 시스템 토큰을 어떻게 끌고 들어갈지 결정해야 한다. 디자인 시스템 패키지의 CSS 변수, 폰트, 아이콘 스프라이트가 번들 안에 들어가야 챗 안에서도 본 사이트와 같은 톤으로 렌더링된다. 반대로 외부 자원 의존이 남아 있으면 클라이언트 환경에서 깨진다.

둘째는 `useMcpApp`의 `callTool()` 동선이다. 컴포넌트 안에서 다른 툴을 부르거나 후속 프롬프트를 트리거할 수 있다는 건, UI에서 발생한 사용자 액션이 다시 LLM 컨텍스트로 흘러간다는 뜻이다. 버튼 하나가 새 프롬프트를 만든다면 그 버튼이 무엇을 하는지, 어떤 입력이 모델로 다시 가는지 사용자에게 보여야 한다.

셋째는 접근성이다. 챗창 안에 들어가는 컴포넌트는 부모 문서의 포커스 흐름·랜드마크·라이브 리전과 충돌할 수 있다. iframe·shadow DOM·인라인 HTML 중 어떤 방식으로 들어가는지에 따라 키보드 트랩, 스크린 리더 읽기 순서, `aria-live` 알림 타이밍이 달라진다. 원문은 접근성 규칙을 따로 언급하지 않으니, 우리가 도입한다면 클라이언트별 렌더링 방식부터 실제로 열어 확인해야 한다.

###### 실무에 어떻게 적용할 수 있을까

- 적용 케이스: 사내 도구를 MCP로 노출할 때 답변을 표·카드·폼으로 보여주고 싶었던 케이스에 바로 들어맞는다. 디자인 검색, 컴포넌트 카탈로그 조회, 운영 대시보드 미니뷰처럼 "텍스트로 풀면 길어지는" 응답을 컴포넌트로 발행할 수 있다.
- 디자인 토큰 주입 방식: 본 사이트 디자인 시스템의 CSS 변수와 폰트가 self-contained 번들에 포함되는지, 빠진 토큰이 fallback으로 무엇이 되는지 확인한다.
- 입력 스키마 가드: `inputSchema`는 Zod로 선언되니 모델이 보낼 수 있는 모든 케이스(빈 값, 한글, 긴 문자열, 잘못된 타입)를 핸들러 진입 전에 막는다.
- `callTool` 트리거의 사용자 가시성: 컴포넌트 안에서 호출되는 후속 툴이 어떤 컨텍스트를 모델에 다시 넘기는지 화면에 명시한다.
- 클라이언트 호환성: Claude와 ChatGPT 외 다른 MCP 클라이언트에서 같은 응답을 받았을 때 텍스트 fallback이 어떻게 보이는지 미리 확인한다.
- 접근성 기준선: 키보드만으로 조작 가능, 스크린 리더가 컴포넌트 진입을 인지, 색상 의존 정보 없음 — 본 사이트 QA 체크리스트를 그대로 가져온다.

###### 같이 보면 좋은 기술

- MCP(Model Context Protocol) 명세: 인터랙티브 HTML 응답이 클라이언트별로 어떻게 렌더링되는지 규약 차원에서 확인.
- Nuxt MCP Toolkit 공식 문서(https://mcp-toolkit.nuxt.dev/apps/overview): `defineMcpApp`·`useMcpApp` API 레퍼런스와 예제.
- Vue SFC `<style>` scoping과 디자인 토큰 번들링: self-contained HTML로 묶일 때 스타일 격리 전략 참고.
