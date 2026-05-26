#### 13. Vercel AI Gateway plugin for WordPress

- 날짜: 2026-05-26
- 태그: Vercel AI Gateway, WordPress 7.0, WordPress AI Client, 멀티 프로바이더
- 국가: GLOBAL
- 카테고리: ai
- 직무 태그: 웹DEV
- 출처 유형: release_note
- 출처: Vercel Changelog
- 출처 URL: https://vercel.com/changelog/vercel-ai-gateway-plugin-for-wordpress
- 이미지: https://assets.vercel.com/image/upload/contentful/image/e5382hct74si/6V5dkbAeHhATBKECw7Hcll/e13a97682e733d33df77b1673512af07/414.png
- 이미지 설명: Vercel Changelog 대표 이미지
- 요약: Vercel이 WordPress 7.0과 함께 공개된 WordPress AI Client에 붙이는 AI Gateway 커넥터 플러그인을 내놓아, 40개 이상 프로바이더와 수백 개 모델을 단일 API 키로 호출하고 프로바이더 장애 시 자동 폴백으로 콘텐츠 자동화 흐름을 유지하도록 했습니다.

##### 요약

- Vercel AI Gateway 플러그인은 WordPress AI Client의 커넥터로 동작하며, 이 클라이언트 위에 만들어진 어떤 AI 플러그인이든 별도 프로바이더 연동 없이 그대로 모델을 호출하게 만듭니다.
- Anthropic·Google·OpenAI·xAI·DeepSeek·MiniMax·Moonshot AI 등 40개 이상 프로바이더와 수백 개 모델을 단일 `AI Gateway` API 키 하나로 접근합니다.
- 설치 후 설정은 `Settings > Connectors`에서 AI Gateway 자격증명만 등록하면 끝나고, 동일 자격증명이 사이트 안의 모든 AI 플러그인에 공유됩니다.
- 같은 프롬프트 빌더에서 텍스트, 구조화된 JSON, 이미지 생성·편집, 비디오까지 멀티모달 출력이 가능하다고 명시했습니다.
- 프로바이더 장애가 발생해도 다른 프로바이더로 자동 폴백되어 AI 기능이 끊기지 않도록 설계됐고, 청구는 통합 빌링·관측 화면에서 보되 단가는 각 프로바이더의 표준 단가를 그대로 따릅니다(`provider prices`).
- 사전 조건은 WordPress 7.0 이상이며, WordPress 7.0은 같은 날 함께 릴리즈됐습니다.

##### 매거진 인사이트

> CMS 안의 AI 기능은 이제 모델을 고르는 일이 아니라, 어떤 게이트웨이를 한 번 꽂아둘지 정하는 일에 가까워졌습니다.

WordPress 7.0이 도입한 AI Client는 플러그인이 직접 OpenAI나 Anthropic SDK를 부르지 않고 사이트 차원의 커넥터를 거치도록 추상화한 계층입니다. Vercel이 이 커넥터 자리에 AI Gateway를 끼워 넣었습니다. 사이트 운영자는 키 하나만 등록하면, 그 사이트에서 돌아가는 모든 AI 플러그인이 동일한 모델 풀과 폴백 정책을 공유하게 됩니다.

###### 왜 지금 이 업데이트인가

WordPress AI Client가 7.0에서 처음 표준화되면서 플러그인마다 프로바이더 키를 따로 받아 저장하던 구조가 깨졌습니다. 운영팀 입장에서 가장 큰 문제는 키 관리가 아니라 한 프로바이더가 다운됐을 때 발행·요약·이미지 생성 같은 콘텐츠 자동화가 한꺼번에 멈춘다는 점이었습니다. AI Gateway 플러그인은 40+ 프로바이더를 하나의 라우팅 레이어 뒤에 두고 장애 시 다른 프로바이더로 넘기는 폴백을 표준 동작으로 가져왔습니다. CMS 안의 AI 호출이 단일 장애점에 묶이지 않게 만드는 첫 공식 커넥터라는 점이 이번 릴리즈의 무게입니다.

###### 구현 관점

플러그인 자체 설정은 `Settings > Connectors` 한 화면에 모이고, 자격증명은 사이트 단위 시크릿으로 저장됩니다. 개별 AI 플러그인은 더 이상 자기 옵션 페이지에서 `OPENAI_API_KEY` 같은 키를 받지 않고, AI Client가 노출하는 모델 호출 인터페이스만 호출하면 됩니다. 출력 타입은 텍스트·구조화 JSON·이미지(생성/편집)·비디오까지 같은 프롬프트 빌더에서 분기하므로, 블록 에디터 쪽 구현은 모달 안에서 어떤 출력 타입을 요청할지 노출하는 UI 결정에 집중하게 됩니다. 폴백은 게이트웨이 측에서 처리되므로 플러그인 코드에는 프로바이더별 retry 로직을 둘 필요가 없고, 빌링과 사용량 관측도 게이트웨이 대시보드 한 곳으로 모입니다(`unified billing and observability`).

###### 실무에 어떻게 적용할 수 있을까

- WordPress 기반 매거진·커머스·브랜드 사이트에서 콘텐츠 발행 자동화·상품 설명 생성·이미지 변환·메타 데이터 보조 작성 같은 AI 기능을 운영 중이라면 7.0으로 올린 뒤 AI Client + AI Gateway 조합을 검토 대상으로 둔다. 도입 이득은 비용 절감이 아니라 키 관리 일원화와 장애 대응 시간 단축이라는 점을 운영팀에 분명히 한다.
- 현재 사이트의 AI 호출이 어떤 플러그인에 흩어져 있는지, 각자 어떤 키를 들고 있는지부터 정리합니다.
- 그 호출들이 AI Client 인터페이스로 옮겨질 수 있는지(플러그인 측 지원 여부)를 확인합니다.
- 게이트웨이 폴백이 우리 운영의 콘텐츠 SLA를 어디까지 보장해주는지를 테스트 시나리오로 잡습니다.

###### 같이 보면 좋은 기술

- WordPress AI Client: 커넥터가 노출해야 할 인터페이스 범위를 확인할 수 있는 7.0 릴리즈 노트의 명세
- Vercel AI Gateway: WordPress 외 환경에서 같은 게이트웨이를 쓸 때 라우팅·관측 화면을 비교할 수 있는 본체 문서
