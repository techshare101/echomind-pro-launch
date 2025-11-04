# EchoMind Pro v2.0.4 - Compliance Verification Script
# Run this before submitting to Chrome Web Store

Write-Host "`n[*] EchoMind Pro v2.0.4 - Compliance Verification" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Gray

$allPassed = $true

# Test 1: No firebase-auth.js
Write-Host "`n[Test 1] Checking for firebase-auth.js..." -ForegroundColor Yellow
$firebaseAuthFiles = Get-ChildItem -Path "dist" -Recurse -Filter "*firebase-auth*" -ErrorAction SilentlyContinue
if ($firebaseAuthFiles) {
    Write-Host "❌ FAIL: firebase-auth.js found in dist/" -ForegroundColor Red
    $firebaseAuthFiles | ForEach-Object { Write-Host "   - $($_.FullName)" -ForegroundColor Red }
    $allPassed = $false
} else {
    Write-Host "✅ PASS: No firebase-auth.js found" -ForegroundColor Green
}

# Test 2: Chrome Identity API present
Write-Host "`n[Test 2] Checking Chrome Identity API usage..." -ForegroundColor Yellow
$chromeIdentityFile = "dist\lib\chrome-identity-auth.js"
if (Test-Path $chromeIdentityFile) {
    $content = Get-Content $chromeIdentityFile -Raw
    $apiCount = ([regex]::Matches($content, "chrome\.identity\.")).Count
    
    if ($apiCount -ge 3) {
        Write-Host "✅ PASS: Chrome Identity API used $apiCount times" -ForegroundColor Green
        
        # Check for specific methods
        if ($content -match "launchWebAuthFlow") {
            Write-Host "   + launchWebAuthFlow() found" -ForegroundColor Green
        }
        if ($content -match "getRedirectURL") {
            Write-Host "   + getRedirectURL() found" -ForegroundColor Green
        }
        if ($content -match "removeCachedAuthToken") {
            Write-Host "   + removeCachedAuthToken() found" -ForegroundColor Green
        }
    } else {
        Write-Host "❌ FAIL: Chrome Identity API not found or insufficient usage ($apiCount calls)" -ForegroundColor Red
        $allPassed = $false
    }
} else {
    Write-Host "❌ FAIL: chrome-identity-auth.js not found in dist/lib/" -ForegroundColor Red
    $allPassed = $false
}

# Test 3: No remote script injection
Write-Host "`n[Test 3] Checking for remote script injection..." -ForegroundColor Yellow
$scriptInjection = Select-String -Path "dist\**\*.js" -Pattern 'document\.createElement\("script"\)' -SimpleMatch -ErrorAction SilentlyContinue
if ($scriptInjection) {
    Write-Host "❌ FAIL: Remote script injection detected" -ForegroundColor Red
    $scriptInjection | ForEach-Object { Write-Host "   - $($_.Path):$($_.LineNumber)" -ForegroundColor Red }
    $allPassed = $false
} else {
    Write-Host "✅ PASS: No remote script injection found" -ForegroundColor Green
}

# Test 4: OAuth Client ID configured
Write-Host "`n[Test 4] Checking OAuth Client ID..." -ForegroundColor Yellow
$manifestPath = "dist\manifest.json"
if (Test-Path $manifestPath) {
    $manifest = Get-Content $manifestPath -Raw | ConvertFrom-Json
    if ($manifest.oauth2.client_id -match "YOUR_EXTENSION_CLIENT_ID") {
        Write-Host "⚠️ WARNING: OAuth Client ID not configured (still placeholder)" -ForegroundColor Yellow
        Write-Host "   You MUST update this before submitting!" -ForegroundColor Yellow
        Write-Host "   See SUBMISSION_GUIDE_V2.0.4.md for instructions" -ForegroundColor Yellow
    } elseif ($manifest.oauth2.client_id -match "^\d+-[a-z0-9]+\.apps\.googleusercontent\.com$") {
        Write-Host "✅ PASS: OAuth Client ID configured" -ForegroundColor Green
        Write-Host "   Client ID: $($manifest.oauth2.client_id)" -ForegroundColor Gray
    } else {
        Write-Host "❌ FAIL: OAuth Client ID format invalid" -ForegroundColor Red
        $allPassed = $false
    }
} else {
    Write-Host "❌ FAIL: manifest.json not found in dist/" -ForegroundColor Red
    $allPassed = $false
}

# Test 5: identity permission declared
Write-Host "`n[Test 5] Checking permissions..." -ForegroundColor Yellow
if (Test-Path $manifestPath) {
    $manifest = Get-Content $manifestPath -Raw | ConvertFrom-Json
    if ($manifest.permissions -contains "identity") {
        Write-Host "✅ PASS: identity permission declared" -ForegroundColor Green
    } else {
        Write-Host "❌ FAIL: identity permission not declared" -ForegroundColor Red
        $allPassed = $false
    }
} else {
    Write-Host "❌ FAIL: Cannot check permissions (manifest.json missing)" -ForegroundColor Red
    $allPassed = $false
}

# Test 6: CSP configured
Write-Host "`n[Test 6] Checking Content Security Policy..." -ForegroundColor Yellow
if (Test-Path $manifestPath) {
    $manifest = Get-Content $manifestPath -Raw | ConvertFrom-Json
    $csp = $manifest.content_security_policy.extension_pages
    if ($csp -match "script-src 'self'") {
        Write-Host "✅ PASS: CSP configured correctly" -ForegroundColor Green
        Write-Host "   CSP: $csp" -ForegroundColor Gray
    } else {
        Write-Host "❌ FAIL: CSP not configured or incorrect" -ForegroundColor Red
        $allPassed = $false
    }
}

# Test 7: Package exists
Write-Host "`n[Test 7] Checking package..." -ForegroundColor Yellow
$packageFile = Get-ChildItem -Path "." -Filter "echomind-v2.0.4.zip" -ErrorAction SilentlyContinue
if ($packageFile) {
    $sizeKB = [math]::Round($packageFile.Length / 1KB, 2)
    Write-Host "✅ PASS: Package found ($sizeKB KB)" -ForegroundColor Green
    Write-Host "   File: $($packageFile.FullName)" -ForegroundColor Gray
} else {
    Write-Host "⚠️ WARNING: Package not found" -ForegroundColor Yellow
    Write-Host "   Run: npm run package" -ForegroundColor Yellow
}

# Final Summary
Write-Host "`n============================================================" -ForegroundColor Gray
if ($allPassed) {
    Write-Host "`n[+] ALL TESTS PASSED!" -ForegroundColor Green
    Write-Host "`nYour extension is ready for submission." -ForegroundColor Green
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "  1. Ensure OAuth Client ID is configured (check Test 4 above)" -ForegroundColor White
    Write-Host "  2. Read SUBMISSION_GUIDE_V2.0.4.md" -ForegroundColor White
    Write-Host "  3. Upload echomind-v2.0.4.zip to Chrome Web Store" -ForegroundColor White
    Write-Host "  4. Add reviewer notes from the guide" -ForegroundColor White
} else {
    Write-Host "`n[-] SOME TESTS FAILED" -ForegroundColor Red
    Write-Host "`nPlease fix the issues above before submitting." -ForegroundColor Red
    Write-Host "Re-run this script after fixing." -ForegroundColor Yellow
}

Write-Host "`n" -ForegroundColor Gray
