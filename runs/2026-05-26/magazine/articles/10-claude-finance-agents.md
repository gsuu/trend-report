#### 10. Agents for financial services

- 날짜: 2026-05-05
- 태그: Claude, 금융 에이전트, MCP, Microsoft 365
- 국가: GLOBAL
- 카테고리: agents_platform
- 직무 태그: 웹DEV
- 출처 유형: release_note
- 출처: Anthropic
- 출처 URL: https://www.anthropic.com/news/finance-agents
- 이미지: https://www.anthropic.com/_next/image?url=https%3A%2F%2Fwww-cdn.anthropic.com%2Fimages%2F4zrzovbb%2Fwebsite%2Ffinance-agents-og.png&w=3840&q=75
- 이미지 설명: Anthropic 발표 페이지 OG 이미지
- 요약: Anthropic이 금융 실무 10종을 그대로 옮긴 에이전트 템플릿과 Excel·PowerPoint·Word 애드인, Moody's MCP를 포함한 외부 커넥터 묶음을 한 번에 풀었습니다. Managed Agents는 long-running 세션·도구별 권한·credential vault·audit log를 기본으로 제공해, 사내에서 에이전트를 실제 운영 자산으로 다루는 방식을 구체화했습니다.

##### 요약

- Anthropic이 금융 서비스용 에이전트 패키지를 공개하면서 템플릿, Microsoft 365 통합, 데이터 커넥터, Managed Agents 운영 기능을 같은 발표에 묶었습니다.
- 10개 템플릿은 리서치·고객 커버리지(Pitch builder·Meeting preparer·Earnings reviewer·Model builder·Market researcher)와 재무·운영(Valuation reviewer·General ledger reconciler·Month-end closer·Statement auditor·KYC screener)으로 나뉘며, Claude Cowork/Code 플러그인 또는 Managed Agents 쿡북 형태로 GitHub 마켓플레이스에 배포됩니다.
- Excel·PowerPoint·Word 애드인이 GA로 풀렸고 Outlook 지원이 예정되어 있으며, 애드인 사이에서 컨텍스트가 자동으로 이어집니다.
- 새 데이터 커넥터 8종(Dun & Bradstreet, Fiscal AI, Financial Modeling Prep, Guidepoint, IBISWorld, SS&C Intralinks, Third Bridge, Verisk)이 추가됐고, Moody's가 6억+ 기업의 신용·기업 데이터를 제공하는 MCP 앱을 별도로 출시했습니다.
- Claude Opus 4.7이 Vals AI Finance Agent 벤치마크에서 64.37%로 "state-of-the-art on financial tasks"를 기록했습니다.
- Managed Agents는 멀티시간 단위 long-running session, per-tool 권한, 관리형 credential vault, 컴플라이언스용 audit log를 기본 제공해 규제 환경에서 에이전트를 운영하기 위한 발판을 깔았습니다.
- Citadel·FIS·BNY·Carlyle·Mizuho·Travelers·Walleye Capital·Hg 등이 이미 Claude를 업무에 결합해 도입 사례로 공개됐습니다.

##### 매거진 인사이트

> 에이전트가 데모를 넘어 사내 운영 자산이 되려면, 모델 성능보다 권한·자격증명·로그를 어떻게 쪼개 둘지가 먼저 결정된다.

이번 발표의 무게중심은 새 모델이 아니라 그 모델을 둘러싼 운영 표면에 있습니다. 10개 템플릿이 곧바로 실무 직무명을 흉내내고, Microsoft 365 애드인이 GA로 풀리고, 외부 데이터가 MCP·커넥터로 들어오는 구조가 동시에 도착하면서, 에이전트를 "한 번 돌려보는 도구"가 아니라 "장시간 작동하는 사내 동료"로 다루는 모델이 제시됩니다.

###### 왜 지금 이 업데이트인가

금융처럼 규제·감사가 강한 도메인에서 에이전트가 멈추던 지점은 보통 모델 능력이 아니라 권한·자격증명·로그였습니다. Managed Agents가 long-running session, per-tool 권한, credential vault, audit log를 한 묶음으로 내놓은 것은 그 병목을 정면에서 푸는 신호입니다. 동시에 Excel·PowerPoint·Word 애드인 GA와 Moody's MCP, 8개 데이터 커넥터가 함께 떨어지면서, "어디서 일하고 어떤 데이터를 본다"는 질문에도 같은 발표 안에서 답이 나옵니다. 64.37%의 Vals AI Finance Agent 점수는 그 운영 위에 얹히는 부수 결과로 읽히는 구성입니다.

###### 구현 관점

웹 프론트엔드 관점에서 흥미로운 지점은 두 가지입니다. 첫째, Excel·PowerPoint·Word 애드인 사이에서 컨텍스트가 자동으로 넘어간다는 점은, 여러 화면·앱을 오가는 에이전트 UI를 직접 짜야 할 때 "세션 상태를 어디에 두고 어떤 단위로 권한을 끊을지"의 레퍼런스가 됩니다. 둘째, 도구별(per-tool) 권한과 credential vault가 별도 레이어로 잡혀 있다는 것은, 사내 어드민 화면에서 사용자가 보는 권한 모델이 "에이전트 단위"가 아니라 "에이전트 × 도구 × 자격증명" 매트릭스로 바뀐다는 의미입니다. 멀티시간 단위 세션을 다루는 UI는 진행 상태·중단·재개·감사 로그 열람을 일급 기능으로 다뤄야 합니다.

###### 실무에 어떻게 적용할 수 있을까

사내 도입을 검토 중이라면, 10개 템플릿을 그대로 따라가기보다 "이 중 어떤 직무가 우리 워크플로우의 진입점인가"를 한 줄로 정리하는 것이 먼저입니다. 그다음에 그 직무 한 건이 쓰는 도구·데이터 소스·산출물을 per-tool 권한 단위로 쪼개 보면, 우리 환경에서 credential vault와 audit log가 어디까지 분리되어 있는지 자연스럽게 드러납니다. 외부 데이터 활용은 8개 커넥터·Moody's MCP의 라이선스·governed access 조건을 먼저 확인하고, 사내 데이터는 MCP 서버화 범위를 정해야 합니다. Vals AI 점수는 모델 선택 기준이 될 수 있지만, 그 자체로 도입 근거가 되지는 않습니다.

###### 같이 보면 좋은 기술

- Model Context Protocol(MCP) 서버·앱 구조와 권한 모델
- Microsoft 365 add-in의 cross-app context propagation 방식
- 사내 에이전트 운영을 위한 audit log·credential vault 설계 패턴

###### 점검 질문

- 우리 사내 에이전트는 도구·자격증명·로그가 한 덩어리로 묶여 있나, 아니면 per-tool 단위로 분리되어 있나
- 멀티시간 단위로 도는 long-running 작업이 중단·재개·승인을 거칠 때, 사용자에게 보이는 UI가 그 흐름을 정확히 반영하고 있나
- 외부 데이터 커넥터를 늘릴 때, 라이선스·접근 권한·감사 로그가 같은 화면에서 점검 가능한가
