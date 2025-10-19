#!/usr/bin/env bash
# ============================================
# 🚀 EchoMind Pro Launch - Stripe Webhook Deploy Script
# ============================================

set -e

echo ""
echo "============================================"
echo "🔥 ECHOMIND PRO STRIPE WEBHOOK DEPLOY START"
echo "============================================"
echo ""

cd "$(dirname "$0")"

# Step 1: Lint the functions directory
echo "🧹 Running ESLint..."
npm run lint || { echo "❌ ESLint failed. Fix errors and re-run."; exit 1; }
echo "✅ ESLint passed successfully!"

# Step 2: Deploy Firebase functions
echo ""
echo "🚀 Deploying Firebase functions..."
firebase deploy --only functions || { echo "❌ Deployment failed."; exit 1; }

# Step 3: Verify deployed functions
echo ""
echo "🔍 Verifying deployment..."
if firebase functions:list | grep -q "stripeWebhook" && firebase functions:list | grep -q "checkSubscription"; then
  echo "✅ Both functions deployed successfully!"
  echo "  • stripeWebhook"
  echo "  • checkSubscription"
else
  echo "❌ One or more functions not found. Check your Firebase logs."
  exit 1
fi

# Step 4: Display function URLs for convenience
echo ""
echo "🌐 Your deployed function endpoints:"
echo ""
echo "📌 Stripe Webhook (copy to Stripe Dashboard):"
echo "https://us-central1-echomind-pro-launch.cloudfunctions.net/stripeWebhook"
echo ""
echo "📌 Subscription Check (for Chrome Extension):"
echo "https://us-central1-echomind-pro-launch.cloudfunctions.net/checkSubscription"

# Step 5: Stripe setup reminder
echo ""
echo "============================================"
echo "✅ DEPLOYMENT COMPLETE!"
echo ""
echo "🔗 Next Step — Add the following endpoint to your Stripe Dashboard:"
echo "https://us-central1-echomind-pro-launch.cloudfunctions.net/stripeWebhook"
echo ""
echo "➡️ Select these events:"
echo "  • payment_intent.succeeded"
echo "  • checkout.session.completed"
echo "  • invoice.payment_succeeded"
echo "  • customer.subscription.deleted"
echo ""
echo "🧪 Test your functions:"
echo ""
echo "  # Test Stripe webhook:"
echo "  stripe trigger payment_intent.succeeded"
echo ""
echo "  # Test subscription check:"
echo "  curl 'https://us-central1-echomind-pro-launch.cloudfunctions.net/checkSubscription?email=test@example.com'"
echo ""
echo "💡 Tip: View logs anytime with:"
echo "  firebase functions:log"
echo ""
echo "============================================"
echo "🎉 EchoMind Pro Stripe webhook deployment successful!"
echo "============================================"
echo ""
