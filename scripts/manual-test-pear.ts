
import fetch from 'node-fetch'; // Standard fetch might be available depending on node version, but robust script usually handles it. 
// Actually since the project is Next.js, we can probably use native fetch if Node version is recent, or just standard script logic.

async function testPearEndpoint() {
    const API_URL = 'http://localhost:3000/api/signal';

    console.log(`🚀 Testing Pear API Integration at ${API_URL}`);

    // Mock Payload similar to what the LLM would generate
    const payload = {
        amount: 50,
        strategy: {
            type: "PAIR",
            intent: "Terminal Test Strategy",
            longTokens: ["OP"],
            shortTokens: ["ETH"],
            leverage: 20000 // 2x
        }
    };

    console.log('📦 Sending Payload:', JSON.stringify(payload, null, 2));

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok) {
            console.log('\n✅ Success! Trade Executed.');
            console.log('TxHash:', data.txHash);
            console.log('Response Data:', data);
        } else {
            console.error('\n❌ API Error:', data);
        }

    } catch (error) {
        console.error('\n💥 Connection Failed:', error.message);
        console.log('Make sure "npm run dev" is running on port 3000.');
    }
}

// Check environment usage
console.log("Note: This script calls your local API. Ensure 'npm run dev' is running.");
testPearEndpoint();
