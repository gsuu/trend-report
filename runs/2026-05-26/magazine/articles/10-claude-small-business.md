#### 10. Anthropic이 SMB용 커넥터 7종과 15개 워크플로우·15개 스킬을 한 묶음으로 내놨다

- 날짜: 2026-05-26
- 태그: Claude Cowork, 커넥터, 에이전틱 워크플로우, 권한 전파
- 국가: GLOBAL
- 카테고리: ai
- 직무 태그: 웹DEV
- 출처 유형: release_note
- 출처: Anthropic News
- 출처 URL: https://www.anthropic.com/news/claude-for-small-business
- 이미지: https://www-cdn.anthropic.com/images/4zrzovbb/website/8b8b97e4751b8167a04ce6c7fb7ad8d240c44ccf-1000x1000.svg
- 이미지 설명: Anthropic의 Claude for Small Business 발표 페이지 대표 그래픽
- 요약: Anthropic이 Claude Cowork 위에 PayPal·QuickBooks·HubSpot·Canva·Docusign·Google Workspace·Microsoft 365 커넥터 7종과 재무·운영·세일즈·마케팅·HR·CS 영역의 15개 에이전틱 워크플로우, 그리고 반복 작업용 15개 스킬을 묶은 Claude for Small Business를 공개했습니다. 기존 도구의 사용자 권한이 그대로 Claude로 전파되고, 실행 전 계획을 사람이 승인하거나 end-to-end로 위임하는 두 가지 모드를 제공합니다.

##### 요약

- Anthropic은 Claude Cowork(외부 SaaS를 Claude 에이전트가 직접 호출하는 작업 환경) 위에 SMB가 자주 쓰는 7종 커넥터, 15개의 ready-to-run 에이전틱 워크플로우, 그리고 반복 작업용 15개 스킬을 한 묶음으로 내놨습니다. 결제·회계·CRM·디자인·계약·생산성 도구를 끊지 않고 한 흐름 안에서 실행하는 것이 목표입니다.
- 통합되는 커넥터는 PayPal, Intuit QuickBooks, HubSpot, Canva, Docusign, Google Workspace, Microsoft 365 7종입니다. SMB가 별도 미들웨어 없이 본인이 이미 쓰는 SaaS 권한 그대로 에이전트를 붙일 수 있는 범위로 정해졌습니다.
- 15개 워크플로우는 재무·운영·세일즈·마케팅·HR·고객서비스 6개 영역에 걸쳐 있고, 별도로 묶인 15개 스킬에는 payroll planning, monthly close reconciliation, invoice chasing, margin analysis, tax-season organization, contract review, lead triage, content strategy, business pulse dashboard, campaign management 같은 반복 작업 단위가 포함됩니다.
- 권한 모델은 두 단계입니다. 첫째, QuickBooks·Drive 같은 원본 도구에 부여된 사용자 권한이 Claude 안에서도 그대로 적용됩니다(권한 전파). 둘째, 워크플로우 실행 시 사용자가 계획을 먼저 승인하거나, 준비가 됐을 때 end-to-end 실행을 위임하는 모드를 선택할 수 있습니다.
- 데이터 보호 기본값은 Team·Enterprise Plan에서 사용자 데이터를 학습에 쓰지 않는 것입니다. Anthropic은 미국 SMB 절반이 데이터 보안을 가장 큰 망설임으로 꼽았다는 자체 조사를 근거로 들었습니다.

##### 매거진 인사이트

> AI 에이전트를 사내 운영 시스템에 붙일 때 "어떤 도구를 연결할까"보다 먼저 "기존 도구의 권한이 어떻게 전파되는가"를 본다.

Claude for Small Business는 단순한 커넥터 카탈로그 확장이 아니라, 사람이 매번 결제를 누르거나 인보이스를 보내던 운영 업무 전체를 에이전트가 대신 실행하도록 권한 경계를 다시 설계한 시도입니다. 7종 커넥터와 15개 워크플로우·15개 스킬이 한 패키지로 나온 이유는 SMB가 별도 통합 작업 없이 "내가 이미 쓰는 도구 권한 안에서" 에이전트를 굴리게 만들기 위해서입니다.

###### 왜 지금 이 업데이트인가

Anthropic은 이번 발표를 미국 SMB 시장 데이터(미국 GDP의 44%, 민간 고용의 거의 절반)와 함께 묶었습니다. 즉 OpenAI의 GPT나 Microsoft Copilot이 엔터프라이즈 라이선스 중심으로 움직이는 동안, Anthropic은 본인 권한으로 QuickBooks·HubSpot에 이미 로그인해 있는 1인 운영자·소규모 팀이 직접 에이전트를 실행하게 만드는 진입 지점을 잡고 있습니다. payroll planning, month-end close, invoice chaser처럼 이름이 구체적인 스킬 15개를 동시에 공개한 것은, 범용 챗봇이 아니라 사전 정의된 운영 시나리오로 정착시키겠다는 신호입니다.

###### 구현 관점

핵심은 권한 전파(permission inheritance) 모델입니다. QuickBooks·Drive에 부여된 사용자 권한이 Claude 안에서 그대로 작동한다는 말은, 에이전트가 별도 서비스 계정이나 OAuth 추가 동의 없이 사용자의 자격으로 외부 시스템을 호출한다는 뜻입니다. 사내 자동화 커넥터를 설계할 때 이 모델은 "에이전트가 어떤 권한으로 어떤 리소스를 만질 수 있는가"가 사용자별로 자동 결정되므로 IT 관리자 입장에서는 새 권한 정책을 별도로 정의하지 않아도 된다는 장점이 있지만, 동시에 사용자가 가진 모든 권한이 자동 노출됩니다. 실행 모드도 두 가지로 분기됩니다. plan-first(사람이 계획을 먼저 승인)는 인보이스 발송·계약 검토처럼 되돌리기 어려운 작업에, end-to-end(전체 위임)는 캠페인 분석·대시보드 갱신처럼 읽기 중심 작업에 매핑됩니다.

###### 실무에 어떻게 적용할 수 있을까

- 연결할 외부 도구별로 "사용자 권한 그대로 전파"가 가능한지, 아니면 별도 서비스 계정·스코프 축소가 필요한지를 분기합니다. 도입 평가 단계에서는 "Drive 권한이 약한 인턴 계정으로 워크플로우를 돌리면 접근이 자동으로 좁아지는가"를 실제 시나리오로 검증해야 합니다.
- 워크플로우별로 plan-first 게이트가 필요한 작업(결제·계약·삭제·외부 발송)과 end-to-end 위임이 안전한 작업(요약·집계·분류)을 사전에 표로 정리합니다. "PayPal 결제 자동 실행이 plan-first 게이트를 거치는가"처럼 되돌리기 어려운 작업이 승인 단계를 건너뛰지 않는지 확인합니다.
- Team·Enterprise Plan의 학습 제외 기본값처럼, 사내에 도입할 때도 "학습 사용 여부"가 운영자가 체크박스를 풀지 않아도 기본 차단 상태인지 확인합니다. 외부 SaaS와의 데이터 흐름이 학습 파이프라인으로 새지 않는지 계약서 수준에서도 명시해야 합니다.

###### 같이 보면 좋은 기술

- Anthropic Model Context Protocol(MCP): Claude Cowork의 커넥터 추상화가 같은 프로토콜 위에서 어떻게 외부 시스템과 권한을 교환하는지 확인할 수 있습니다.
- Microsoft 365 Copilot Connectors: 같은 SaaS 7종에 접근하는 경쟁 모델의 권한 위임·승인 흐름과 비교해 사내 도입 기준을 잡을 수 있습니다.
- Google Workspace Gemini Connectors: Drive·Gmail 권한 전파 방식이 Claude와 어떻게 다른지 비교해 도입 시 권한 범위 설계의 기준점을 잡을 수 있습니다.
