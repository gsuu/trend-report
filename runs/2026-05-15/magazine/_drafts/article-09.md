---
날짜: 2026-05-06
태그: Claude Code, Claude Platform, Managed Agents, 에이전트 메모리
국가: GLOBAL
카테고리: AI Tools
직무 태그: 웹DEV
출처 유형: news
출처: Anthropic (Code with Claude SF)
출처 URL: https://claude.com/code-with-claude/san-francisco
이미지: https://claude.com/images/code-with-claude-sf-og.jpg
이미지 설명: Code with Claude San Francisco 이벤트 공식 페이지 대표 이미지
요약: 2026년 5월 6일 샌프란시스코에서 열린 Code with Claude 행사에서 Anthropic은 에이전트 메모리, Managed Agents, 컨텍스트 캐싱 등 개발자가 직접 구현하던 에이전트 인프라 레이어를 Claude 플랫폼 안으로 편입하는 방향을 공개했다.
---

### Code with Claude SF — Anthropic이 공개한 에이전트 인프라 이관의 분기점

##### 용어 설명

- Claude Managed Agents: Anthropic이 오케스트레이션, 도구 선택, 상태 관리를 플랫폼 단에서 처리해 주는 에이전트 실행 환경. 개발자가 별도로 반복 실행·복구 로직을 짜지 않아도 프로덕션 수준의 에이전트를 배포할 수 있다.
- CLAUDE.md: Claude Code가 세션 시작 시 자동으로 읽는 마크다운 파일. 코딩 규칙, 브랜치 컨벤션, 아키텍처 결정 등을 저장해 두면 매 대화마다 재설명 없이 프로젝트 맥락이 유지된다.

##### 요약

- 5월 6일 샌프란시스코 행사에서 Anthropic은 세 개 트랙(Research, Claude Platform, Claude Code)으로 세션을 구성했고, 키노트 연사 Boris Cherny(Claude Code 리드), Ami Vora, Dianne Penn이 등단했다.
- "Memory and dreaming for self-learning agents" 세션(Mahesh Murag)에서는 에이전트가 세션 간 학습 결과를 자동으로 저장하는 메모리 구조를 다뤘다. Claude Code의 `auto memory`는 이미 빌드 명령·디버깅 인사이트를 세션 사이에 자동 기록하는 형태로 작동 중이다.
- "Caching, harnesses, and advisors: Building on Claude at GitHub scale" 세션(Mario Rodriguez, Brad Abrams)은 대규모 코드베이스에서의 컨텍스트 캐싱 전략과 어드바이저 패턴을 다뤘다. 컨텍스트 윈도우가 채워질수록 성능이 떨어지는 제약 안에서 캐싱과 하네스로 이를 제어하는 구조다.
- "How to get to production faster with Claude Managed Agents" 세션(Jess Yan, Lance Martin)은 오케스트레이션·도구 선택·에러 복구를 Anthropic 플랫폼이 담당하는 Managed Agents 모델을 소개했다. Asana가 이 구조 위에 AI 팀원 기능을 얹은 사례(Arnab Bose)도 함께 발표됐다.
- "The expanding toolkit" 세션(Lucas Gonzalez, Research 트랙)에서는 Claude 생태계에 추가된 도구 레이어 확장 방향을 다뤘다.
- Claude Code는 현재 터미널, VS Code, JetBrains, 데스크톱 앱, 웹 브라우저에서 동작하며, 서브에이전트 병렬 실행·Routines(스케줄 실행)·Agent SDK(커스텀 에이전트 빌드)가 공개 배포 상태다.
- 검증 기준 없이 실행하면 "그럴 듯하지만 실제로 작동하지 않는 구현"이 나온다는 점을 공식 문서(best practices)에서 가장 중요한 단일 개선 포인트로 명시했다. 테스트·스크린샷·예상 출력값을 미리 제공하면 Claude가 자체 검증 루프를 돌릴 수 있다.

##### 매거진 인사이트

###### 왜 지금 이 발표인가

에이전트 기반 개발이 확산되면서 반복 실행 루프, 도구 선택, 상태 복구, 세션 간 메모리 관리를 직접 구현하는 팀이 늘었다. 이번 행사는 그 레이어들을 Claude 플랫폼이 직접 흡수하겠다는 방향을 공개적으로 선언한 자리다. Managed Agents, auto memory, Routines, Agent SDK가 각각 별개 기능이 아니라 "개발자 코드에서 플랫폼 인프라로"라는 하나의 흐름 위에 놓여 있다.

###### 구현 관점

이미 에이전트 파이프라인을 자체 구현하고 있다면 레이어를 나눠야 할 시점이다. Claude Managed Agents나 Agent SDK로 이관하면 오케스트레이션·복구 로직이 줄어들지만, 도메인별 검증 기준과 컨텍스트 범위는 여전히 직접 설계해야 한다. 컨텍스트 윈도우가 채워질수록 성능이 저하된다는 제약은 플랫폼이 해결하지 않는다. 캐싱 전략, `/clear` 타이밍, 서브에이전트 위임 범위를 팀 내에서 명시적으로 정의해 두지 않으면 코드베이스 규모가 커질수록 같은 문제를 반복하게 된다. CLAUDE.md와 Skills 파일에 팀의 아키텍처 판단을 담아 두는 것도 지속 가능성의 일부다.

###### 실무에 어떻게 적용할 수 있을까

Claude Code를 도입 중이거나 에이전트 파이프라인을 새로 설계하는 팀이라면 지금이 설계 원칙을 정할 시점이다. 어떤 반복 실행·검증 로직을 플랫폼에 맡기고, 어떤 레이어는 직접 제어할 것인지. 검증 기준(테스트 스크립트, 스크린샷 비교, 예상 출력값)을 먼저 정의하지 않은 채 에이전트를 자율 실행으로 돌리면 플랫폼이 무엇을 해결하든 "그럴 듯하지만 작동하지 않는" 결과가 반복될 수 있다. 공식 문서가 단일 가장 중요한 포인트로 꼽은 것이 바로 이 검증 기준의 선제 정의다.
