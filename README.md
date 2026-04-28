# UIUX/Web Service Weekly Trend Report

국내외 웹서비스, 디자인, 프론트엔드 구현 변화를 매주 수집해 CTTD 매거진과 뉴스레터로 발행하는 프로젝트입니다.

## 목적

클라이언트 회의에서 바로 쓸 수 있는 서비스 변화, 화면/정책/전환 흐름, 디자인 기준, 구현/QA 질문을 정리합니다.

단순 홍보, 할인, 이벤트, 근거 없는 전망은 제외합니다. “이 소식을 우리 서비스에 어떤 실무 질문으로 바꿀 수 있는가”가 채택 기준입니다.

## 빠른 시작

```powershell
npm install
npm run tracking:prepare
```

기존 수집 결과로 편집 브리프만 다시 만들 때:

```powershell
npm run tracking:brief
```

DEV 후보만 수집할 때:

```powershell
npm run fetch:dev
```

DESIGN 후보만 수집할 때:

```powershell
npm run fetch:design
```

## 핵심 문서

- 수집/채택 기준: [데이터 수집 전략](docs/data-collection-strategy.md)
- 글쓰기/문체 기준: [매거진 상세 글쓰기 가이드](docs/editorial-style-guide.md)
- 에이전트 작업 순서: [매거진 에이전트 운영 흐름](docs/magazine-agent-workflow.md)
- DESIGN 전용 작성 기준: [Design Digest Agent Prompt](docs/design-digest-agent-prompt.md)
- DEV 전용 작성 기준: [DEV Digest Agent Prompt](docs/dev-digest-agent-prompt.md)
- 타겟 적합성 분류: [타겟 적합성 분류 에이전트](docs/target-fit-classifier-agent.md)
- 스크립트 역할: [Scripts](scripts/README.md)
- 자동화 작업자 운영 규칙: [AGENTS.md](AGENTS.md)

## 주간 작업 흐름

1. `npm run tracking:prepare`로 일반 후보를 수집하고 `runs/YYYY-MM-DD/editorial-brief.md`를 만듭니다.
2. `npm run fetch:design`로 DESIGN 후보를 수집하고 `runs/YYYY-MM-DD/design-articles.json`을 만듭니다.
3. `npm run fetch:dev`로 DEV 후보를 수집하고 `runs/YYYY-MM-DD/dev-articles.json`을 만듭니다.
4. `docs/data-collection-strategy.md` 기준으로 후보를 채택/보류/제외합니다.
5. `docs/design-digest-agent-prompt.md`와 `docs/dev-digest-agent-prompt.md` 기준으로 DESIGN/DEV 항목을 선별하고 원문을 확인합니다.
6. 최종 원고를 `runs/YYYY-MM-DD/magazine-report.md`로 작성합니다.
7. 필요하면 `npm run magazine:export-json`으로 `public/data/magazine.json`을 갱신합니다.
8. 뉴스레터 발송은 `AGENTS.md`의 Newsletter Approval Flow를 따릅니다.

## 주요 명령

| 작업 | 명령 |
| --- | --- |
| 개발 서버 | `npm run dev` |
| 일반 트렌드 수집 | `npm run fetch:tracking` |
| DESIGN 후보 수집 | `npm run fetch:design` |
| DEV 후보 수집 | `npm run fetch:dev` |
| 수집 자료 준비 | `npm run collect:materials` |
| 새 수집과 브리프 생성 | `npm run tracking:prepare` |
| 기존 자료로 브리프 재생성 | `npm run tracking:brief` |
| Notion 업로드 | `npm run notion:upload` |
| 매거진 JSON 갱신 | `npm run magazine:export-json` |
| 빌드 | `npm run build` |
| 미리보기 서버 | `npm run preview` |

## 발행 승인 규칙

PDF 기반 자료 수집 후 뉴스레터 발송까지 요청받은 경우:

1. 수집 자료로 리포트와 매거진 사이트 데이터를 만듭니다.
2. 사이트/데이터 변경분을 저장소에 푸시합니다.
3. 공개 매거진 URL은 `https://magazine.cttd.co.kr`를 사용합니다.
4. 첫 테스트 메일은 `jisuk@cttd.co.kr`로만 보냅니다.
5. 사용자가 테스트 메일이 괜찮다고 명시적으로 확인할 때까지 기다립니다.
6. 확인 후 최종 메일을 `cxd@cttd.co.kr`로 보냅니다.

테스트 확인 전에는 `cxd@cttd.co.kr`로 직접 발송하지 않습니다.
