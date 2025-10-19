# ============================================
# 🚀 EchoMind Pro Launch - Stripe Webhook Deploy Script (PowerShell)
# ============================================

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "🔥 ECHOMIND PRO STRIPE WEBHOOK DEPLOY START" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Change to script directory
Set-Location $PSScriptRoot

# Step 1: Lint the functions directory
Write-Host "🧹 Running ESLint..." -ForegroundColor Yellow
try {
    npm run lint
    Write-Host "✅ ESLint passed successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ ESLint failed. Fix errors and re-run." -ForegroundColor Red
    exit 1
}

# Step 2: Deploy Firebase functions
Write-Host ""
Write-Host "🚀 Deploying Firebase functions..." -ForegroundColor Yellow
try {
    firebase deploy --only functions
} catch {
    Write-Host "❌ Deployment failed." -ForegroundColor Red
    exit 1
}

# Step 3: Verify deployed functions
Write-Host ""
Write-Host "🔍 Verifying deployment..." -ForegroundColor Yellow
$functionsList = firebase functions:list
if ($functionsList -match "stripeWebhook" -and $functionsList -match "checkSubscription") {
    Write-Host "✅ Both functions deployed successfully!" -ForegroundColor Green
    Write-Host "  • stripeWebhook" -ForegroundColor White
    Write-Host "  • checkSubscription" -ForegroundColor White
} else {
    Write-Host "❌ One or more functions not found. Check your Firebase logs." -ForegroundColor Red
    exit 1
}

# Step 4: Display function URLs for convenience
Write-Host ""
Write-Host "🌐 Your deployed function endpoints:" -ForegroundColor Cyan
Write-Host ""
Write-Host "📌 Stripe Webhook (copy to Stripe Dashboard):" -ForegroundColor Yellow
Write-Host "https://us-central1-echomind-pro-launch.cloudfunctions.net/stripeWebhook" -ForegroundColor White
Write-Host ""
Write-Host "📌 Subscription Check (for Chrome Extension):" -ForegroundColor Yellow
Write-Host "https://us-central1-echomind-pro-launch.cloudfunctions.net/checkSubscription" -ForegroundColor White

# Step 5: Stripe setup reminder
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "✅ DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host ""
Write-Host "🔗 Next Step — Add the following endpoint to your Stripe Dashboard:" -ForegroundColor Yellow
Write-Host "https://us-central1-echomind-pro-launch.cloudfunctions.net/stripeWebhook" -ForegroundColor White
Write-Host ""
Write-Host "➡️ Select these events:" -ForegroundColor Yellow
Write-Host "  • payment_intent.succeeded" -ForegroundColor White
Write-Host "  • checkout.session.completed" -ForegroundColor White
Write-Host "  • invoice.payment_succeeded" -ForegroundColor White
Write-Host "  • customer.subscription.deleted" -ForegroundColor White
Write-Host ""
Write-Host "🧪 Test your functions:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  # Test Stripe webhook:" -ForegroundColor White
Write-Host "  stripe trigger payment_intent.succeeded" -ForegroundColor Gray
Write-Host ""
Write-Host "  # Test subscription check:" -ForegroundColor White
Write-Host "  curl 'https://us-central1-echomind-pro-launch.cloudfunctions.net/checkSubscription?email=test@example.com'" -ForegroundColor Gray
Write-Host ""
Write-Host "💡 Tip: View logs anytime with:" -ForegroundColor Yellow
Write-Host "  firebase functions:log" -ForegroundColor White
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "🎉 EchoMind Pro Stripe webhook deployment successful!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
