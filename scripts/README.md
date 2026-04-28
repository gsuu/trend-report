# Scripts

스크립트는 실행 목적별로만 나눠 관리합니다.

## tracking

주간 원자료 수집과 후보 분류까지만 담당합니다.

- `fetch_tracking_news.mjs`: RSS/스크래핑 기반 원자료 수집. `runs/YYYY-MM-DD/articles.json`, `weekly-digest.md`를 만듭니다.
- `fetch_service_news.mjs`: `news-tracking/service-sources.json` 기준으로 웹서비스기획자와 PM이 볼 SERVICE 후보를 수집해 `runs/YYYY-MM-DD/service-articles.json`과 `service-fetch-report.json`을 만듭니다. 채택과 글쓰기는 AI 편집 단계에서 `docs/service-digest-agent-prompt.md`를 읽고 수행합니다.
- `fetch_design_news.mjs`: `news-tracking/design-sources.json` 기준으로 UIUX 디자이너가 혹할 만한 디자인 레퍼런스와 비개발 실무 기술 후보를 수집해 `runs/YYYY-MM-DD/design-articles.json`과 `design-fetch-report.json`을 만듭니다. 채택과 글쓰기는 AI 편집 단계에서 `docs/design-digest-agent-prompt.md`를 읽고 수행합니다.
- `fetch_dev_news.mjs`: `ai-tf` DEV 생성 로직과 같은 RSS 소스/최근 7일 기준으로 DEV 후보만 수집해 `runs/YYYY-MM-DD/dev-articles.json`과 `dev-fetch-report.json`을 만듭니다. 요약과 발행 판단은 자동 API가 아니라 AI 편집 단계에서 `docs/dev-digest-agent-prompt.md`를 읽고 수행합니다.
- `tracking_utils.mjs`: SERVICE/DESIGN/DEV 수집 스크립트가 공유하는 날짜 계산, HTML 정리, 메타데이터 추출, 이미지 URL 판정, 링크 중복 제거 유틸입니다.
- `collect_materials.mjs`: SERVICE/DESIGN/DEV 수집 자료를 합쳐 대분류, 카테고리, 직무 태그, 출처 유형으로 정리합니다. `tracking-data.json`, `editorial-brief.md`만 만듭니다. 제목 보정, 채택/보류/제외 판단, 매거진 본문 작성은 하지 않습니다.
- `fill_missing_images.py`: 최종 원고 작성 뒤 빈 공식 이미지 URL을 보강할 때만 사용합니다.
- `new_collection.py`: 카테고리별 관찰 포인트, DEV 필수 수집 원칙, 확장 출처 체크리스트입니다. 자동 실행 파일이 아니라 AI 편집 단계에서 읽는 기준 파일입니다.

## notion

Notion 업로드와 업로드 전 검증에만 사용합니다.

- `push_notion.py`: AI가 작성한 최종 `magazine-report.md`를 Notion DB 형식으로 파싱하고 업로드합니다.
- `report_parser.py`: Markdown 리포트를 Notion 업로드용 구조로 파싱하고 검증합니다.
- `export_magazine_json.py`: Markdown 리포트를 Vue 매거진 화면 포맷으로 누적 변환해 `public/data/magazine.json`을 만듭니다. 배포 시 JSON을 같이 올려 첫 로딩을 빠르게 만들 때 사용합니다.
- `cleanup_notion_duplicates.py`: Notion DB 중복 페이지를 정리해야 할 때만 사용합니다.

## newsletter

메일 발송처럼 뉴스레터 운영 단계에서만 사용합니다.

- `send_newsletter.py`: 테스트/최종 뉴스레터 메일을 발송합니다.

## legacy

현재 기본 흐름에서 제외된 이전 수동 생성 스크립트입니다. 바로 삭제하지 않고 보관만 합니다.

- `new_report.py`
- `tracking_to_collection.mjs`
- `fetch_notion.mjs`

## 현재 기본 명령

- SERVICE/DESIGN/DEV 새로 수집하고 편집 브리프 생성: `npm run tracking:prepare`
- SERVICE 후보만 새 기준으로 수집: `npm run fetch:service`
- DESIGN 후보만 새 기준으로 수집: `npm run fetch:design`
- DEV 후보만 새 기준으로 수집: `npm run fetch:dev`
- 기존 카테고리별 수집 결과로 편집 브리프만 재생성: `npm run tracking:brief`
- 최종 원고를 Notion에 업로드: `npm run notion:upload -- runs/YYYY-MM-DD/magazine-report.md`
- Notion 데이터를 정적 JSON으로 내보내기: `npm run magazine:export-json`
