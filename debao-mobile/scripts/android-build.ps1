param(
  [ValidatePattern('^[A-Z]:$')]
  [string]$DriveLetter = 'R:',
  [switch]$EmbeddedBundle
)

$ErrorActionPreference = 'Stop'
$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$workspaceRoot = Split-Path $projectRoot -Parent
$projectDirectoryName = Split-Path $projectRoot -Leaf
$existingMapping = subst | Where-Object { $_ -like "$DriveLetter*" }
$createdMapping = $false

if (-not $env:ANDROID_HOME -and -not $env:ANDROID_SDK_ROOT) {
  throw 'Android SDK is not configured. Set ANDROID_HOME or ANDROID_SDK_ROOT.'
}

if ($existingMapping) {
  throw "$DriveLetter is already in use. Choose another drive with -DriveLetter."
}

try {
  if ($EmbeddedBundle) {
    $node = (Get-Command node -ErrorAction Stop).Source
    $embeddedAssets = Join-Path $projectRoot 'android\app\src\debug\assets'
    $bundleOutput = Join-Path $embeddedAssets 'index.android.bundle'
    New-Item -ItemType Directory -Force $embeddedAssets | Out-Null
    Push-Location $projectRoot
    try {
      & $node 'node_modules\react-native\cli.js' bundle `
        --platform android `
        --dev false `
        --minify true `
        --entry-file index.js `
        --bundle-output $bundleOutput `
        --assets-dest $embeddedAssets
      if ($LASTEXITCODE -ne 0) {
        throw "React Native bundle failed with exit code $LASTEXITCODE."
      }
    } finally {
      Pop-Location
    }
  }

  # Preserve the project path relative to the Git workspace for RN autolinking.
  subst $DriveLetter $workspaceRoot
  $createdMapping = $true
  Push-Location "$DriveLetter\$projectDirectoryName\android"
  $gradleArguments = @('assembleDebug', '--no-daemon')
  if ($EmbeddedBundle) {
    $gradleArguments += '-PdebaoEmbeddedBundle'
  }
  .\gradlew.bat @gradleArguments
  if ($LASTEXITCODE -ne 0) {
    throw "Gradle build failed with exit code $LASTEXITCODE."
  }
} finally {
  if ((Get-Location).Path -like "$DriveLetter*") {
    Pop-Location
  }
  if ($createdMapping) {
    subst $DriveLetter /D
  }
}
