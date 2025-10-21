// Test the Firebase Function endpoint
async function testEndpoint() {
  try {
    console.log('🧪 Testing Firebase Function...\n');
    
    // Test 1: Unified API Function
    console.log('1️⃣ Testing Unified API URL:');
    console.log('   https://us-central1-echomind-pro-launch.cloudfunctions.net/api/createCheckoutSession?plan=monthly\n');
    
    const directResponse = await fetch(
      'https://us-central1-echomind-pro-launch.cloudfunctions.net/api/createCheckoutSession?plan=monthly',
      { method: 'POST' }
    );
    
    if (directResponse.ok) {
      const data = await directResponse.json();
      console.log('   ✅ Unified API Function works!');
      console.log('   Response:', JSON.stringify(data, null, 2), '\n');
    } else {
      console.log('   ❌ Failed:', directResponse.status, directResponse.statusText);
      const text = await directResponse.text();
      console.log('   Error:', text, '\n');
    }
    
    // Test 2: Annual Plan
    console.log('2️⃣ Testing Annual Plan:');
    console.log('   https://us-central1-echomind-pro-launch.cloudfunctions.net/api/createCheckoutSession?plan=annual\n');
    
    const annualResponse = await fetch(
      'https://us-central1-echomind-pro-launch.cloudfunctions.net/api/createCheckoutSession?plan=annual',
      { method: 'POST' }
    );
    
    if (annualResponse.ok) {
      const data = await annualResponse.json();
      console.log('   ✅ Annual plan works!');
      console.log('   Response:', JSON.stringify(data, null, 2), '\n');
    } else {
      console.log('   ❌ Failed:', annualResponse.status, annualResponse.statusText);
      const text = await annualResponse.text();
      console.log('   Error:', text, '\n');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testEndpoint();
