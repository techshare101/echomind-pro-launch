# Final Verification for Chrome Web Store Submission

Write-Host ""
Write-Host "=== FINAL VERIFICATION ===" -ForegroundColor Cyan
Write-Host ""

$allPassed = $true

# Check 1: No remote scripts in HTML
Write-Host "1. Checking for remote scripts in HTML files..." -ForegroundColor Yellow
$html = Get-ChildItem dist\*.html
$remoteScripts = $html | Select-String -Pattern "script.*src.*http" -SimpleMatch
if ($remoteScripts) {
    Write-Host "   FAIL: Found remote scripts!" -ForegroundColor Red
    $remoteScripts | ForEach-Object { Write-Host "   $_" }
    $allPassed = $false
} else {
    Write-Host "   PASS: No remote script tags found" -ForegroundColor Green
}

# Check 2: Package exists
Write-Host ""
Write-Host "2. Checking package exists..." -ForegroundColor Yellow
if (Test-Path "echomind-pro-2.0.3.zip") {
    $size = (Get-Item "echomind-pro-2.0.3.zip").Length / 1KB
    Write-Host "   PASS: Package exists ($(([math]::Round($size, 0))) KB)" -ForegroundColor Green
} else {
    Write-Host "   FAIL: Package missing" -ForegroundColor Red
    $allPassed = $false
}

# Check 3: Firebase bundle exists
Write-Host ""
Write-Host "3. Checking Firebase bundle..." -ForegroundColor Yellow
if (Test-Path "dist\firebase-auth.js") {
    $size = (Get-Item "dist\firebase-auth.js").Length / 1KB
    Write-Host "   PASS: firebase-auth.js bundled ($(([math]::Round($size, 0))) KB)" -ForegroundColor Green
} else {
    Write-Host "   FAIL: firebase-auth.js missing" -ForegroundColor Red
    $allPassed = $false
}

# Check 4: Manifest version
Write-Host ""
Write-Host "4. Checking manifest version..." -ForegroundColor Yellow
$manifest = Get-Content "dist\manifest.json" | ConvertFrom-Json
if ($manifest.version -eq "2.0.3") {
    Write-Host "   PASS: Version is 2.0.3" -ForegroundColor Green
} else {
    Write-Host "   FAIL: Version is $($manifest.version) (expected 2.0.3)" -ForegroundColor Red
    $allPassed = $false
}

# Check 5: Identity permission
Write-Host ""
Write-Host "5. Checking identity permission..." -ForegroundColor Yellow
if ($manifest.permissions -contains "identity") {
    Write-Host "   PASS: Identity permission present" -ForegroundColor Green
} else {
    Write-Host "   WARNING: Identity permission missing (optional)" -ForegroundColor Yellow
}

Write-Host ""
if ($allPassed) {
    Write-Host "=== ALL CHECKS PASSED ===" -ForegroundColor Green
    Write-Host ""
    Write-Host "Ready to submit: echomind-pro-2.0.3.zip" -ForegroundColor Cyan
    Write-Host "Upload to: https://chrome.google.com/webstore/devconsole" -ForegroundColor Cyan
} else {
    Write-Host "=== SOME CHECKS FAILED ===" -ForegroundColor Red
    Write-Host "Please fix the issues above before submitting." -ForegroundColor Red
}
Write-Host ""
