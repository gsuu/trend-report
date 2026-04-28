# Docs Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** README와 `docs/`의 중복된 운영 기준을 정리해, 주간 트렌드 리포트 작업자가 가장 짧은 경로로 수집, 작성, 발행 규칙을 찾게 만든다.

**Architecture:** README는 진입점과 실행 명령만 남기고, 판단 기준은 `docs/data-collection-strategy.md`, 작성 기준은 `docs/editorial-style-guide.md`, 작업 순서는 `docs/magazine-agent-workflow.md`에 둔다. DEV 전용 기준은 `docs/dev-digest-agent-prompt.md`와 AGENTS의 DEV 운영 규칙을 기준으로 유지하되, 다른 문서에서는 링크로만 참조한다.

**Tech Stack:** Markdown, PowerShell, Node.js npm scripts, Git.

---

## 내 의견

이 리팩토링은 파일을 많이 늘리는 방향이 아니라, “한 기준은 한 문서에만 존재한다”는 원칙으로 가야 한다. 지금은 문서가 부족한 게 아니라 같은 규칙이 README, AGENTS, 수집 전략, 글쓰기 가이드, 워크플로에 흩어져 있어서 작업자가 어느 문장을 최신 기준으로 믿어야 하는지 헷갈리는 상태다.

## 현재 파일 책임

- `README.md`: 프로젝트 소개, 빠른 시작, 실행 명령, 주요 문서 링크만 담당한다.
- `AGENTS.md`: 자동화 작업자가 반드시 지켜야 하는 운영 금지선과 발행 승인 흐름만 담당한다.
- `docs/data-collection-strategy.md`: 어떤 소스를 수집하고 어떤 후보를 채택할지 판단하는 기준만 담당한다.
- `docs/editorial-style-guide.md`: 선택된 후보를 어떤 구조와 문체로 매거진 글로 쓸지 담당한다.
- `docs/magazine-agent-workflow.md`: 수집부터 뉴스레터 프리뷰까지 작업 순서와 산출물 흐름만 담당한다.
- `docs/dev-digest-agent-prompt.md`: DEV 후보 선별, 원문 확인, 요약 레이어 작성 기준만 담당한다.
- `docs/target-fit-classifier-agent.md`: 후보가 독자 타겟에 맞는지 분류하는 입력/출력 규칙만 담당한다.
- `docs/trend-system-refactor-plan.md`: 과거 시스템 정리 계획이므로 현행 운영 문서와 분리된 기록 문서로 유지한다.

## 변경 원칙

- 기준 문장은 한 곳에만 둔다.
- README에는 긴 기준 설명을 두지 않는다.
- AGENTS의 승인 흐름과 DEV Source Standard는 그대로 보존한다.
- 코드, 스크립트, 데이터 스키마는 건드리지 않는다.
- 단순 문서 정리이므로 빌드와 테스트는 실행하지 않는다.
- Windows 한글 깨짐 여부는 마지막에 직접 확인한다.

### Task 1: README를 얇은 진입점으로 정리

**Files:**
- Modify: `README.md`
- Read: `docs/data-collection-strategy.md`
- Read: `docs/editorial-style-guide.md`
- Read: `docs/magazine-agent-workflow.md`

- [ ] **Step 1: README에서 중복 기준 구간 식별**

Run:

```powershell
Select-String -LiteralPath README.md -Pattern '^## ' -Encoding UTF8 | Select-Object LineNumber,Line
```

Expected: `목적`, `운영 원칙`, `데이터 품질 기준`, `목표 수집 수준`, `채택선`, `DEV 아티클 작성 구조`, `주간 작업 흐름`, `뉴스레터 발송하기` 같은 긴 운영 기준 섹션을 확인한다.

- [ ] **Step 2: README 목차를 아래 구조로 축소**

Replace README heading structure with:

```markdown
# UIUX/Web Service Weekly Trend Report

## 목적

## 빠른 시작

## 핵심 문서

## 주간 작업 흐름

## 주요 명령

## 발행 승인 규칙
```

Expected: README가 프로젝트 진입점 역할만 한다.

- [ ] **Step 3: README의 기준 설명은 링크로 대체**

Use these links in `## 핵심 문서`:

```markdown
- 수집/채택 기준: [데이터 수집 전략](docs/data-collection-strategy.md)
- 글쓰기/문체 기준: [매거진 상세 글쓰기 가이드](docs/editorial-style-guide.md)
- 에이전트 작업 순서: [매거진 에이전트 운영 흐름](docs/magazine-agent-workflow.md)
- DEV 전용 작성 기준: [DEV Digest Agent Prompt](docs/dev-digest-agent-prompt.md)
- 타겟 적합성 분류: [타겟 적합성 분류 에이전트](docs/target-fit-classifier-agent.md)
```

Expected: README 안에 같은 기준이 다시 서술되지 않는다.

- [ ] **Step 4: README 주요 명령은 package.json 기준으로만 작성**

Use these commands exactly:

```markdown
| 작업 | 명령 |
| --- | --- |
| 개발 서버 | `npm run dev` |
| 일반 트렌드 수집 | `npm run fetch:tracking` |
| DEV 후보 수집 | `npm run fetch:dev` |
| 수집 자료 준비 | `npm run collect:materials` |
| 기존 자료로 브리프 재생성 | `npm run tracking:brief` |
| Notion 업로드 | `npm run notion:upload` |
| 매거진 JSON 갱신 | `npm run magazine:export-json` |
| 빌드 | `npm run build` |
```

Expected: README 명령이 `package.json`과 어긋나지 않는다.

- [ ] **Step 5: README 변경만 커밋**

Run:

```powershell
git diff -- README.md
git add README.md
git commit -m "docs: README 진입점 정리" -m "중복된 수집·작성 기준은 docs 문서 링크로 대체하고, package.json 기준의 주요 명령만 남긴다."
```

Expected: README 리팩토링만 포함된 커밋이 생성된다.

### Task 2: 수집 기준 문서의 책임을 수집/채택으로 제한

**Files:**
- Modify: `docs/data-collection-strategy.md`
- Read: `README.md`
- Read: `docs/editorial-style-guide.md`
- Read: `AGENTS.md`

- [ ] **Step 1: 수집 전략 문서의 현재 제목 구조 확인**

Run:

```powershell
Select-String -LiteralPath docs\data-collection-strategy.md -Pattern '^#' -Encoding UTF8 | Select-Object LineNumber,Line
```

Expected: 수집 채널, 채택 점수, 균형 수집 기준, 출처 대조 규칙, 발행 구조가 한 문서에 섞여 있음을 확인한다.

- [ ] **Step 2: 문서 상단에 책임 선언 추가**

Insert after title:

```markdown
이 문서는 후보를 어디서 찾고, 어떤 기준으로 채택하거나 제외할지 정한다. 글의 문체, 상세페이지 구성, 뉴스레터 발송 순서는 각각 `editorial-style-guide.md`, `magazine-agent-workflow.md`, `AGENTS.md`를 기준으로 한다.
```

Expected: 문서의 사용 범위가 명확해진다.

- [ ] **Step 3: 작성법·발행 흐름 문장은 링크로 축소**

Replace long writing or publishing guidance with:

```markdown
작성 구조와 문체는 [매거진 상세 글쓰기 가이드](editorial-style-guide.md)를 따른다.
작업 순서와 산출물 흐름은 [매거진 에이전트 운영 흐름](magazine-agent-workflow.md)을 따른다.
뉴스레터 승인과 발송 순서는 [AGENTS.md](../AGENTS.md)의 Newsletter Approval Flow를 따른다.
```

Expected: 수집 전략 문서에는 수집과 채택 판단만 남는다.

- [ ] **Step 4: DEV 수집 기준은 AGENTS와 dev prompt를 참조**

Keep only this DEV cross-reference:

```markdown
DEV 후보는 `news-tracking/dev-sources.json`과 `npm run fetch:dev`로 수집한다. 선별과 작성은 [DEV Digest Agent Prompt](dev-digest-agent-prompt.md)를 적용하며, 운영상 금지선은 [AGENTS.md](../AGENTS.md)의 DEV Digest Source Standard를 따른다.
```

Expected: DEV 기준이 여러 문서에서 서로 다르게 설명되지 않는다.

- [ ] **Step 5: 수집 기준 변경만 커밋**

Run:

```powershell
git diff -- docs/data-collection-strategy.md
git add docs/data-collection-strategy.md
git commit -m "docs: 수집 기준 책임 정리" -m "수집 전략 문서에서 작성법과 발행 흐름을 링크로 축소하고, 후보 채택 판단 기준만 남긴다."
```

Expected: 수집 전략 문서만 포함된 커밋이 생성된다.

### Task 3: 글쓰기 가이드를 작성 규칙 전용 문서로 정리

**Files:**
- Modify: `docs/editorial-style-guide.md`
- Read: `docs/dev-digest-agent-prompt.md`
- Read: `docs/data-collection-strategy.md`

- [ ] **Step 1: 글쓰기 가이드 제목 구조 확인**

Run:

```powershell
Select-String -LiteralPath docs\editorial-style-guide.md -Pattern '^#' -Encoding UTF8 | Select-Object LineNumber,Line
```

Expected: 카테고리별 수집 기준, 아티클 구조, 문체 규칙, 예시가 함께 있음을 확인한다.

- [ ] **Step 2: 수집 기준 섹션을 링크로 축소**

Replace `## 카테고리별 수집 기준` content with:

```markdown
후보 수집과 채택 기준은 [데이터 수집 전략](data-collection-strategy.md)을 따른다. 이 문서는 이미 채택된 후보를 매거진 글로 바꾸는 작성 기준만 다룬다.
```

Expected: 작성 가이드가 수집 판단을 다시 정의하지 않는다.

- [ ] **Step 3: DEV 구조는 prompt와 충돌하지 않게 정리**

Keep DEV article structure as:

```markdown
DEV 글은 [DEV Digest Agent Prompt](dev-digest-agent-prompt.md)의 출력 형식을 우선한다. 이 가이드는 문체, 독자 관점, 중복 문장 방지 기준만 보완한다.
```

Expected: DEV 작성 기준의 우선순위가 명확하다.

- [ ] **Step 4: Markdown 예시는 한 개씩만 유지**

Keep one UIUX example and one DEV example. Remove repeated explanatory paragraphs that restate the same rule already listed in `Service/Design 아티클 구조` or `DEV 아티클 구조`.

Expected: 예시는 규칙을 보완하지만 규칙을 다시 만들지 않는다.

- [ ] **Step 5: 글쓰기 가이드 변경만 커밋**

Run:

```powershell
git diff -- docs/editorial-style-guide.md
git add docs/editorial-style-guide.md
git commit -m "docs: 글쓰기 가이드 책임 정리" -m "수집 판단은 데이터 수집 전략으로 보내고, 글쓰기 가이드는 구조·문체·예시 중심으로 축소한다."
```

Expected: 글쓰기 가이드만 포함된 커밋이 생성된다.

### Task 4: 워크플로 문서를 산출물 순서 중심으로 정리

**Files:**
- Modify: `docs/magazine-agent-workflow.md`
- Read: `AGENTS.md`
- Read: `package.json`

- [ ] **Step 1: 워크플로 제목 구조 확인**

Run:

```powershell
Select-String -LiteralPath docs\magazine-agent-workflow.md -Pattern '^#' -Encoding UTF8 | Select-Object LineNumber,Line
```

Expected: 수집, 검증, 분류, 작성, 리뷰, 이미지, Notion, 뉴스레터 단계가 확인된다.

- [ ] **Step 2: 각 단계에 입력/출력만 남기는 형식으로 통일**

Use this pattern for each agent section:

```markdown
## 1. 수집 에이전트

입력:
- `news-tracking/sources.json`
- `news-tracking/dev-sources.json`

실행:
- `npm run fetch:tracking`
- `npm run fetch:dev`

출력:
- `runs/YYYY-MM-DD/tracking-data.json`
- `runs/YYYY-MM-DD/articles.json`

판단 기준:
- [데이터 수집 전략](data-collection-strategy.md)
- [DEV Digest Agent Prompt](dev-digest-agent-prompt.md)
```

Expected: 워크플로는 “무엇을 보고 무엇을 만든다”만 설명한다.

- [ ] **Step 3: 뉴스레터 발송 단계에 승인 흐름 링크 추가**

Add:

```markdown
뉴스레터 발송은 [AGENTS.md](../AGENTS.md)의 Newsletter Approval Flow를 따른다. 테스트 메일 확인 전에는 `cxd@cttd.co.kr`로 최종 발송하지 않는다.
```

Expected: 발송 금지선이 워크플로에서도 명확히 보인다.

- [ ] **Step 4: 워크플로 변경만 커밋**

Run:

```powershell
git diff -- docs/magazine-agent-workflow.md
git add docs/magazine-agent-workflow.md
git commit -m "docs: 워크플로 산출물 기준 정리" -m "에이전트별 입력, 실행 명령, 출력 파일, 판단 기준 링크를 같은 형식으로 정리한다."
```

Expected: 워크플로 문서만 포함된 커밋이 생성된다.

### Task 5: DEV 문서와 AGENTS 기준 충돌 확인

**Files:**
- Modify: `docs/dev-digest-agent-prompt.md`
- Read: `AGENTS.md`
- Read: `news-tracking/dev-sources.json`

- [ ] **Step 1: DEV 기준 문장 검색**

Run:

```powershell
Select-String -LiteralPath AGENTS.md,docs\dev-digest-agent-prompt.md -Pattern 'DEV|fetch:dev|dev-sources|요약|기술 변화 요약|매거진 인사이트' -Encoding UTF8 | Select-Object Path,LineNumber,Line
```

Expected: AGENTS의 DEV Digest Source Standard와 prompt의 출력 형식이 서로 맞는지 확인한다.

- [ ] **Step 2: prompt 상단에 운영 기준 출처 추가**

Insert after title:

```markdown
운영 기준은 [AGENTS.md](../AGENTS.md)의 DEV Digest Source Standard를 따른다. 이 문서는 수집 이후 후보 선별, 원문 확인, 요약 작성에만 사용한다.
```

Expected: AGENTS와 prompt의 책임이 분리된다.

- [ ] **Step 3: DEV 출력 레이어 이름을 AGENTS와 동일하게 유지**

Ensure these labels are used exactly:

```markdown
요약
기술 변화 요약
매거진 인사이트
```

Expected: DEV article header와 상세 작성 레이어가 다른 이름으로 갈라지지 않는다.

- [ ] **Step 4: DEV 문서 변경만 커밋**

Run:

```powershell
git diff -- docs/dev-digest-agent-prompt.md
git add docs/dev-digest-agent-prompt.md
git commit -m "docs: DEV 작성 기준 출처 명시" -m "DEV 운영 기준은 AGENTS를 따르도록 명시하고, prompt는 후보 선별과 요약 작성 책임만 갖게 한다."
```

Expected: DEV prompt 문서만 포함된 커밋이 생성된다.

### Task 6: 문서 링크와 한글 인코딩 최종 검수

**Files:**
- Read: `README.md`
- Read: `AGENTS.md`
- Read: `docs/*.md`

- [ ] **Step 1: Markdown 링크 대상 존재 확인**

Run:

```powershell
$files = @('README.md','AGENTS.md') + (Get-ChildItem -LiteralPath docs -Filter *.md | ForEach-Object { $_.FullName })
foreach ($file in $files) {
  $text = Get-Content -LiteralPath $file -Raw -Encoding UTF8
  [regex]::Matches($text, '\[[^\]]+\]\(([^)]+)\)') | ForEach-Object {
    $target = $_.Groups[1].Value
    if ($target -match '^(https?:|mailto:|#)') { return }
    $base = Split-Path -Parent $file
    $full = Join-Path $base $target
    if (-not (Test-Path $full)) {
      Write-Output "$file -> missing link: $target"
    }
  }
}
```

Expected: no output.

- [ ] **Step 2: 문서 제목 구조 재확인**

Run:

```powershell
Get-ChildItem -LiteralPath docs -Filter *.md | ForEach-Object {
  Write-Output "[$($_.Name)]"
  Select-String -LiteralPath $_.FullName -Pattern '^#' -Encoding UTF8 | Select-Object -ExpandProperty Line
}
```

Expected: 각 문서의 제목만 봐도 책임이 구분된다.

- [ ] **Step 3: Windows 한글 깨짐 확인**

Run:

```powershell
Get-Content -LiteralPath README.md -Encoding UTF8 -TotalCount 20
Get-Content -LiteralPath AGENTS.md -Encoding UTF8 -TotalCount 20
Get-Content -LiteralPath docs\editorial-style-guide.md -Encoding UTF8 -TotalCount 20
```

Expected: 한글이 정상 출력된다. 깨져 보이면 파일 자체가 아니라 콘솔 코드페이지 문제인지 아래 명령으로 확인한다.

```powershell
[Console]::OutputEncoding
Get-Item README.md,AGENTS.md,docs\editorial-style-guide.md | Select-Object FullName,Length,LastWriteTime
```

- [ ] **Step 4: 최종 상태 확인**

Run:

```powershell
git status --short
```

Expected: 의도한 문서 변경만 남아 있거나, 모든 문서 리팩토링 커밋이 완료되어 작업트리가 깨끗하다. 기존에 있던 `public/data/magazine.json`, `runs/2026-04-27/magazine-report.md` 수정분은 이번 문서 리팩토링 커밋에 포함하지 않는다.

- [ ] **Step 5: 검수 커밋**

Run:

```powershell
git add README.md AGENTS.md docs
git commit -m "docs: 문서 링크와 인코딩 검수" -m "문서 간 링크를 확인하고 Windows UTF-8 출력 기준으로 한글 깨짐 여부를 점검한다."
```

Expected: 필요한 경우에만 검수 커밋이 생성된다. 변경 파일이 없으면 커밋하지 않는다.

## 완료 기준

- README는 150줄 안팎의 진입점 문서가 된다.
- 수집 기준, 작성 기준, 작업 순서, DEV 기준의 책임 문서가 분리된다.
- AGENTS의 뉴스레터 승인 흐름과 DEV Source Standard가 다른 문서에 의해 덮어써지지 않는다.
- 모든 내부 Markdown 링크가 존재한다.
- Windows PowerShell에서 `-Encoding UTF8`로 읽었을 때 한글이 정상 출력된다.
- 기존 사용자 수정분인 `public/data/magazine.json`, `runs/2026-04-27/magazine-report.md`는 문서 리팩토링 커밋에 포함되지 않는다.
