param(
  [string]$FlutterVersion = '3.47.2',
  [string]$ToolRoot = 'E:\tools\debao-flutter',
  [string]$AndroidSdkRoot = 'E:\Android\Sdk',
  [switch]$RunChecks
)

$ErrorActionPreference = 'Stop'
$archiveName = "flutter_windows_${FlutterVersion}-stable.zip"
$archivePath = Join-Path $ToolRoot $archiveName
$sdkPath = Join-Path $ToolRoot 'flutter'
$url = "https://storage.flutter-io.cn/flutter_infra_release/releases/stable/windows/$archiveName"
$checksums = @{
  '3.47.2' = '37934f2128a55d77a38baba12fd611157ed23a47bf7d2b7d17e9e84da118409d'
}

New-Item -ItemType Directory -Force -Path $ToolRoot | Out-Null

if (-not (Test-Path (Join-Path $sdkPath 'bin\flutter.bat'))) {
  $hasValidArchive = $false
  if ((Test-Path -LiteralPath $archivePath -PathType Leaf) -and $checksums.ContainsKey($FlutterVersion)) {
    $existingSha256 = (Get-FileHash -LiteralPath $archivePath -Algorithm SHA256).Hash.ToLowerInvariant()
    $hasValidArchive = $existingSha256 -eq $checksums[$FlutterVersion]
    if (-not $hasValidArchive) {
      Write-Warning 'Existing Flutter archive is incomplete or has the wrong checksum; removing it.'
      Remove-Item -LiteralPath $archivePath -Force
    }
  }
  if (-not $hasValidArchive) {
    Write-Host "Downloading Flutter $FlutterVersion from $url"
    Start-BitsTransfer -Source $url -Destination $archivePath -DisplayName 'Flutter SDK download'
  }

  if (-not $checksums.ContainsKey($FlutterVersion)) {
    throw "No pinned SHA-256 is recorded for Flutter $FlutterVersion"
  }
  $expectedSha256 = $checksums[$FlutterVersion]
  $actualSha256 = (Get-FileHash -LiteralPath $archivePath -Algorithm SHA256).Hash.ToLowerInvariant()
  if ($actualSha256 -ne $expectedSha256) {
    throw "Flutter archive SHA-256 mismatch. Expected $expectedSha256 but got $actualSha256"
  }

  Write-Host 'Expanding Flutter SDK'
  Expand-Archive -LiteralPath $archivePath -DestinationPath $ToolRoot -Force
}

$flutter = Join-Path $sdkPath 'bin\flutter.bat'
if (-not (Test-Path $flutter)) {
  throw "Flutter SDK was not found at $flutter"
}

& $flutter --version
if ($RunChecks) {
  Push-Location (Split-Path $PSScriptRoot -Parent)
  try {
    if (Test-Path $AndroidSdkRoot) {
      $env:ANDROID_SDK_ROOT = $AndroidSdkRoot
      $env:Path = "$(Join-Path $AndroidSdkRoot 'platform-tools');$(Join-Path $AndroidSdkRoot 'emulator');$env:Path"
    }
    & $flutter pub get
    & $flutter analyze
    & $flutter test
  } finally {
    Pop-Location
  }
}
