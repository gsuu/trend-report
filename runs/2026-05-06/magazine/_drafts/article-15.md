### 15. WhatsApp·Miro·Atlassian 디자인 팀이 AI와 함께 출시하는 법 — 디자인 시스템을 'AI 가드레일'로

- 날짜: 2026-04-15
- 태그: 디자인 시스템, AI 에이전트, Claude Code, 디자인 토큰
- 국가: GLOBAL
- 카테고리: design_dev_reference
- 직무 태그: `웹디자인` `웹DEV`
- 출처 유형: blog_opinion
- 출처: Into Design Systems (Sil Bormüller)
- 출처 URL: https://www.intodesignsystems.com/blog/design-teams-shipping-with-ai-2026
- 이미지: https://www.intodesignsystems.com/og-image-design-teams-ai-2026.jpg
- 이미지 설명: Into Design Systems 블로그 og:image — AI Design Systems Conference 2026 발표 묶음 커버
- 요약: WhatsApp·Miro·Atlassian 디자인 팀이 AI Design Systems Conference 2026에서 공유한 'AI와 함께 출시하는 법'을 정리한 후기 글이다. 핵심은 디자인 시스템이 AI의 가드레일 역할을 할 때만 결과가 예측 가능해진다는 것.

##### 요약

- WhatsApp Web 디자인 시스템을 이끄는 Sebastian Rousseau는 디자이너 1명·엔지니어 1명 구성으로 일하면서, Claude Code와 VS Code로 직접 프로덕션 코드를 커밋한다. 발표는 이 흐름을 'no Figma-to-engineer relay race'로 표현했다 — Figma에서 엔지니어로 넘기는 릴레이 단계 자체를 없앴다는 뜻.
- Brad Frost와 동료들은 디자인 시스템과 AI의 관계를 한 문장으로 정리했다. "AI without a design system is unpredictable. AI with tokens, components, patterns and conventions becomes dependable." 디자인 시스템이 없으면 AI 결과는 예측 불가능하지만, 토큰·컴포넌트·패턴·규약이 갖춰지면 그제야 신뢰할 수 있는 도구가 된다는 진단이다.
- 여러 발표자가 같은 진단을 반복했다. 디자인 시스템 문서를 AI 에이전트가 읽을 수 있는 'API'로 만들어 두지 않으면 "the agent invents a button, and you end up cleaning up drift for the rest of the quarter" — 에이전트가 버튼을 임의로 만들어 내고, 그 분기 내내 시스템 드리프트를 청소하게 된다.
- Diana Wolosin은 'designing for MCP and LLMs'을, Laura Fehre는 문서가 'Markdown에서 에이전트가 실행할 수 있는 스크립트'로 옮겨가는 흐름을 짚었다. 결국 디자인 시스템 문서의 형식 자체가 사람용 가이드에서 기계가 호출하는 인터페이스로 바뀌고 있다는 관찰이다.
- 글은 Into Design Systems의 Sil Bormüller가 AI Design Systems Conference 2026 발표 묶음을 정리한 후기 형식이며, Claude Code·VS Code·Cursor·Figma MCP가 디자이너-엔지니어 핸드오프 단계를 줄이는 도구로 함께 언급된다.

##### 디자인 인사이트

> 디자인 시스템 문서를 'AI 에이전트가 호출하는 API'로 만들지 않으면, 분기마다 에이전트가 만들어 낸 임의 컴포넌트를 청소하게 된다.

###### 왜 참고할 만한가

지난 1년 동안 디자인 시스템 글의 결론은 대부분 '토큰을 잘 정리하라'였다. 이번 발표 묶음의 결론은 한 칸 더 나갔다. 토큰이 정리되어 있어도, 그 정의를 AI 에이전트가 어떻게 읽는지까지 설계되어 있지 않으면 Claude Code나 Cursor 같은 도구가 화면을 만들 때마다 변형 버튼·변형 카드·변형 모달을 새로 찍어 낸다. 사람이 만든 시스템 드리프트는 분기 회고에서 잡을 수 있지만, 에이전트가 만든 드리프트는 PR 단위로 들어와서 잡기 전에 머지된다. WhatsApp Web처럼 디자이너와 엔지니어가 1+1로 일하면서 핸드오프를 없앤 팀일수록, 시스템 문서의 정확도가 곧 결과물의 정확도가 된다.

###### 어디에 적용할 수 있을까

사내 디자인 시스템 문서를 두 갈래로 나눠 본다. 하나는 디자이너가 읽는 페이지(컴포넌트 사용 예시·여백 규칙·접근성 메모)이고, 다른 하나는 AI 에이전트가 읽는 기계 가독 문서(컴포넌트 props 스키마, 토큰 alias 표, 'Do/Don't' 규칙을 JSON·YAML·TypeScript 타입으로 표현한 것)이다. 후자가 비어 있으면 Claude Code에 'Figma 시안을 코드로 옮겨 줘'라고 했을 때 에이전트는 결국 본인이 학습한 일반적인 Tailwind 컴포넌트를 만든다. PDP·체크아웃·검색 결과처럼 변형 폭주가 잘 일어나는 영역부터 컴포넌트 props 스키마와 허용 토큰 목록을 우선 노출해 본다.

###### 디자인 관점

가드레일을 어디에 거느냐가 핵심이다. 결과물 검토 단계(코드 리뷰·디자인 QA)에서 잡으면 이미 만들어진 변형을 되돌려야 하므로 비용이 크다. 생성 단계(에이전트가 컴포넌트를 고르는 그 순간)에서 잡으려면 시스템이 '쓸 수 있는 컴포넌트 목록'과 '각 컴포넌트가 받을 수 있는 토큰 범위'를 기계가 즉시 조회할 수 있어야 한다. 이때 점검할 단위는 컴포넌트 카탈로그의 완결성, 토큰 alias의 1:1 매핑(`color/brand/primary`가 두 개 이상으로 풀리지 않는지), 그리고 'AI가 임의로 만들 수 없는 영역'을 명시한 부정 규칙이다. 부정 규칙이 없으면 에이전트는 항상 새로 만든다.

###### 점검 질문

- 우리 디자인 시스템 문서 중 AI 에이전트(Claude Code·Cursor 등)가 직접 읽고 호출할 수 있는 형식(JSON·YAML·타입 정의)으로 노출된 부분은 어디까지인가, 그리고 어디부터가 사람만 읽을 수 있는 Markdown인가.
- '에이전트가 새 버튼을 만들어 내는' 사고가 한 번 일어났을 때, 회수하는 데 걸린 시간을 PR·디자인 QA 회고에 기록한 적이 있는가. 없다면 이번 분기 어떤 화면(PDP·체크아웃·운영 어드민)부터 측정을 시작하나.
- WhatsApp Web의 1+1(디자이너+엔지니어) 구성처럼 핸드오프 자체를 없애려면, 우리 팀에서 가장 먼저 사라져도 되는 중간 산출물(중간 시안·핸드오프 문서·작업 티켓)은 무엇인가.

