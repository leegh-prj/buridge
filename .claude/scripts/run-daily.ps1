# BuRIDGE daily update runner (Windows Task Scheduler, every day 08:00 KST)
# - Skips if today's update is already verified
# - Runs Claude Code headless with the runbook (.claude/daily-update.md)
# - Logs: %LOCALAPPDATA%\buridge-daily\logs\YYYY-MM-DD.log

$ErrorActionPreference = 'Continue'
$utf8 = New-Object System.Text.UTF8Encoding($false)
[Console]::OutputEncoding = $utf8
$OutputEncoding = $utf8

$repo = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$logDir = Join-Path $env:LOCALAPPDATA 'buridge-daily\logs'
New-Item -ItemType Directory -Force -Path $logDir | Out-Null
$today = (Get-Date).ToString('yyyy-MM-dd')
$log = Join-Path $logDir "$today.log"

function Log($msg) {
    $line = "[{0}] {1}" -f (Get-Date).ToString('HH:mm:ss'), $msg
    [System.IO.File]::AppendAllText($log, $line + "`r`n", $utf8)
}

Set-Location $repo
Log "start repo=$repo"

# 1) already done today?
$check = & node .claude/scripts/verify.mjs $today 2>&1
if ($LASTEXITCODE -eq 0) { Log "already updated: $check"; exit 0 }

# 2) sync with remote (abort if local changes would be overwritten)
$dirty = & git status --porcelain
if ($dirty) { Log "ABORT: working tree has local changes:`r`n$($dirty -join "`r`n")"; exit 1 }
& git pull --rebase origin master 2>&1 | ForEach-Object { Log "git: $_" }

# 3) run Claude Code headless
$claude = Join-Path $env:APPDATA 'npm\claude.cmd'
$prompt = "Run today's BuRIDGE daily site update. Today in Asia/Seoul is $today. " +
  "Read .claude/daily-update.md in this repository from start to finish and follow it exactly: " +
  "research with WebSearch and use only facts confirmed in articles, add 2 daily lessons, today's issue section in the trends page, " +
  "the TOP 7 news popup, home page numbers and og-image. Write all site text in Korean for beginners. " +
  "Run node .claude/scripts/verify.mjs $today and only if it passes, commit and push to master (Vercel deploys automatically). " +
  "Change only the 5 files listed in the runbook. If verification keeps failing, do not push. " +
  "Finish with a short report in Korean: lessons added, TOP 7 titles, key numbers changed, items you could not confirm, source URLs."
Log "claude start"
& $claude -p $prompt --model claude-opus-5-5 --allowedTools "Bash,Read,Write,Edit,Glob,Grep,WebSearch,WebFetch" 2>&1 |
    ForEach-Object { [System.IO.File]::AppendAllText($log, "$_`r`n", $utf8) }
Log "claude exit=$LASTEXITCODE"

# 4) final check
$check = & node .claude/scripts/verify.mjs $today 2>&1
Log "verify exit=$LASTEXITCODE $($check -join ' ')"
$ahead = & git status -sb | Select-Object -First 1
Log "git: $ahead"
Log "done"
