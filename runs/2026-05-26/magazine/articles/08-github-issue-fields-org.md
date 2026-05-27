#### 08. Issue fields are now in public preview for all organizations

- **날짜**: 2026-05-21
- **태그**: GitHub Issues, Organization 설정, 메타데이터 표준화, 프로젝트 관리
- **국가**: 글로벌
- **카테고리**: DEV
- **직무 태그**: 웹DEV, 웹서비스기획
- **출처 유형**: 공식 changelog
- **출처**: GitHub Changelog
- **출처 URL**: https://github.blog/changelog/2026-05-21-issue-fields-are-now-in-public-preview-for-all-organizations
- **이미지**: https://github.blog/wp-content/uploads/2026/05/issue-fields-og.png
- **이미지 설명**: GitHub Organization Settings의 Issue fields 관리 화면
- **요약**: GitHub가 Organization 레벨에서 정의한 이슈 메타데이터를 모든 리포지토리·모든 이슈에 자동 적용하는 Issue fields를 퍼블릭 프리뷰로 풀었다. 리포마다 흩어져 있던 라벨 관리 방식이 조직 단위 표준으로 옮겨갈 수 있게 됐다.

##### 요약
- Organization Settings > Planning > Issue fields에서 single select, text, number, date 네 가지 타입의 필드를 정의하면, 그 조직의 모든 리포지토리의 모든 이슈에 자동으로 붙는다.
- 조직마다 기본 필드 네 개가 자동으로 제공되고, 관리자는 이슈 타입별로 어떤 필드를 노출할지 따로 설정할 수 있다.
- 검색·필터링은 물론 프로젝트 뷰에서 컬럼으로 추가할 수 있고, REST·GraphQL API와 webhook 이벤트로도 자동화가 가능하다.
- github.com과 data residency가 적용된 GitHub Enterprise Cloud의 모든 조직이 대상이며, 3월 초기 프리뷰 이후 1,000개 이상 조직이 이미 도입했다.

##### 개발 인사이트
이번 변화의 본질은 "필드 정의 위치가 리포에서 Organization으로 올라갔다"는 데에 있다. 그동안 GitHub Issues에서 우선순위·작업량 같은 메타데이터를 표준화하려면 리포지토리마다 라벨을 일일이 만들거나, 프로젝트 보드의 커스텀 필드를 따로 관리해야 했다. 결과적으로 같은 조직 안에서도 리포마다 `priority: high`와 `P0`이 섞이고, 자동화 스크립트는 라벨 문자열 매칭에 의존하다 깨지기 일쑤였다.

조직 레벨 Issue fields는 이 정의 위치를 한 단계 위로 끌어올린다. 한 번 정의하면 모든 리포·모든 이슈에 동일한 스키마가 강제되므로, 사내 이슈 보고 양식이나 분기별 우선순위 집계, 작업량 추정 같은 운영 지표를 조직 단위로 일관되게 다룰 토대가 생긴다. 특히 single select·number·date 타입이 함께 제공된다는 점은 라벨 기반에서는 불가능했던 정량 집계(예: effort 합산, 마감일 범위 필터)를 표준으로 끌어들였다는 의미다.

운영 관점에서 주목할 부분은 두 가지다. 하나는 REST·GraphQL·webhook이 동시에 열렸다는 점으로, 기존 라벨 webhook에 묶여 있던 자동화는 새 필드 이벤트로 마이그레이션 경로를 따져봐야 한다. 다른 하나는 이슈 타입별 노출 필드를 따로 조정할 수 있다는 점인데, 버그·기능 요청·운영 이슈처럼 성격이 다른 이슈에 같은 메타데이터를 강요하지 않고 유연하게 적용할 여지를 남겼다.

##### 점검 질문
- 우리 조직의 이슈 메타데이터(우선순위·작업량·담당팀)는 지금 리포마다 다른 라벨·다른 프로젝트 필드로 흩어져 있지 않은가?
- 조직 레벨 Issue fields로 통일할 경우, 기존 라벨 기반 자동화 스크립트(예: 라벨 webhook 트리거, 라벨 문자열 매칭 봇)는 어디서 끊기고 어떻게 새 필드 API로 옮길 것인가?
- 버그·기능 요청·운영 이슈 등 이슈 타입별로 필요한 필드가 다른데, 어느 필드를 공통으로 두고 어느 필드를 타입별로 한정할지 기준이 있는가?
