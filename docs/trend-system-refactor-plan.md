# 트렌드 수집 시스템 정리 계획

> 이 문서는 과거 리팩토링 계획 기록입니다. 현행 운영 기준으로 사용하지 않습니다. 현재 기준은 [데이터 수집 전략](data-collection-strategy.md), [매거진 상세 글쓰기 가이드](editorial-style-guide.md), [매거진 에이전트 운영 흐름](magazine-agent-workflow.md), [DEV Digest Agent Prompt](dev-digest-agent-prompt.md)를 따릅니다.

## 목표

가이드의 판단 기준과 코드의 실제 동작을 맞춥니다. 수집은 넓게 하되, 매거진에 올라가는 글은 원문에서 확인된 사실과 이미지가 있는 항목만 통과시키는 구조로 정리합니다.

## 현재 문제

1. `scripts/tracking/collect_materials.mjs`가 너무 많은 책임을 갖고 있습니다.
   수집 후보 필터링, 점수 계산, 직무 태그, 제목 번역, 본문 생성, 파일 저장, 이미지 보강, Notion 업로드 실행이 한 파일에 섞여 있습니다.

2. 가이드가 코드에서 재사용되지 않습니다.
   `docs/data-collection-strategy.md`와 `docs/editorial-style-guide.md`에는 좋은 기준이 있지만, 실제 코드는 정규식과 점수 가중치에 기준이 흩어져 있습니다.

3. 자동 본문 생성 문장이 원문보다 앞섭니다.
   `whyNowText`, `perspectiveText`, `lessWorkText`, `insightQuote`가 카테고리별 공통 문장을 만들기 때문에, 무신사 매거진 B 인수 같은 기사도 “사용자의 판단 부담을 줄인다”처럼 틀린 해석으로 흘러갈 수 있습니다.

4. 스크래핑 결과가 제목 중심입니다.
   RSS가 없는 페이지는 앵커 텍스트만으로 후보가 만들어지는 경우가 있어, 고정 소개 페이지나 오래된 페이지가 이번 주 자료처럼 들어올 수 있습니다.

5. Notion 중복 방지 키가 DB 스키마에 없으면 약해집니다.
   `Source Key`, `Report Slug`가 없을 때 제목/브랜드/카테고리 추정으로 업데이트를 시도하므로, 제목이 조금 바뀌면 중복 페이지가 생길 수 있습니다.

6. 생성 파일과 소스 파일의 경계가 흐립니다.
   `news-tracking/articles`, `candidates`, `selected`, `reports`는 실행 산출물인데 현재 작업 트리에 계속 남아 코드 변경과 섞입니다.

## 유지할 기준

- Service / Design / DEV 대분류는 유지합니다.
- 직무 태그는 `웹서비스기획`, `웹디자인`, `웹DEV`만 사용합니다.
- 같은 도메인은 최종 후보 최대 2개까지 유지합니다.
- Flutter, Dart, SwiftUI, Jetpack Compose 같은 앱 네이티브 주제는 제외합니다.
- CSS, HTML, JavaScript, 브라우저 릴리즈, 접근성, 컴포넌트 구현은 DEV로 분류합니다.
- 디자인은 MCP, 백엔드, 저장소 설정보다 디자인 시스템, 컴포넌트 시스템, 실무 프롬프트, Figma 워크플로를 우선합니다.
- 서비스는 국내 소식 우선, 그중 UI/UX 변경, AI 활용, 뷰티 카테고리, 앱 신기능 순으로 봅니다.
- 상품 출시, 캠페인, 앰배서더, 룩북, 오프라인 행사 자체는 온라인 서비스 변화가 없으면 제외합니다.

## 리팩토링 방향

### 1. 수집 설정 분리

대상 파일:

- `news-tracking/sources.json`
- 새 파일 `news-tracking/editorial-rules.json`
- `scripts/tracking/collect_materials.mjs`

정규식 기준을 코드 안에 직접 두지 않고 설정 파일로 옮깁니다.

`editorial-rules.json`에는 아래만 둡니다.

- hard exclude 키워드
- service/design/dev별 include 키워드
- service/design/dev별 penalty 키워드
- 브랜드 우선순위
- 직무 태그 매핑
- 카테고리 라벨 매핑

### 2. 자동 본문 생성 축소

대상 파일:

- `scripts/tracking/collect_materials.mjs`
- `templates/weekly-report.md`

자동 생성은 “초안 골격”까지만 허용합니다.

- 유지: 기본 정보, 원문 요약, 출처 URL, 이미지, 태그, 카테고리
- 축소: 매거진 인사이트 공통 문장
- 추가: `원문 확인 필요` 플래그

원문 내용이 짧거나 스크래핑 설명이 제목뿐이면 `selected`가 아니라 `candidate`로 남깁니다.

### 3. 원문 상세 추출 강화

대상 파일:

- `scripts/tracking/fetch_tracking_news.mjs`

RSS 없는 스크래핑 결과는 상세 페이지의 `og:title`, `og:description`, `og:image`, `<article>` 본문 일부를 함께 저장합니다. 상세 설명이 없거나 날짜가 불명확한 페이지는 업로드 후보에서 제외합니다.

### 4. 선정 결과 검수 파일 추가

대상 파일:

- 새 파일 `news-tracking/review/YYYY-MM-DD.md`
- `scripts/tracking/collect_materials.mjs`

1차 후보는 20~30개 사이로 만들고, 아래를 같이 출력합니다.

- 업로드 후보
- 보류 후보
- 제외 후보
- 제외 사유
- 이미지 누락 항목
- 원문 설명 부족 항목

이 파일이 있어야 “왜 이게 들어왔는지”를 사람이 바로 확인할 수 있습니다.

### 5. Notion 스키마 명시

대상 파일:

- `docs/notion-schema.md`
- `scripts/notion/push_notion.py`
- `scripts/notion/cleanup_notion_duplicates.py`

Notion DB 필수 속성을 문서화합니다.

- `제목`: title
- `브랜드명`: rich_text
- `대카테고리`: select
- `소카테고리`: select
- `태그`: multi_select
- `목록 요약`: rich_text
- `출처 URL`: url 또는 rich_text
- `이미지`: files 또는 url
- `Source Key`: rich_text
- `Report Slug`: rich_text

`Source Key`, `Report Slug`가 없으면 업로드 전에 경고를 내고, 중복 정리는 완전 동일 항목만 처리합니다.

### 6. 생성 산출물 정리

대상 파일:

- `.gitignore`
- `news-tracking/README.md`

원칙을 정합니다.

- 커밋 대상: `sources.json`, 규칙 파일, README
- 커밋 제외 후보: `articles/*.json`, `candidates/*.json`, `selected/*.json`, `reports/*-tracking-upload-report.md`
- 단, 특정 주차 리포트를 보존해야 하면 별도 `reports/final/`로 옮깁니다.

## 바로 제거하거나 축소할 부분

- `collect_materials.mjs`의 범용 인사이트 문장 생성 함수는 축소 대상입니다.
  - `insightQuote`
  - `whyNowText`
  - `perspectiveText`
  - `lessWorkText`
  - `beforeState`
  - `afterState`

- 디자인 수집 키워드에서 아래는 기본 제외합니다.
  - MCP
  - Dev Mode
  - Code Connect
  - repository
  - backend
  - server
  - API/SDK 중심 글

- 서비스 수집에서 아래는 기본 제외합니다.
  - 상품 출시
  - 앰배서더
  - 캠페인
  - 룩북
  - 오프라인 매장 오픈
  - 회사 소개/뉴스룸 소개 고정 페이지

## 실행 순서

1. `news-tracking/editorial-rules.json`을 만들고 현재 코드의 기준을 옮깁니다.
2. `collect_materials.mjs`를 수집 후보 선정 전용으로 줄입니다.
3. 매거진 본문 생성은 자동 스크립트가 하지 않고, AI가 `new_collection.py`와 docs 기준을 읽은 뒤 최종 `magazine-report.md`를 작성합니다.
4. `fetch_tracking_news.mjs`의 상세 페이지 meta 추출을 기본 경로로 둡니다.
5. `push_notion.py`는 스키마 검사를 먼저 하고, 필수 중복 방지 필드가 없으면 업로드를 멈추거나 dry-run만 허용합니다.
6. `cleanup_notion_duplicates.py`는 Source Key가 있을 때는 Source Key 기준, 없을 때는 완전 동일 제목/브랜드/대카테고리/소카테고리/출처 URL 기준으로만 archive합니다.
7. `npm run fetch:tracking`, `npm run tracking:brief`로 수집/분류 브리프를 확인합니다.
8. Windows에서 한글 깨짐이 없는지 `Get-Content -Encoding utf8`로 `editorial-brief.md`와 `tracking-data.json`을 확인합니다.

## 완료 기준

- Flutter 관련 항목이 후보와 리포트에 나오지 않습니다.
- 무신사 뉴스룸 소개, 상품 출시, 앰배서더, 캠페인성 기사가 업로드 후보에 나오지 않습니다.
- 영어 원문은 제목과 요약이 한국어로 자연스럽게 패치되지만, 원문에 없는 해석을 붙이지 않습니다.
- 이미지가 없으면 업로드 전에 누락 항목으로 표시됩니다.
- Notion 중복 정리는 현재 리포트에 없는 기존 데이터를 지우지 않습니다.
- 최종 selected JSON만 봐도 왜 후보가 되었는지 확인할 수 있습니다.
