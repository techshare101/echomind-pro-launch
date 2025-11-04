# EchoMind Pro v2.0.4 - Chrome Store Compliance Verification Script
# Run this before packaging to ensure no violations

Write-Host "`n🔍 EchoMind Pro v2.0.4 Compliance Check" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan

$errors = 0
$warnings = 0

# Check 1: Verify dist folder exists
Write-Host "`n[1/8] Checking build output..." -ForegroundColor Yellow
if (Test-Path "dist") {
    Write-Host "✅ PASS: dist/ folder exists" -ForegroundColor Green
} else {
    Write-Host "❌ FAIL: dist/ folder not found. Run 'npm run build' first." -ForegroundColor Red
    $errors++
}

# Check 2: No dynamic script creation
Write-Host "`n[2/8] Scanning for dynamic script injection..." -ForegroundColor Yellow
$scriptCreation = Select-String -Path "dist\*.js" -Pattern "createElement.*script|setAttribute.*src" -ErrorAction SilentlyContinue
if ($scriptCreation) {
    Write-Host "❌ FAIL: Found dynamic script creation:" -ForegroundColor Red
    $scriptCreation | ForEach-Object { Write-Host "  $_" -ForegroundColor Red }
    $errors++
} else {
    Write-Host "✅ PASS: No dynamic script injection detected" -ForegroundColor Green
}

# Check 3: No Firebase Auth references
Write-Host "`n[3/8] Scanning for Firebase Auth remnants..." -ForegroundColor Yellow
$firebaseAuth = Select-String -Path "dist\*.js" -Pattern "firebase.auth|firebase-auth|getAuth\(|signInWithPopup|signInWithRedirect" -ErrorAction SilentlyContinue
if ($firebaseAuth) {
    Write-Host "❌ FAIL: Found Firebase Auth references:" -ForegroundColor Red
    $firebaseAuth | ForEach-Object { Write-Host "  $_" -ForegroundColor Red }
    $errors++
} else {
    Write-Host "✅ PASS: No Firebase Auth references found" -ForegroundColor Green
}

# Check 4: No reCAPTCHA or GAPI references
Write-Host "`n[4/8] Scanning for Google API loaders..." -ForegroundColor Yellow
$googleApis = Select-String -Path "dist\*.js" -Pattern "recaptcha|gapi|apis.google.com" -ErrorAction SilentlyContinue
if ($googleApis) {
    Write-Host "⚠️  WARNING: Found Google API references (may be in comments/strings):" -ForegroundColor Yellow
    $googleApis | Select-Object -First 3 | ForEach-Object { Write-Host "  $_" -ForegroundColor Yellow }
    $warnings++
} else {
    Write-Host "✅ PASS: No Google API loader references" -ForegroundColor Green
}

# Check 5: Verify chrome-identity-auth.js exists
Write-Host "`n[5/8] Checking auth module..." -ForegroundColor Yellow
if (Test-Path "dist\lib\chrome-identity-auth.js") {
    Write-Host "✅ PASS: chrome-identity-auth.js found in dist/lib/" -ForegroundColor Green
    
    # Verify it uses Chrome Identity API
    $chromeIdentity = Select-String -Path "dist\lib\chrome-identity-auth.js" -Pattern "chrome.identity.launchWebAuthFlow" -ErrorAction SilentlyContinue
    if ($chromeIdentity) {
        Write-Host "✅ PASS: Chrome Identity API actively used" -ForegroundColor Green
    } else {
        Write-Host "❌ FAIL: Chrome Identity API not found in auth module" -ForegroundColor Red
        $errors++
    }
} else {
    Write-Host "❌ FAIL: chrome-identity-auth.js not found in dist/lib/" -ForegroundColor Red
    $errors++
}

# Check 6: Verify manifest.json
Write-Host "`n[6/8] Checking manifest.json..." -ForegroundColor Yellow
if (Test-Path "dist\manifest.json") {
    $manifest = Get-Content "dist\manifest.json" -Raw | ConvertFrom-Json
    
    # Check version
    if ($manifest.version -eq "2.0.4") {
        Write-Host "✅ PASS: Version is 2.0.4" -ForegroundColor Green
    } else {
        Write-Host "❌ FAIL: Version is $($manifest.version), should be 2.0.4" -ForegroundColor Red
        $errors++
    }
    
    # Check OAuth2 config
    if ($manifest.oauth2) {
        if ($manifest.oauth2.client_id -like "*YOUR_EXTENSION_CLIENT_ID*") {
            Write-Host "⚠️  WARNING: OAuth Client ID not configured (still has placeholder)" -ForegroundColor Yellow
            $warnings++
        } else {
            Write-Host "✅ PASS: OAuth2 client_id configured" -ForegroundColor Green
        }
    } else {
        Write-Host "❌ FAIL: oauth2 configuration missing from manifest" -ForegroundColor Red
        $errors++
    }
    
    # Check identity permission
    if ($manifest.permissions -contains "identity") {
        Write-Host "✅ PASS: identity permission declared" -ForegroundColor Green
    } else {
        Write-Host "❌ FAIL: identity permission missing" -ForegroundColor Red
        $errors++
    }
} else {
    Write-Host "❌ FAIL: manifest.json not found in dist/" -ForegroundColor Red
    $errors++
}

# Check 7: No old firebase-auth.js
Write-Host "`n[7/8] Checking for old auth files..." -ForegroundColor Yellow
if (Test-Path "dist\firebase-auth.js") {
    Write-Host "❌ FAIL: Old firebase-auth.js still exists in dist/" -ForegroundColor Red
    $errors++
} else {
    Write-Host "✅ PASS: No old firebase-auth.js found" -ForegroundColor Green
}

# Check 8: Package size estimate
Write-Host "`n[8/8] Checking package size..." -ForegroundColor Yellow
if (Test-Path "dist") {
    $distSize = (Get-ChildItem -Path "dist" -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
    Write-Host "📦 Uncompressed dist/ size: $([math]::Round($distSize, 2)) MB" -ForegroundColor Cyan
    
    if ($distSize -lt 10) {
        Write-Host "✅ PASS: Size is reasonable (< 10 MB)" -ForegroundColor Green
    } else {
        Write-Host "⚠️  WARNING: Size is large (> 10 MB)" -ForegroundColor Yellow
        $warnings++
    }
}

# Summary
Write-Host "`n" + ("=" * 60) -ForegroundColor Cyan
Write-Host "📊 COMPLIANCE SUMMARY" -ForegroundColor Cyan
Write-Host ("=" * 60) -ForegroundColor Cyan

if ($errors -eq 0 -and $warnings -eq 0) {
    Write-Host "`n🎉 ALL CHECKS PASSED!" -ForegroundColor Green
    Write-Host "✅ Ready to package and submit to Chrome Web Store" -ForegroundColor Green
    Write-Host "`nNext steps:" -ForegroundColor Cyan
    Write-Host "  1. Run: npm run package" -ForegroundColor White
    Write-Host "  2. Upload: echomind-pro-2.0.4.zip" -ForegroundColor White
    Write-Host "  3. Add reviewer notes from CHROME_STORE_V2.0.4_SUBMISSION.md" -ForegroundColor White
    exit 0
} elseif ($errors -eq 0) {
    Write-Host "`n⚠️  $warnings WARNING(S) - Review recommended" -ForegroundColor Yellow
    Write-Host "You may proceed, but review warnings above." -ForegroundColor Yellow
    exit 0
} else {
    Write-Host "`n❌ $errors ERROR(S) FOUND" -ForegroundColor Red
    if ($warnings -gt 0) {
        Write-Host "⚠️  $warnings WARNING(S) FOUND" -ForegroundColor Yellow
    }
    Write-Host "`nFix errors above before packaging." -ForegroundColor Red
    exit 1
}
