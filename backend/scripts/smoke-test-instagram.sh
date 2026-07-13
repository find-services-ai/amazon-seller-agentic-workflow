#!/usr/bin/env bash
# Smoke test for the Instagram content pipeline against a running backend.
# Usage: ./scripts/smoke-test-instagram.sh [base_url]
#
# Exercises: register -> seller profile -> stateless preview generation ->
# persisted generate -> approve -> connect a fake Instagram account -> publish
# (expected to fail cleanly without real Meta Graph API credentials).
set -euo pipefail

BASE_URL="${1:-http://localhost:3001}"
EMAIL="smoke-test-$(date +%s)@example.com"
PASSWORD="smoke-test-password-123"
FAIL=0

pass() { echo "  PASS: $1"; }
fail() { echo "  FAIL: $1"; FAIL=1; }

json_get() { node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{try{const v=JSON.parse(d);const p='$1'.split('.').reduce((o,k)=>o&&o[k],v);console.log(p===undefined?'':p)}catch(e){console.log('')}})"; }

echo "== Health check =="
HEALTH=$(curl -sf "$BASE_URL/api/health")
echo "$HEALTH" | grep -q '"status":"ok"' && pass "server is healthy" || fail "server is not healthy: $HEALTH"

echo "== Register throwaway user ($EMAIL) =="
REGISTER=$(curl -sf -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")
TOKEN=$(echo "$REGISTER" | json_get token)
[ -n "$TOKEN" ] && pass "registered and received a token" || { fail "no token in register response: $REGISTER"; exit 1; }

echo "== Create seller profile =="
PROFILE=$(curl -sf "$BASE_URL/api/store/profile" -H "Authorization: Bearer $TOKEN")
echo "$PROFILE" | grep -q '"id"' && pass "seller profile created/fetched" || fail "no seller profile: $PROFILE"

echo "== Stateless preview generation (LLM only, no seller/account needed) =="
PREVIEW=$(curl -s -X POST "$BASE_URL/api/ops/generate-instagram-content" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"product":"Self-Cleaning Pet Slicker Brush","category":"Pet Supplies","originStory":"Hand-assembled in a small Ningbo workshop, 8 years in pet tooling."}')
if echo "$PREVIEW" | grep -q '"error":"LLM not configured'; then
  echo "  SKIP: no LLM provider configured in .env — generation steps below will also be skipped"
  SKIP_LLM=1
else
  echo "$PREVIEW" | grep -q 'caption' && pass "stateless preview generated content" || fail "unexpected preview response: $PREVIEW"
  SKIP_LLM=0
fi

if [ "$SKIP_LLM" = "0" ]; then
  echo "== Persisted generate for seeded product (pet-slicker-brush) =="
  GENERATED=$(curl -sf -X POST "$BASE_URL/api/social/instagram/generate" \
    -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
    -d '{"productSlug":"pet-slicker-brush","originStory":"Hand-assembled in a small Ningbo workshop, 8 years in pet tooling."}')
  CONTENT_ID=$(echo "$GENERATED" | json_get content.id)
  CATEGORY_ID=$(echo "$GENERATED" | json_get content.category_id)
  [ -n "$CONTENT_ID" ] && pass "generated + persisted content id=$CONTENT_ID" || fail "no content id: $GENERATED"

  echo "== Approve content =="
  APPROVED=$(curl -sf -X PATCH "$BASE_URL/api/social/instagram/content/$CONTENT_ID/approve" \
    -H "Authorization: Bearer $TOKEN")
  echo "$APPROVED" | grep -q '"status":"approved"' && pass "content approved" || fail "approve failed: $APPROVED"

  echo "== Connect a fake Instagram account for the category =="
  ACCOUNT=$(curl -sf -X POST "$BASE_URL/api/social/instagram/accounts" \
    -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
    -d "{\"categoryId\":$CATEGORY_ID,\"igBusinessAccountId\":\"17841400000000000\",\"accessToken\":\"FAKE_TEST_TOKEN\"}")
  echo "$ACCOUNT" | grep -q '"ig_business_account_id"' && pass "connected fake instagram account" || fail "account connect failed: $ACCOUNT"

  echo "== Attempt publish (expected to fail — fake token, no real Graph API) =="
  PUBLISH=$(curl -s -X POST "$BASE_URL/api/social/instagram/content/$CONTENT_ID/publish" \
    -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
    -d '{"imageUrl":"https://example.com/product-photo.jpg"}')
  echo "$PUBLISH" | grep -qi 'error' && pass "publish failed cleanly as expected (no real credentials): $(echo "$PUBLISH" | json_get error)" || fail "publish should have failed without real credentials: $PUBLISH"
fi

echo
if [ "$FAIL" = "0" ]; then
  echo "ALL CHECKS PASSED"
else
  echo "SOME CHECKS FAILED — see FAIL lines above"
  exit 1
fi
