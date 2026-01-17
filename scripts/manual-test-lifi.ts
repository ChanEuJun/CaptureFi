import { createConfig, getRoutes, RoutesRequest } from '@lifi/sdk';
import fs from 'fs';
import path from 'path';

// Manually load env for this script
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            process.env[key.trim()] = value.trim();
        }
    });
}

const apiKey = process.env.NEXT_PUBLIC_LIFI_API_KEY;
if (apiKey) {
    console.log("🔑 Found API Key in env.");
} else {
    console.warn("⚠️ No NEXT_PUBLIC_LIFI_API_KEY found in .env.local");
}

// Initialize LiFi
createConfig({
    integrator: 'CaptureFi_Hackathon',
    apiKey: apiKey,
});

async function testLiFiQuote() {
    console.log('🚀 Testing LiFi SDK Connectivity...');

    // Arbitrum USDC -> HyperEVM USDC (Simulated)
    // Using widely known token addresses (or placeholders if HyperEVM is too new)
    // Arbitrum USDC: 0xaf88d065e77c8cC2239327C5EDb3A432268e5831
    // HyperEVM USDC: Assuming native or finding a placeholder. 
    // If HyperEVM is essentially "mainnet" behavior in the SDK, we need its chain ID.
    // Docs said HyperEVM Mainnet is 999.

    const quoteRequest: RoutesRequest = {
        fromChainId: 42161, // Arbitrum One
        fromTokenAddress: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
        toChainId: 999, // HyperEVM
        toTokenAddress: "0x0000000000000000000000000000000000000000", // Using zero address as placeholder/native if unknown, SDK might complain but it tests connectivity
        fromAmount: "10000000", // 10 USDC (6 decimals)
    };

    console.log('📦 Requesting Quote: Arbitrum -> HyperEVM (Chain 999)...');

    try {
        const routes = await getRoutes(quoteRequest);

        if (routes.routes.length > 0) {
            console.log(`\n✅ Success! Found ${routes.routes.length} routes.`);
            const route = routes.routes[0];
            console.log(`   Best Route: ${route.steps[0].toolDetails.key} ($${route.fromAmountUSD} USD)`);
            console.log(`   Est. Gas Cost: $${route.gasCostUSD}`);
        } else {
            console.log('\n⚠️ Connected to LiFi, but no routes found (Expected if Liquidity is low or Chain ID 999 is not fully public yet).');
        }
    } catch (error: any) {
        console.error('\n💥 LiFi Quote Error:', error.message);
        console.log('Details:', JSON.stringify(error, null, 2));
    }
}

testLiFiQuote();
