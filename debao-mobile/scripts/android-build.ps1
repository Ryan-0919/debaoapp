param(
  [ValidatePattern('^[A-Z]:$')]
  [string]$DriveLetter = 'R:'
)

$ErrorActionPreference = 'Stop'
$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$existingMapping = subst | Where-Object { $_ -like "$DriveLetter*" }
$createdMapping = $false

if (-not $env:ANDROID_HOME -and -not $env:ANDROID_SDK_ROOT) {
  throw 'Android SDK 未配置。请设置 ANDROID_HOME 或 ANDROID_SDK_ROOT。'
}

if ($existingMapping) {
  throw "$DriveLetter 已被占用，请通过 -DriveLetter 选择其他盘符。"
}

try {
  subst $DriveLetter $projectRoot
  $createdMapping = $true
  Push-Location "$DriveLetter\android"
  .\gradlew.bat assembleDebug --no-daemon
  if ($LASTEXITCODE -ne 0) {
    throw "Gradle 构建失败，退出码：$LASTEXITCODE"
  }
} finally {
  if ((Get-Location).Path -like "$DriveLetter*") {
    Pop-Location
  }
  if ($createdMapping) {
    subst $DriveLetter /D
  }
}
