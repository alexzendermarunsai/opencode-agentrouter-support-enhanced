#!/bin/bash
# update-models.sh - Auto-discover and list current AgentRouter models
# Usage: ./scripts/update-models.sh

set -e

PROXY_URL="http://127.0.0.1:4000"
API_URL="https://agentrouter.org/v1"

echo "=== AgentRouter Model Discovery ==="
echo ""

# Check if proxy is running
echo "1. Checking proxy status..."
if curl -s "$PROXY_URL/" > /dev/null 2>&1; then
    echo "   ✓ Proxy is running at $PROXY_URL"
else
    echo "   ✗ Proxy is not running. Start it with: node agenrouter_server.js"
    exit 1
fi

echo ""
echo "2. Fetching models from proxy..."
MODELS=$(curl -s "$PROXY_URL/v1/models")

if echo "$MODELS" | jq -e '.data' > /dev/null 2>&1; then
    echo "   ✓ Models retrieved successfully"
    echo ""
    echo "=== Available Models ==="
    echo "$MODELS" | jq -r '.data[] | "  • \(.id) (\(.owned_by // "unknown"))"'
    echo ""
    echo "Total models: $(echo "$MODELS" | jq '.data | length')"
else
    echo "   ✗ Failed to fetch models from proxy"
    echo "   Response: $MODELS"
    exit 1
fi

echo ""
echo "=== Quick Commands ==="
echo "  List model IDs only:"
echo "    curl -s $PROXY_URL/v1/models | jq -r '.data[].id'"
echo ""
echo "  Get full model details:"
echo "    curl -s $PROXY_URL/v1/models | jq"
echo ""
echo "  Test a specific model:"
echo "    curl -s -X POST $PROXY_URL/v1/chat/completions \\"
echo "      -H 'Content-Type: application/json' \\"
echo "      -d '{\"model\": \"$(echo "$MODELS" | jq -r '.data[0].id')\", \"messages\": [{\"role\": \"user\", \"content\": \"Hello\"}]}'"
