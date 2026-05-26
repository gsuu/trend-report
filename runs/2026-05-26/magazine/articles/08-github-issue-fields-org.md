#### 08. [GitHub] Priority·Effort가 라벨이 아니라 이슈의 속성이 된다

- 날짜: 2026-05-21
- 태그: GitHub, Issue fields, Projects, REST/GraphQL API
- 국가: GLOBAL
- 카테고리: tool
- 직무 태그: 웹DEV, 웹서비스기획
- 출처 유형: release_note
- 출처: GitHub Changelog
- 출처 URL: https://github.blog/changelog/2026-05-21-issue-fields-are-now-in-public-preview-for-all-organizations
- 이미지: https://github.blog/wp-content/uploads/2026/05/595238068-1fdd58a3-7808-4031-9968-4daca3ce6481.jpg
- 이미지 설명: GitHub Changelog 본문 OG 이미지. Organization Settings의 Issue fields 관리 화면.
- 요약: GitHub가 Priority·Effort 같은 메타데이터를 Organization 레벨에서 정의하고 모든 리포지토리의 모든 이슈에 자동으로 꽂아넣는 Issue fields를 public preview로 열었습니다. 라벨이나 프로젝트 필드에 흩어져 있던 우선순위·공수 정보를 이슈 자체의 속성으로 끌어올리는 변화입니다.

##### 요약

- GitHub가 Issue fields를 모든 Organization에 public preview로 열어, Priority·Effort 같은 메타데이터를 Organization 레벨에서 한 번 정의하면 모든 리포지토리의 모든 이슈에 자동으로 붙는 구조로 바꿨습니다.
- 필드 타입은 single select, text, number, date 4종이고, 4개의 기본 필드(Priority, Effort 포함)가 새 Organization에 자동으로 들어옵니다. 관리는 `Settings > Planning > Issue fields`에서 합니다.
- 적용 범위는 github.com과 data residency가 적용된 GitHub Enterprise Cloud의 모든 조직입니다. 3월 프리뷰 이후 1,000개 이상 조직이 도입했고 이번에 모든 조직으로 열렸습니다.
- 프로젝트 뷰에서 필드 값으로 검색·필터하고 컬럼으로 추가하며, 타임라인에서 변경 이력을 추적할 수 있습니다.
- REST·GraphQL API와 webhook 이벤트로 자동화 가능합니다. 봇, GitHub Actions, 통합 도구로 이슈 생성 시점부터 필드 값을 강제할 수 있습니다.
- 이번 회차에서 추가된 개선은 공개 리포지토리 가시성 제어, REST API의 이슈 생성 시 필드 지정 지원, Copilot skill 기반으로 라벨이나 프로젝트 필드 값을 일괄 복사하는 마이그레이션 도구입니다.

##### 매거진 인사이트

> 우선순위와 공수는 라벨이 아니라 이슈의 속성이어야 한다는 GitHub의 답입니다.

이슈 트래커에서 우선순위·공수·담당 영역 같은 정보는 그동안 리포지토리마다 다른 라벨 규칙이나 별도 Projects 필드로 흩어져 있었습니다. Issue fields는 이걸 조직 단위 스키마로 끌어올려, 같은 조직의 모든 리포지토리가 같은 메타데이터를 공유하게 만듭니다.

###### 왜 지금 이 업데이트인가

GitHub가 라벨 운영의 한계를 정식으로 인정한 신호입니다. 라벨은 문자열일 뿐이라 리포지토리마다 표기가 흩어지고, Projects 필드는 보드에 들어간 이슈에만 붙기 때문에 검색·자동화 기준으로 쓰기 어려웠습니다. Issue fields는 single select·text·number·date 4종 타입을 가진 구조화된 속성으로 이걸 대체하고, Organization 레벨에서 정의되기 때문에 새로 만든 리포지토리에도 같은 Priority·Effort가 자동으로 따라붙습니다. 3월 프리뷰부터 1,000개 이상 조직이 이미 운영 중이라는 점에서 실험이 아니라 표준화 단계로 보는 게 맞습니다.

###### 구현 관점

설정 진입점은 `Settings > Planning > Issue fields`로 고정됐고, 기본 4개 필드는 자동 포함됩니다. 자동화는 REST·GraphQL API와 webhook 이벤트로 들어옵니다. 이번에 REST API 이슈 생성 엔드포인트에서도 필드 값을 같이 넣을 수 있게 되면서, 외부 트리거에서 이슈를 만들 때부터 Priority·Effort를 비어 있지 않게 강제할 수 있습니다. Projects 뷰에서는 필드를 컬럼으로 꺼내고 값으로 필터링되며, 변경 이력이 타임라인에 남기 때문에 회고나 감사 추적 기준으로도 사용할 수 있습니다. 마이그레이션은 Copilot skill로 제공되는 일괄 복사 도구가 라벨이나 기존 Projects 필드 값을 새 Issue fields로 옮겨줍니다.

###### 실무에 어떻게 적용할 수 있을까

- 우리 조직의 이슈 메타데이터가 리포지토리마다 다른 라벨로 흩어져 있는지, Projects 보드에 들어가야만 보이는 구조인지를 먼저 점검합니다. 흩어져 있다면 Priority·Effort 같은 공통 속성부터 Organization 필드로 끌어올리는 것이 출발점입니다.
- Organization 레벨 필드를 정의한 뒤에는 GitHub Actions나 이슈 템플릿에서 필수 값으로 강제하는 흐름을 잡습니다. 이슈 생성 시점부터 Priority·Effort가 비어 있지 않게 막아야 메타데이터가 운영 중에 다시 깨지지 않습니다.
- webhook `issues` 이벤트로 Priority가 비어 있는 이슈를 알림 채널에 흘리거나, 특정 Priority 값에서 Slack·Linear 같은 외부 도구로 미러링하는 자동화를 같은 길에서 만듭니다. 필드 값이 트리거 조건이 되면 라벨 문자열보다 훨씬 안정적인 자동화가 됩니다.
- data residency가 적용된 GitHub Enterprise Cloud 조직도 이번에 같이 열렸으므로, 규제 환경 때문에 미뤘던 팀도 도입 검토에 들어갈 수 있습니다. 기존 라벨·Projects 필드 값은 Copilot skill 기반 마이그레이션 도구로 일괄 복사할 수 있습니다.

###### 같이 보면 좋은 기술

- GitHub Projects 필드·뷰: Issue fields와 어떻게 분담되는지
- GitHub Actions 필수 필드 검증 워크플로: 이슈 생성 시점에 Priority·Effort를 강제하는 패턴
- GitHub REST/GraphQL API와 webhook `issues` 이벤트: 외부 트리거에서 이슈 생성·수정과 필드 변경 자동화를 거는 진입점
