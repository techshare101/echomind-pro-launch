// Quick script to create EchoMind Pro subscription prices in Stripe
require('dotenv').config();
const Stripe = require('stripe');

// Get Stripe key from environment
const stripeKey = process.env.STRIPE_SECRET_KEY;

if (!stripeKey) {
  console.error('❌ Error: STRIPE_SECRET_KEY environment variable is not set!');
  console.log('\n💡 Set it with: $env:STRIPE_SECRET_KEY="sk_test_YOUR_KEY_HERE"');
  console.log('Or create a .env file with: STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE');
  process.exit(1);
}

const stripe = new Stripe(stripeKey, { apiVersion: '2024-12-18.acacia' });

async function createPrices() {
  try {
    console.log('🚀 Creating EchoMind Pro subscription prices...\n');

    // Product ID from earlier creation
    const productId = 'prod_TGy0K8reGckvL0';

    // Create Monthly Price ($4.99/month)
    console.log('Creating monthly price ($4.99/month)...');
    const monthlyPrice = await stripe.prices.create({
      product: productId,
      unit_amount: 499, // $4.99 in cents
      currency: 'usd',
      recurring: {
        interval: 'month',
        interval_count: 1
      },
      nickname: 'Monthly Plan'
    });
    console.log('✅ Monthly Price ID:', monthlyPrice.id);

    // Create Annual Price ($49.99/year)
    console.log('\nCreating annual price ($49.99/year)...');
    const annualPrice = await stripe.prices.create({
      product: productId,
      unit_amount: 4999, // $49.99 in cents
      currency: 'usd',
      recurring: {
        interval: 'year',
        interval_count: 1
      },
      nickname: 'Annual Plan'
    });
    console.log('✅ Annual Price ID:', annualPrice.id);

    console.log('\n🎉 Success! Now run these Firebase commands:\n');
    console.log(`firebase functions:config:set stripe.price_id_monthly="${monthlyPrice.id}"`);
    console.log(`firebase functions:config:set stripe.price_id_annual="${annualPrice.id}"`);
    console.log('\nThen deploy with: firebase deploy --only functions');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createPrices();
