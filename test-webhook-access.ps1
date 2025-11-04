# Test Webhook Access
# This script tests if the Stripe webhook is now publicly accessible

Write-Host "🧪 Testing Stripe Webhook Access..." -ForegroundColor Cyan
Write-Host ""

$webhookUrl = "https://stripewebhook-evcnapia4q-uc.a.run.app"

try {
    Write-Host "📡 Sending test request to: $webhookUrl" -ForegroundColor Yellow
    
    # Send a POST request (will fail signature verification, but should not get auth error)
    $response = Invoke-WebRequest -Uri $webhookUrl -Method POST -ContentType "application/json" -Body '{}' -ErrorAction Stop
    
    Write-Host "✅ Webhook is accessible!" -ForegroundColor Green
    Write-Host "Status Code: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($response.Content)" -ForegroundColor Gray
    
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    $errorMessage = $_.Exception.Message
    
    if ($statusCode -eq 400) {
        Write-Host "✅ Webhook is accessible! (Got expected 400 - signature verification failed)" -ForegroundColor Green
        Write-Host "This is correct - webhook is public but rejects unsigned requests." -ForegroundColor Cyan
    } elseif ($statusCode -eq 401 -or $statusCode -eq 403) {
        Write-Host "❌ Webhook still requires authentication!" -ForegroundColor Red
        Write-Host "Status Code: $statusCode" -ForegroundColor Red
        Write-Host "Error: $errorMessage" -ForegroundColor Red
        Write-Host ""
        Write-Host "The 'invoker: public' setting may not have been applied yet." -ForegroundColor Yellow
        Write-Host "Wait 1-2 minutes and try again." -ForegroundColor Yellow
    } else {
        Write-Host "⚠️ Unexpected response:" -ForegroundColor Yellow
        Write-Host "Status Code: $statusCode" -ForegroundColor Yellow
        Write-Host "Error: $errorMessage" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. If webhook is accessible (✅), test with Stripe dashboard" -ForegroundColor White
Write-Host "2. Go to: https://dashboard.stripe.com/test/webhooks" -ForegroundColor White
Write-Host "3. Click your webhook → 'Send test webhook'" -ForegroundColor White
Write-Host "4. Select 'checkout.session.completed' event" -ForegroundColor White
Write-Host "5. Check Firebase logs: firebase functions:log --only stripeWebhook" -ForegroundColor White
Write-Host ""
