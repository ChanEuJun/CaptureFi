const ethers = require('ethers');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const PEAR_PRIVATE_KEY = process.env.PEAR_PRIVATE_KEY;
const PEAR_API_URL = process.env.PEAR_API_URL || 'https://hl-v2.pearprotocol.io';
const PEAR_CLIENT_ID = process.env.PEAR_CLIENT_ID || 'APITRADER';

async function debugPear() {
    if (!PEAR_PRIVATE_KEY) {
        console.error('PEAR_PRIVATE_KEY is not set in .env');
        return;
    }

    try {
        const wallet = new ethers.Wallet(PEAR_PRIVATE_KEY);
        const address = await wallet.getAddress();
        console.log(`Debug Pear: Starting flow for address ${address}`);

        // 1. Get EIP-712 Message
        console.log('\n--- 1. Fetching EIP-712 Message ---');
        console.log(`URL: ${PEAR_API_URL}/auth/eip712-message?address=${address}&clientId=${PEAR_CLIENT_ID}`);
        const messageRes = await fetch(`${PEAR_API_URL}/auth/eip712-message?address=${address}&clientId=${PEAR_CLIENT_ID}`);
        console.log(`Status: ${messageRes.status}`);
        if (!messageRes.ok) {
            console.error('Failed to get EIP-712 message:', await messageRes.text());
            return;
        }
        const eip712 = await messageRes.json();
        console.log('EIP-712 Response:', JSON.stringify(eip712, null, 2));

        // 1.5 Try to get Approval Message
        console.log('\n--- 1.5 Fetching Approval Message (Test) ---');
        const approvalRes = await fetch(`${PEAR_API_URL}/auth/eip712-message?address=${address}&clientId=${PEAR_CLIENT_ID}&action=approveAgent`);
        console.log(`Status: ${approvalRes.status}`);
        if (approvalRes.ok) {
            const approvalMsg = await approvalRes.json();
            console.log('Approval Message Response:', JSON.stringify(approvalMsg, null, 2));
        } else {
            console.log('No specific approval message endpoint found via action param.');
        }
        console.log('\n--- 2. Signing Message ---');
        const types = { ...eip712.types };
        delete types.EIP712Domain;
        const message = eip712.value || eip712.message;
        const signature = await wallet.signTypedData(eip712.domain, types, message);
        console.log('Signature:', signature);

        // 3. Login
        console.log('\n--- 3. Authenticating (Login) ---');
        const loginPayload = {
            method: 'eip712',
            address: address.toLowerCase(),
            clientId: PEAR_CLIENT_ID,
            details: {
                signature,
                timestamp: eip712.timestamp || message.timestamp
            }
        };
        console.log('Login Payload:', JSON.stringify(loginPayload, null, 2));

        const loginRes = await fetch(`${PEAR_API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loginPayload)
        });
        console.log(`Status: ${loginRes.status}`);
        const loginData = await loginRes.json();
        if (!loginRes.ok) {
            console.error('Login failed:', JSON.stringify(loginData, null, 2));
            return;
        }
        const { accessToken } = loginData;
        console.log('Access Token Received');

        // 4. Check Agent Wallet
        console.log('\n--- 4. Checking Agent Wallet ---');
        const agentRes = await fetch(`${PEAR_API_URL}/agentWallet`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        console.log(`Status: ${agentRes.status}`);
        const agentData = await agentRes.json();
        console.log('Agent Wallet Response:', JSON.stringify(agentData, null, 2));

        let agentAddress = agentData.agentWalletAddress;

        if (!agentAddress) {
            console.log('Agent Wallet not found or empty, creating one...');
            const createAgentRes = await fetch(`${PEAR_API_URL}/agentWallet`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            console.log(`Create Status: ${createAgentRes.status}`);
            const createData = await createAgentRes.json();
            console.log('Create Response:', JSON.stringify(createData, null, 2));
            agentAddress = createData.agentWalletAddress;
        }

        if (!agentAddress) {
            console.error('Could not obtain an agent wallet address. Stopping.');
            return;
        }

        // 4.5 Check Balances
        console.log('\n--- 4.5 Checking Balances ---');
        const balanceRes = await fetch(`${PEAR_API_URL}/vault-wallet/balances`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        console.log(`Status: ${balanceRes.status}`);
        const balanceData = await balanceRes.json();
        console.log('Balances Response:', JSON.stringify(balanceData, null, 2));

        // 5. Execute Trade
        console.log('\n--- 5. Executing Position ---');
        const tradePayload = {
            slippage: 0.05,
            executionType: 'SYNC',
            leverage: 5,
            usdValue: 1, // Minimum amount for testing
            longAssets: [{ asset: 'SOL', weight: 1.0 }],
            shortAssets: [{ asset: 'BTC', weight: 1.0 }]
        };
        console.log('Trade Payload:', JSON.stringify(tradePayload, null, 2));

        const tradeRes = await fetch(`${PEAR_API_URL}/positions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(tradePayload)
        });

        console.log(`Status: ${tradeRes.status}`);
        const tradeText = await tradeRes.text();
        console.log('Raw Trade Response:', tradeText);
        try {
            const tradeData = JSON.parse(tradeText);
            if (!tradeRes.ok) {
                console.error('Trade failed:', JSON.stringify(tradeData, null, 2));
            } else {
                console.log('Trade Successful:', JSON.stringify(tradeData, null, 2));
            }
        } catch (e) {
            console.error('Could not parse trade response as JSON');
        }

    } catch (err) {
        console.error('Debug script error:', err);
    }
}

debugPear();
