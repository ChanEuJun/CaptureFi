#!/bin/bash

# Base URL
API_URL="http://localhost:3000/api/analyze"

echo "🧪 Testing CaptureFi AI Analysis Endpoint..."
echo "==========================================="

# Function to test a specific narrative
test_narrative() {
    local NAME="$1"
    local TEXT="$2"
    
    echo -e "\n📋 Test Case: $NAME"
    echo "   Input: \"$TEXT\""
    echo "   Sending request..."
    
    RESPONSE=$(curl -s -X POST "$API_URL" \
      -H "Content-Type: application/json" \
      -d "{\"text\":\"$TEXT\"}")
    
    echo "   Response:"
    echo "$RESPONSE" | jq . 2>/dev/null || echo "$RESPONSE"
    echo "-------------------------------------------"
}

# 1. Test "ETH Bear" Scenario (Triggers Mock Short ETH)
test_narrative "Bearish Ethereum" "I think ETH is looking very weak and bear market is resuming."

# 2. Test "Optimism Bull" Scenario (Triggers Mock Long OP)
test_narrative "Bullish Optimism" "OP is showing incredible strength, very bull flag forming."

# 3. Test "Solana King" Scenario (Triggers Mock Long SOL / Short ETH)
test_narrative "Solana Dominance" "Solana is the new king, behaving much better than ETH."

# 4. Test "Generic/Fallback" Scenario (Triggers Default BTC)
test_narrative "Generic Crypto" "Just general crypto market thoughts."

echo -e "\n✅ Testing Complete."
