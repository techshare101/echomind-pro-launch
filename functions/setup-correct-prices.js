// Setup correct Stripe prices for EchoMind Pro
const Stripe = require('stripe');

// Get key from command line argument or environment
const stripeKey = process.argv[2] || process.env.STRIPE_SECRET_KEY;

if (!stripeKey) {
  console.error('❌ Error: STRIPE_SECRET_KEY not provided!');
  console.log('\nUsage: node setup-correct-prices.js YOUR_STRIPE_KEY_HERE');
  process.exit(1);
}

const stripe = new Stripe(stripeKey, { apiVersion: '2024-12-18.acacia' });

async function setupPrices() {
  try {
    console.log('🚀 Setting up EchoMind Pro subscription prices...\n');

    // First, list existing prices to see what we have
    console.log('📋 Listing existing prices in your Stripe account...\n');
    const existingPrices = await stripe.prices.list({ limit: 20 });
    
    // Find $4.99/month price
    let monthlyPrice = existingPrices.data.find(p => 
      p.recurring && 
      p.recurring.interval === 'month' && 
      p.unit_amount === 499
    );
    
    // Find or check for $49.99/year price
    let annualPrice = existingPrices.data.find(p => 
      p.recurring && 
      p.recurring.interval === 'year' && 
      p.unit_amount === 4999
    );

    let productId;

    if (monthlyPrice) {
      console.log('✅ Found existing Monthly Price:', monthlyPrice.id);
      console.log('   → $4.99/month recurring');
      productId = monthlyPrice.product;
    } else {
      console.log('⚠️  No $4.99/month price found. Creating new product and prices...');
      
      // Create new product
      const product = await stripe.products.create({
        name: 'EchoMind Pro',
        description: 'Unlimited AI-powered summaries and advanced features'
      });
      productId = product.id;
      console.log('📦 Created new product:', productId);
      
      // Create monthly price
      monthlyPrice = await stripe.prices.create({
        product: productId,
        unit_amount: 499,
        currency: 'usd',
        recurring: {
          interval: 'month',
          interval_count: 1
        },
        nickname: 'EchoMind Pro - Monthly'
      });
      console.log('✅ Created Monthly Price:', monthlyPrice.id);
    }

    console.log('📦 Product ID:', productId, '\n');

    // Create or use existing Annual Price ($49.99/year)
    if (annualPrice) {
      console.log('✅ Found existing Annual Price:', annualPrice.id);
      console.log('   → $49.99/year recurring\n');
    } else {
      console.log('Creating Annual Price ($49.99/year)...');
      annualPrice = await stripe.prices.create({
        product: productId,
        unit_amount: 4999, // $49.99 in cents
        currency: 'usd',
        recurring: {
          interval: 'year',
          interval_count: 1
        },
        nickname: 'EchoMind Pro - Annual'
      });
      console.log('✅ Annual Price ID:', annualPrice.id);
      console.log('   → $49.99/year recurring\n');
    }

    console.log('🎉 Success! Now run these Firebase commands:\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`firebase functions:secrets:set STRIPE_PRICE_ID_MONTHLY="${monthlyPrice.id}"`);
    console.log(`firebase functions:secrets:set STRIPE_PRICE_ID_ANNUAL="${annualPrice.id}"`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('Then deploy with: firebase deploy --only functions\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

setupPrices();
