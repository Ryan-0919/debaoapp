$checks = [ordered]@{
  Node = (node --version 2>$null)
  pnpm = (pnpm --version 2>$null)
  Java = ((java -version 2>&1 | Select-Object -First 1) -join '')
  ANDROID_HOME = $env:ANDROID_HOME
  ANDROID_SDK_ROOT = $env:ANDROID_SDK_ROOT
  adb = (Get-Command adb -ErrorAction SilentlyContinue).Source
  hdc = (Get-Command hdc -ErrorAction SilentlyContinue).Source
  ohpm = (Get-Command ohpm -ErrorAction SilentlyContinue).Source
  hvigor = (Get-Command hvigor -ErrorAction SilentlyContinue).Source
}

$checks.GetEnumerator() | ForEach-Object {
  [pscustomobject]@{
    Check = $_.Key
    Value = if ($_.Value) { $_.Value } else { '未检测到' }
  }
} | Format-Table -AutoSize
