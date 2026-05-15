---
날짜: 2026-05-15
태그: AI UX, 에이전틱 인터페이스, 진행 상태 패턴, 투명성 설계
국가: GLOBAL
카테고리: design/ai_ux_pattern
직무 태그: 웹디자인, 웹서비스기획
출처 유형: guide
출처: Smashing Magazine
출처 URL: https://smashingmagazine.com/2026/05/practical-interface-patterns-ai-transparency/
이미지: https://files.smashing.media/articles/practical-interface-patterns-ai-transparency/1-perplexity-ai.png
이미지 설명: Perplexity AI의 실시간 검색 활동 표시 화면. AI가 현재 어떤 검색어로 무엇을 조회하고 있는지 목록 형태로 나타낸다.
요약: Smashing Magazine이 AI 에이전트 처리 중 스피너가 실패하는 이유와, 상황에 따라 선택할 수 있는 네 가지 투명성 패턴(Living Breadcrumb, Dynamic Checklist, Thinking Toggle, Audit Trail)을 정리한 실무 가이드.
---

## AI 에이전트가 일하는 동안 화면에 무엇을 보여줄 것인가 — Smashing Magazine의 4가지 투명성 패턴 가이드

##### 요약

- 스피너와 프로그레스 바는 파일 다운로드처럼 처리 시간이 균일할 때 만들어진 패턴이다. AI 에이전트가 20초 동안 추론하는 동안 스피너만 띄우면, 사용자는 시스템이 멈춘 건지 실패한 건지 구분하지 못한다.
- 상태 메시지를 'Action Word + Specific Item + Limits/Rules' 구조로 구성하면 AI가 요청을 올바르게 이해했는지, 설정한 범위 안에서 작동하고 있는지를 사용자가 실시간으로 확인할 수 있다. 예시: "Scanning the prices on Lufthansa and United to find anything under $600."
- **Living Breadcrumb** — 앱 테두리나 메뉴 영역에서 맥박처럼 반응하는 인디케이터. "Reading email → Drafting reply → Checking tone" 방식으로 단계가 부드럽게 전환된다. 사용자의 주의를 빼앗지 않으면서 백그라운드 저우선순위 작업(이메일 초안, 파일 정렬)의 진행 상태를 표시하는 데 적합하다.
- **Dynamic Checklist** — 단계별 체크리스트로 현재 상태와 남은 과정을 동시에 보여준다. Devin AI가 실제로 구현한 방식으로, 금융 거래나 여행 예약처럼 처리 시간이 예측 불가능한 고위험 다단계 작업에서 사용자 이탈을 줄인다. 구현에는 백엔드 웹훅 구조와 프론트엔드 상태 관리 시스템이 필요하다.
- **Thinking Toggle** — 진행 상태 메시지를 확장 가능한 컨트롤(chevron 또는 "View Logs" 버튼)로 바꿔, 원시 터미널 로그(`Querying API endpoint /v2/search`, `Filtering results by relevance score > 0.8` 등)를 선택적으로 열어볼 수 있게 한다. 코드 생성이나 시장 조사 같은 전문가 도구에 적합하며, 비즈니스 로직·데이터 구조명·보안 토큰 노출을 막기 위해 로그를 반드시 정제하고 추상화해야 한다.
- **Audit Trail** — 작업이 완료된 결과 화면에서 의사결정 로직을 재검토할 수 있도록 한다. "See how this price was calculated", "View search sources" 같은 링크가 그 역할을 한다. 2025년 4월 ChatGPT가 사용자 동의 없이 메모리를 모든 새 대화에 주입해 출처 추적이 불가능해진 사례처럼, Audit Trail이 없으면 결과에 문제가 생겼을 때 AI 신뢰도가 급락하고 사용자는 수동 재확인으로 돌아간다.
- 원문은 패턴 선택 기준을 리스크와 작업 성격으로 나눈 표로 정리한다. Living Breadcrumb은 저위험 배경 작업, Dynamic Checklist는 가변 시간의 고위험 플로우, Thinking Toggle은 전문가 도구, Audit Trail은 모든 결과의 사후 검토에 대응한다.

##### 디자인 인사이트

> AI 에이전트 화면에서 "처리 중"을 표시하는 방법은 리스크 수준과 작업 복잡도에 따라 달라진다. 스피너 하나로 해결하려 하면 사용자는 결과를 믿지 못하거나, 이미 끝난 작업을 수동으로 검증하기 시작한다.

###### 왜 참고할 만한가

이 가이드는 AI 기능을 실제 화면에 붙이려는 설계자에게 패턴 선택의 판단 근거를 준다. 기존 UX 패턴 문서는 사용자 흐름이나 화면 위계를 다루지만, 에이전틱 경험에서는 "AI가 지금 무엇을 하고 있는가"를 어떤 형식으로 노출할지가 핵심 설계 결정이 된다. 이 글은 그 결정을 리스크와 작업 유형 두 축으로 정리해 선택 기준을 명확히 제시한다.

###### 어디에 적용할 수 있을까

AI 추천 결과가 생성되는 동안의 검색 화면, 주문·결제·예약 처리 진행 중 상태 화면, AI 기반 문서 작성·분석 도구의 처리 로그 노출 방식 전반에 직접 대입할 수 있다. 특히 주문 처리나 금융 거래처럼 중간에 실패 단계가 섞일 수 있는 흐름에서 Dynamic Checklist를 쓰면, 부분 성공 시 어느 단계만 재시도해야 하는지를 사용자가 스스로 확인할 수 있게 된다.

###### 디자인 관점

네 패턴은 화면 위계에서 서로 다른 자리를 차지한다. Living Breadcrumb은 주요 콘텐츠 영역을 방해하지 않는 앱 테두리나 상태바에 위치하고, Dynamic Checklist는 진행 중인 작업과 나란히 메인 화면에 노출된다. Thinking Toggle은 기본 상태에서 접혀 있어 원하는 사용자만 열어보는 구조이며, Audit Trail은 완료 이후 결과 화면에서 접근 가능한 보조 링크 형태다. 어떤 패턴을 쓰든 상태 메시지는 'Action Word + Specific Item + Limits/Rules' 세 요소를 갖춰야 사용자가 AI의 작동 범위를 읽을 수 있다. 상태 표현이 "분석 중...", "처리 중..."으로만 이루어지면 Living Breadcrumb이나 Dynamic Checklist를 쓰더라도 신뢰 신호로서의 역할을 하지 못한다.

###### 점검 질문

- 현재 서비스에서 AI가 처리를 완료하기까지 사용자가 기다리는 구간이 있다면, 그 구간의 상태 메시지가 'Action Word + Specific Item + Limits/Rules' 세 요소를 갖추고 있는가?
- AI 처리 결과가 나온 뒤, 사용자가 "이 결과가 왜 이렇게 나왔는지" 확인할 수 있는 Audit Trail이 화면에 존재하는가?
- 고위험 다단계 처리(결제, 예약, 신청)에서 중간 단계 실패가 발생했을 때, 사용자가 어느 단계에서 무엇이 실패했는지 화면에서 파악할 수 있는가?
- Thinking Toggle처럼 처리 로그를 선택적으로 노출하는 구조를 도입할 경우, 비즈니스 로직이나 내부 데이터 구조가 로그에 그대로 노출되지 않도록 정제 기준이 마련되어 있는가?
