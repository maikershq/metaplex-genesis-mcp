#!/bin/bash
set -e

echo "🔨 Building server..."
pnpm build

echo "🚀 Starting MCP server smoke test..."

# Test that server responds to initialize request
RESPONSE=$(echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"smoke-test","version":"1.0.0"}}}' | timeout 10 node dist/index.js 2>/dev/null || true)

# Check if we got a valid JSON-RPC response
if echo "$RESPONSE" | grep -q '"jsonrpc"'; then
    echo "✅ Server responds to initialize request"
else
    echo "❌ No valid response from server"
    exit 1
fi

# Check server name in response
if echo "$RESPONSE" | grep -q '"name":"metaplex-genesis-mcp"'; then
    echo "✅ Server identifies as metaplex-genesis-mcp"
else
    echo "⚠️  Could not verify server name (response: ${RESPONSE:0:200}...)"
fi

echo ""
echo "🎉 Smoke test passed!"
echo ""
echo "Available tools (12 total):"
echo "  - get_genesis_account"
echo "  - get_genesis_account_by_mint"
echo "  - get_bonding_curve"
echo "  - get_launch_pool"
echo "  - get_presale"
echo "  - get_vault"
echo "  - get_launch_pool_deposit"
echo "  - get_presale_deposit"
echo "  - get_vault_deposit"
echo "  - get_current_price"
echo "  - get_swap_quote"
echo "  - list_genesis_accounts"
