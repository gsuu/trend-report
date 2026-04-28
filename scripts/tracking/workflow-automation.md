# 트래킹 자동화 실행 가이드

## 1) Codex/로컬에서 바로 실행

현재 파이프라인은 `npm run tracking:workflow` 하나로 돌릴 수 있어.

```powershell
npm run tracking:workflow
```

특정 날짜를 지정해서 재실행하려면:

```powershell
npm run tracking:workflow -- --date=2026-04-28
```

로그와 실행 상태는 `runs/YYYY-MM-DD/workflow-state.json`에 남는다.

## 2) Windows PowerShell 래퍼 사용 (작업 스케줄러용)

래퍼 스크립트:
`scripts/tracking/run-tracking-workflow.ps1`

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File "D:\_GitHub\trend-report\scripts\tracking\run-tracking-workflow.ps1" -Date (Get-Date -Format "yyyy-MM-dd") -ExportJson -StrictQc
```

자주 쓰는 실행 예시:

```powershell
# 일별 전체 수집/정리 + QA + JSON 반영
powershell -NoProfile -ExecutionPolicy Bypass -File "...\\scripts\\tracking\\run-tracking-workflow.ps1" -ExportJson -StrictQc

# 메일 테스트만 하고 싶을 때
powershell -NoProfile -ExecutionPolicy Bypass -File "...\\scripts\\tracking\\run-tracking-workflow.ps1" -ExportJson -StrictQc -SendStage test

# 운영 전용: 테스트 완료 후 승인 플래그까지 붙여 최종 발송
powershell -NoProfile -ExecutionPolicy Bypass -File "...\\scripts\\tracking\\run-tracking-workflow.ps1" -ExportJson -StrictQc -SendStage final -SendTo "cxd@cttd.co.kr" -Audience "final"
```

## 3) 작업 스케줄러 등록 포인트

Task Scheduler에서:
- 동작: `Program/script` = `powershell`
- 인수: `-NoProfile -ExecutionPolicy Bypass -File "D:\_GitHub\trend-report\scripts\tracking\run-tracking-workflow.ps1" -ExportJson -StrictQc`
- 시작 위치: `D:\_GitHub\trend-report`
- 권한: 네트워크/메일 발송이 필요하면 해당 계정 권한 확인

## 4) 주의

- 기본 발송은 비활성 상태야. `-SendStage`를 넣어야 메일 관련 동작이 붙는다.
- 최종 발송(`-SendStage final`)은 승인 플로우를 이미 거쳤을 때만 사용해야 해.

## 5) Windows 한글 깨짐 점검

- `chcp 65001`(UTF-8)로 실행하면 콘솔/로그 문자열이 안전하다.
- `run-tracking-workflow.ps1`은 `UTF-8` 로그 출력을 강제해 두었다.  
