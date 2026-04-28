param(
  [string]$Date = (Get-Date -Format "yyyy-MM-dd"),
  [switch]$SkipFetch,
  [switch]$SkipPrepare,
  [switch]$SkipQc,
  [switch]$StrictQc,
  [switch]$ExportJson,
  [ValidateSet("", "preview", "test", "final")]
  [string]$SendStage = "",
  [string]$SendTo = "",
  [string]$Report = "",
  [string]$Audience = "general"
)

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.UTF8Encoding]::new($false)

$rootDir = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
Set-Location $rootDir

$runsDir = Join-Path $rootDir "runs"
$workflowLogDir = Join-Path $runsDir $Date
New-Item -ItemType Directory -Force -Path $workflowLogDir | Out-Null
$logFile = Join-Path $workflowLogDir "workflow-ps-wrapper.log"

$args = @(
  "run", "tracking:workflow",
  "--",
  "--date=$Date"
)

if ($SkipFetch) { $args += "--skip-fetch" }
if ($SkipPrepare) { $args += "--skip-prepare" }
if ($SkipQc) { $args += "--skip-qc" }
if ($StrictQc) { $args += "--strict-qc" }
if ($ExportJson) { $args += "--export-json" }
if ($SendStage) { $args += "--send-stage=$SendStage" }
if ($SendTo) { $args += "--send-to=$SendTo" }
if ($Report) { $args += "--report=$Report" }
if ($Audience) { $args += "--audience=$Audience" }

$start = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$cmd = "npm $($args -join ' ')"
"[$start] $cmd" | Out-File -FilePath $logFile -Append -Encoding utf8

try {
  & npm @args | Tee-Object -FilePath $logFile -Append
}
catch {
  Write-Error $_
  exit 1
}
