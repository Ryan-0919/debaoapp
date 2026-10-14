param(
  [string]$BaseUrl = 'http://127.0.0.1:4000',
  [string]$Token = 'demo-token'
)

$headers = @{ Authorization = "Bearer $Token" }
$healthResponse = Invoke-WebRequest -UseBasicParsing -Uri "$BaseUrl/v1/health" -TimeoutSec 3
$healthJson = $healthResponse.Content | ConvertFrom-Json
if ($healthResponse.StatusCode -ne 200 -or $null -eq $healthJson.data -or [string]::IsNullOrWhiteSpace([string]$healthJson.requestId)) {
  throw 'API check failed: /v1/health envelope'
}
Write-Output ("PASS {0} /v1/health" -f $healthResponse.StatusCode)

$legalResponse = Invoke-WebRequest -UseBasicParsing -Uri "$BaseUrl/v1/legal-documents/privacy" -TimeoutSec 3
$legalJson = $legalResponse.Content | ConvertFrom-Json
if ($legalResponse.StatusCode -ne 200 -or $null -eq $legalJson.data -or [string]$legalJson.data.key -ne 'privacy' -or $null -eq $legalJson.data.sections -or [string]::IsNullOrWhiteSpace([string]$legalJson.requestId)) {
  throw 'API check failed: /v1/legal-documents/privacy'
}
Write-Output ("PASS {0} /v1/legal-documents/privacy" -f $legalResponse.StatusCode)

$providerResponse = Invoke-WebRequest -UseBasicParsing -Uri "$BaseUrl/v1/auth/providers" -TimeoutSec 3
$providerJson = $providerResponse.Content | ConvertFrom-Json
if ($providerResponse.StatusCode -ne 200 -or $null -eq $providerJson.data -or $null -eq $providerJson.data.sms -or [string]::IsNullOrWhiteSpace([string]$providerJson.requestId)) {
  throw 'API check failed: /v1/auth/providers'
}
Write-Output ("PASS {0} /v1/auth/providers" -f $providerResponse.StatusCode)

# The local SMS adapter returns a development-only code. Use a fresh phone on
# every run so this write-flow check does not trip the server rate limiter.
$smokePhone = "139{0:D8}" -f (Get-Random -Minimum 10000000 -Maximum 99999999)
$sendCodeResponse = Invoke-WebRequest -UseBasicParsing -Method Post -ContentType 'application/json' -Uri "$BaseUrl/v1/auth/send-code" -Body (@{phone = $smokePhone; purpose = 'login'; deviceId = 'api-smoke'} | ConvertTo-Json) -TimeoutSec 3
$sendCodeJson = $sendCodeResponse.Content | ConvertFrom-Json
$developmentCode = [string]$sendCodeJson.data.developmentCode
if ($sendCodeResponse.StatusCode -ne 200 -or $sendCodeJson.data.accepted -ne $true -or [string]::IsNullOrWhiteSpace($developmentCode) -or [string]::IsNullOrWhiteSpace([string]$sendCodeJson.requestId)) {
  throw 'API check failed: /v1/auth/send-code'
}
Write-Output ("PASS {0} /v1/auth/send-code" -f $sendCodeResponse.StatusCode)

$loginResponse = Invoke-WebRequest -UseBasicParsing -Method Post -ContentType 'application/json' -Uri "$BaseUrl/v1/auth/login" -Body (@{phone = $smokePhone; code = $developmentCode; deviceId = 'api-smoke'} | ConvertTo-Json) -TimeoutSec 3
$loginJson = $loginResponse.Content | ConvertFrom-Json
$smokeToken = [string]$loginJson.data.accessToken
if ($loginResponse.StatusCode -ne 200 -or [string]::IsNullOrWhiteSpace($smokeToken) -or [string]::IsNullOrWhiteSpace([string]$loginJson.data.refreshToken) -or [string]::IsNullOrWhiteSpace([string]$loginJson.requestId)) {
  throw 'API check failed: /v1/auth/login'
}
Write-Output ("PASS {0} /v1/auth/login" -f $loginResponse.StatusCode)

$authHeaders = @{ Authorization = "Bearer $smokeToken" }
$authMeResponse = Invoke-WebRequest -UseBasicParsing -Headers $authHeaders -Uri "$BaseUrl/v1/me" -TimeoutSec 3
$authMeJson = $authMeResponse.Content | ConvertFrom-Json
if ($authMeResponse.StatusCode -ne 200 -or $null -eq $authMeJson.data -or [string]::IsNullOrWhiteSpace([string]$authMeJson.requestId)) {
  throw 'API check failed: /v1/me with issued token'
}
Write-Output ("PASS {0} /v1/me with issued token" -f $authMeResponse.StatusCode)

$logoutResponse = Invoke-WebRequest -UseBasicParsing -Method Post -Headers $authHeaders -Uri "$BaseUrl/v1/auth/logout" -TimeoutSec 3
$logoutJson = $logoutResponse.Content | ConvertFrom-Json
if ($logoutResponse.StatusCode -ne 200 -or $logoutJson.data.loggedOut -ne $true -or [string]::IsNullOrWhiteSpace([string]$logoutJson.requestId)) {
  throw 'API check failed: /v1/auth/logout'
}
Write-Output ("PASS {0} /v1/auth/logout" -f $logoutResponse.StatusCode)

$paths = @(
  '/v1/me',
  '/v1/me/settings',
  '/v1/me/identities',
  '/v1/devices',
  '/v1/account/deletion',
  '/v1/courses',
  '/v1/questions',
  '/v1/products',
  '/v1/orders',
  '/v1/notifications',
  '/v1/forum/posts',
  '/v1/learning/plans',
  '/v1/learning/tasks',
  '/v1/learning/report',
  '/v1/legal-favorites',
  '/v1/mistakes'
)
$orderId = $null
foreach ($path in $paths) {
  $response = Invoke-WebRequest -UseBasicParsing -Headers $headers -Uri "$BaseUrl$path" -TimeoutSec 3
  $json = $response.Content | ConvertFrom-Json
  if ($response.StatusCode -ne 200 -or $null -eq $json.data -or [string]::IsNullOrWhiteSpace([string]$json.requestId)) {
    throw "API check failed: $path"
  }
  Write-Output ("PASS {0} {1}" -f $response.StatusCode, $path)
  if ($path -eq '/v1/orders' -and $json.data -is [array] -and $json.data.Count -gt 0) {
    $orderId = [string]$json.data[0].id
  }
}
if ($orderId) {
  $encodedOrderId = [Uri]::EscapeDataString($orderId)
  $detailResponse = Invoke-WebRequest -UseBasicParsing -Headers $headers -Uri "$BaseUrl/v1/orders/$encodedOrderId" -TimeoutSec 3
  $detailJson = $detailResponse.Content | ConvertFrom-Json
  if ($detailResponse.StatusCode -ne 200 -or $null -eq $detailJson.data -or [string]$detailJson.data.id -ne $orderId) {
    throw "API check failed: /v1/orders/{id}"
  }
  Write-Output ("PASS {0} /v1/orders/{1}" -f $detailResponse.StatusCode, $orderId)
} else {
  Write-Output 'SKIP /v1/orders/{id}: no order returned by the authenticated account'
}
