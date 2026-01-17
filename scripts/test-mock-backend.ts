
// import { mockSaltClient } from '../src/lib/salt/client';
import { PearClient } from '../src/lib/pear/PearClient';
import fs from 'fs';
import path from 'path';
import * as ethers from 'ethers';

// Manually load env for this script since we might not have dotenv
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

async function verifyBackend() {
    console.log("🔍 Verifying Backend Mock Logic...");

    // 1. Salt Mock (Disabled - moved to Real SDK)
    // const balance = await mockSaltClient.getBalance("0x123");
    // console.log("💰 Mock Salt Balance:", balance);

    // 2. Pear Client
    if (!process.env.AGENT_PRIVATE_KEY) {
        console.warn("⚠️ No AGENT_PRIVATE_KEY found in .env.local. Generating random one for test.");
        process.env.AGENT_PRIVATE_KEY = ethers.Wallet.createRandom().privateKey;
    } else {
        console.log("🔑 Using AGENT_PRIVATE_KEY from env.");
    }

    try {
        const client = new PearClient(process.env.AGENT_PRIVATE_KEY);
        console.log("🍐 PearClient Instantiated successfully");

        console.log("🔄 Attempting Real Pear Auth & Fetch Positions...");
        // Trigger auth via a trade call
        const positions = await client.getActiveTrades();
        console.log("✅ Pearl Auth Successful! Positions:", positions.data);
        console.log("Note: If positions is empty list, it means no active trades, but API is working.");

    } catch (e: any) {
        console.error("❌ PearClient Error:", e.message);
        if (e.response) {
            console.error("   Status:", e.response.status);
            console.error("   Data:", e.response.data);
            console.error("   Endpoint:", e.config.url);
        } else {
            console.error(e);
        }
    }
}

verifyBackend();
