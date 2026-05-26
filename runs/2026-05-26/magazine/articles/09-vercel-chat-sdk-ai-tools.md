#### 09. [Vercel] Chat SDK가 AI SDK 도구를 흡수하며 write 액션 기본 승인 게이팅과 3프리셋 최소권한을 묶어 내놨다

- 날짜: 2026-05-20
- 태그: Chat SDK, AI SDK Tools, requireApproval, 권한 프리셋
- 국가: GLOBAL
- 카테고리: ai
- 직무 태그: 웹DEV
- 출처 유형: release_note
- 출처: Vercel Changelog
- 출처 URL: https://vercel.com/changelog/chat-sdk-now-includes-ai-sdk-tools
- 이미지: https://assets.vercel.com/image/upload/contentful/image/e5382hct74si/6SYkHUpvwR1PZFj5laaKBW/b3aafdaf4463f1410dbbf9d80c6a6092/image.png
- 이미지 설명: Vercel Changelog 본문 캡처
- 요약: Vercel이 Chat SDK 안에 AI SDK 도구 어댑터를 새 서브패스로 넣고, write 액션을 기본 승인 게이팅으로 묶었다. reader·messenger·moderator 3개 프리셋이 도구 노출 범위를 정하고, 선택된 프리셋이 허용한 도구만 실제로 만들어진다.

##### 요약

- Vercel Chat SDK(채팅 인터페이스를 붙이는 SDK)에 `chat/ai` 서브패스가 추가되어, `createChatTools(chat, { preset: "messenger" })` 한 줄이면 AI SDK의 `ToolLoopAgent` 같은 에이전트에 read·write 도구를 그대로 꽂을 수 있다.
- write 도구는 `requireApproval` 옵션으로 기본 승인 게이팅이 걸린다. 메시지 전송·수정처럼 외부에 영향이 나가는 호출은 사람이 한 번 통과시켜야 실행되는 모드가 디폴트가 됐다.
- 프리셋은 `reader`, `messenger`, `moderator` 3개로 나뉜다. 프리셋이 허용하지 않는 도구는 아예 만들어지지 않아서, 에이전트가 모르는 사이 권한을 들고 있는 상태를 피한다.
- `toAiMessages` 함수와 관련 타입이 `chat`에서 `chat/ai`로 옮겨졌고, 기존 `chat` 재노출은 `@deprecated`로 표시됐다. import 경로를 새 서브패스로 옮기는 마이그레이션이 필요하다.
- 2026년 5월 20일 자 changelog로 공개됐고, 작성자는 Ben Sabic·Josh Singh이다.

##### 매거진 인사이트

> 챗 인터페이스에 도구를 붙이는 코드 한 줄에 권한 모델이 같이 들어왔다.

LLM 에이전트가 채팅 화면에서 메시지를 읽고 답하던 단계를 넘어, 직접 메시지를 보내고 모더레이션 액션까지 하기 시작하면 권한 설계가 곧 제품 안전성이 된다. Vercel은 그 경계를 SDK 한 레이어 안으로 들고 들어왔다.

###### 왜 지금 이 업데이트인가

채팅에 에이전트를 붙이면 가장 먼저 부딪히는 문제는 "이 봇이 어디까지 자율로 움직일 수 있는가"다. 지금까지는 도구 정의 옆에 직접 if 분기를 둬서 막거나, 프롬프트로 자제시키는 식이었다. `requireApproval`을 기본값으로 둔다는 건, write 호출은 게이팅을 거치는 게 표준 동작이라고 SDK가 선언한 것이다. 동시에 `reader`·`messenger`·`moderator` 3프리셋으로 "이 봇은 읽기만", "응답까지", "신고·차단까지"를 한 단어로 끊을 수 있게 만들어, 권한 결정 지점을 코드 한 줄로 옮겼다.

###### 구현 관점

`createChatTools(chat, { preset: "..." })`는 프리셋이 허용한 도구만 인스턴스로 만든다고 명시돼 있다. 이건 단순 노출 차단이 아니라 lazy 생성 정책이어서, 에이전트가 메모리에 들고 있는 도구 목록 자체가 좁아진다. write 도구는 거기에 더해 `requireApproval`이 걸려서, 호출 시점에 별도 승인 단계로 빠진다. 마이그레이션 측면에서는 `toAiMessages`와 관련 타입의 import를 `chat`에서 `chat/ai`로 옮겨야 한다. 기존 경로는 deprecated 표시만 붙은 단계라 아직 동작하지만, 다음 메이저 전에 정리해두지 않으면 빌드 경고가 누적된다.

###### 실무에 어떻게 적용할 수 있을까

- 챗 인터페이스에 LLM을 붙이는 프로덕트라면, 운영 중인 도구 목록을 reader/messenger/moderator 세 칸에 다시 배치해본다.
- 메시지 조회·요약은 reader, 자동 응답·답신은 messenger, 신고 처리·삭제·차단은 moderator로 끊고, 각 단계에서 사람 승인이 필요한 액션이 무엇인지 정리한다.
- 운영자 화면에 "승인 대기 중인 봇 액션" 큐를 만들어 `requireApproval`이 만들어내는 게이팅 이벤트를 그대로 받아낸다.
- 기존 코드에서 `toAiMessages`를 쓰고 있다면 import 경로를 `chat`에서 `chat/ai`로 옮기는 작업을 같은 PR에 묶어 처리한다.
- 다음 메이저 버전 전에 deprecated 경로를 모두 정리해, 빌드 경고가 누적되지 않도록 한다.

###### 같이 보면 좋은 기술

- AI SDK `ToolLoopAgent`: Chat SDK에서 넘긴 도구가 실제 호출되는 에이전트 루프 쪽 구조를 같이 봐야 권한 설계가 끝까지 이어진다.
- Human-in-the-loop 패턴: `requireApproval`처럼 도구 호출 사이에 사람 승인 단계를 끼우는 일반적인 설계 형태로, 게이팅 큐 UX 설계의 출발점이 된다.
