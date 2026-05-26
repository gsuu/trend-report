#### 11. Agents for financial services

- 날짜: 2026-05-26
- 태그: AI Agents, agents_platform, Claude, 운영도구
- 국가: GLOBAL
- 카테고리: ai
- 직무 태그: 웹DEV
- 출처 유형: release_note
- 출처: Anthropic News
- 출처 URL: https://www.anthropic.com/news/finance-agents
- 이미지: https://www.anthropic.com/api/opengraph-illustration?name=Node-GraphChart&backgroundColor=clay
- 이미지 설명: Anthropic 발표 페이지 대표 이미지
- 요약: Anthropic이 금융 업무 10종을 자동화하는 Claude 에이전트 템플릿과 함께, 멀티 시간 단위 long-running session을 per-tool 권한·관리형 credential vault·전체 audit log로 묶은 Managed Agents 운영 모델을 공개했습니다. 사내 자율 에이전트의 권한·자격증명·감사 로그를 분리해서 점검하는 reference로 활용할 수 있습니다.

##### 요약

- Anthropic이 Pitch builder·Meeting preparer·Earnings reviewer·Model builder·Market researcher 같은 리서치/커버리지 에이전트 5종과 Valuation reviewer·General ledger reconciler·Month-end closer·Statement auditor·KYC screener 같은 운영/회계 에이전트 5종, 총 10개의 금융 에이전트 템플릿을 발표했습니다.
- 이 에이전트들은 Claude Platform 위에서 자율로 도는 Managed Agents 형태로 운영되며, "multi-hour deal close"처럼 멀티 시간 단위로 끊기지 않고 도는 long-running session, per-tool 권한, 관리형 credential vault, 그리고 Claude Console에서 모든 tool call과 의사결정을 검사할 수 있는 audit log를 기본 구성으로 묶었습니다.
- Excel·PowerPoint·Word 애드인이 GA로 풀렸고 Outlook 통합이 예고됐는데, 핵심은 "context carries automatically between applications"로 모델에서 시작한 작업이 다시 설명 없이 덱으로 끝나는 cross-app 컨텍스트 전달입니다.
- 커넥터에는 Dun & Bradstreet, Fiscal AI, Financial Modeling Prep, Guidepoint, IBISWorld, SS&C Intralinks, Third Bridge, Verisk 8종이 추가됐고, Moody's MCP 앱은 6억+ 공·사기업 신용등급과 데이터를 컴플라이언스·신용분석·비즈니스 개발용으로 노출합니다.
- Claude Opus 4.7은 Vals AI Finance Agent 벤치마크에서 64.37%로 업계 1위를 기록했지만, Anthropic은 동시에 "users stay firmly in the loop"를 운영 원칙으로 명시해 클라이언트 전달·파일링·실행 전에 사람 승인이 들어가는 흐름을 강조했습니다.

##### 매거진 인사이트

> 자율 에이전트는 결국 권한·자격증명·감사 로그를 따로 잠그는 운영 모델 위에서만 굴러간다.

이번 발표의 무게중심은 금융 도메인 자체가 아니라, 자율 에이전트를 "어떻게 운영하느냐"에 대한 reference 모델에 있습니다. CTTD 환경에서 당장 10종 에이전트를 그대로 가져다 쓰는 일은 없지만, 사내·클라이언트 프로젝트에 에이전트를 붙일 때 무엇을 따로 잠가야 하는지를 점검하는 기준선으로 읽을 만합니다.

###### 왜 지금 이 업데이트인가

작년부터 풀린 에이전트 SDK·MCP·도구 호출 표준이 "한 번 답하고 끝나는 챗봇"에서 "수 시간 도는 워크플로 러너"로 무게를 옮기는 흐름인데, 여기서 막히는 지점은 모델 성능보다 권한·자격증명·감사 로그 분리입니다. Anthropic은 금융이라는 가장 규제가 빡빡한 도메인에 10개 템플릿을 묶어 내면서, long-running session을 per-tool 권한과 credential vault로 감싸고 Console에서 tool call 단위로 사후 감사할 수 있게 만든 구성을 같이 풀었습니다. 동시에 Vals AI 벤치마크 64.37%, 사람 승인 유지 원칙을 함께 명시하면서 "성능은 올렸지만 사람을 빼지 않는다"를 마케팅 라인으로 잡았다는 점도 같은 맥락에서 봐야 합니다.

###### 구현 관점

웹 퍼블리셔/프론트엔드 입장에서 직접 만져야 할 영역은 아니지만, 사내 에이전트를 붙일 때의 검수 체크리스트로 옮길 수 있는 항목이 분명합니다. 첫째, 도구 권한은 "에이전트가 접근 가능한 도구 전체"가 아니라 도구 단위로 끊겨야 합니다. 같은 에이전트가 자료실 검색은 되지만 결제·파일링·외부 메일은 별도 승인이 필요한 구조여야 한다는 뜻입니다. 둘째, 자격증명은 코드/프롬프트에 박지 않고 별도 vault에서 런타임에 주입되는 형태여야 하고, 폐기·교체 흐름이 vault 쪽 권한 모델에 묶여야 합니다. 셋째, audit log는 단순 응답 로그가 아니라 "어떤 tool을 어떤 입력으로 호출했고 어떤 결정을 내렸는지"가 tool call 단위로 남아야, 사고 시 책임 경로를 역추적할 수 있습니다. Microsoft 365 애드인 쪽에서 끌어올 만한 시사점은 "앱 간 컨텍스트 자동 전달"로, 디자인 도구·문서 도구·이슈 트래커 사이에서 같은 작업 맥락을 다시 설명하지 않게 만드는 워크플로 설계 패턴입니다.

###### 실무에 어떻게 적용할 수 있을까

- 도구 권한 매트릭스: 어떤 에이전트가 어떤 저장소·도구·외부 API에 닿을 수 있는지를 사람·역할 단위가 아니라 에이전트·도구 단위로 정의했는지 점검한다.
- 자격증명 저장 위치: 토큰·API 키가 레포·프롬프트·환경 변수에 박혀 있는지, 아니면 vault 같은 별도 저장소에서 런타임 주입되는 구조인지 확인한다.
- 감사 로그 보존 범위와 기간: tool call·결정 근거를 어디까지 남기고 누가 열람할 수 있는지를 운영 정책으로 명문화한다.
- 사람 승인 단계 배치: 클라이언트 전달 직전·배포 직전·파일 변경 직전 중 어느 지점에 사람 승인을 둘지 워크플로 차원에서 합의해둔다.
- Anthropic이 묶어 보여준 long-running session + per-tool 권한 + credential vault + audit log 4종 세트를 자체 구축·외부 도구 활용 모두의 운영 모델 출발점으로 끌어쓴다.

###### 같이 보면 좋은 기술

- Claude Code Skills/MCP 서버 권한 모델: 도구 단위 접근 제어와 외부 데이터 소스 연결 패턴
- OpenAI Agents SDK·Cursor Background Agents: long-running 에이전트 세션 운영 사례
- Model Context Protocol 명세: tool 권한·인증·로깅을 표준화하는 프로토콜 레퍼런스
