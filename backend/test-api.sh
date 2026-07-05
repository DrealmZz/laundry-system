#!/bin/bash

BASE_URL="http://localhost:3000/api/v1"

echo "=== Testing Laundry System API ==="
echo ""

# 1. Health check
echo "1. Health check..."
curl -s "$BASE_URL" | jq . 2>/dev/null || curl -s "$BASE_URL"
echo ""

# 2. Login
echo "2. Login..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"identifier": "budi", "password": "password123"}')
echo "$LOGIN_RESPONSE" | jq . 2>/dev/null || echo "$LOGIN_RESPONSE"
TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.token' 2>/dev/null)
echo ""

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
  echo "ERROR: Failed to get token. Exiting."
  exit 1
fi

echo "Token obtained: ${TOKEN:0:50}..."
echo ""

# 3. Test shifts
echo "3. Testing shifts..."
curl -s -X GET "$BASE_URL/shifts" \
  -H "Authorization: Bearer $TOKEN" | jq . 2>/dev/null || curl -s -X GET "$BASE_URL/shifts" -H "Authorization: Bearer $TOKEN"
echo ""

# 4. Test audit
echo "4. Testing audit..."
curl -s -X GET "$BASE_URL/audit" \
  -H "Authorization: Bearer $TOKEN" | jq . 2>/dev/null || curl -s -X GET "$BASE_URL/audit" -H "Authorization: Bearer $TOKEN"
echo ""

# 5. Test machines
echo "5. Testing machines..."
curl -s -X GET "$BASE_URL/mesin" \
  -H "Authorization: Bearer $TOKEN" | jq . 2>/dev/null || curl -s -X GET "$BASE_URL/mesin" -H "Authorization: Bearer $TOKEN"
echo ""

echo "=== Testing Complete ==="
