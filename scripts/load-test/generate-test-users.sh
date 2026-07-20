#!/usr/bin/env bash
# scripts/load-test/generate-test-users.sh
#
# Creates N test users via Clerk API, generates session tokens, and writes
# them to test-users.csv for Artillery load tests.
#
# Prerequisites:
#   - CLERK_SECRET_KEY env var set (from https://dashboard.clerk.com → API Keys)
#   - jq installed (brew install jq)
#   - Clerk JWT template named "convex" (the default created by Clerk+Convex integration)
#
# Usage:
#   export CLERK_SECRET_KEY='sk_test_...'
#   ./scripts/load-test/generate-test-users.sh 50
#
# Output: scripts/load-test/test-users.csv (userId,clerkToken)
#
# Each test user:
#   - Email: loadtest-N@resumeflow.dev
#   - Plan: free (set Clerk metadata so the Convex webhook creates the user)
#   - IMPORTANT: After creation, manually upgrade test users to "pro" in the
#     Convex dashboard to bypass free-tier rate limits during load tests.
#     (See README.md for details.)

set -euo pipefail

COUNT="${1:-10}"
OUTPUT_DIR="$(cd "$(dirname "$0")" && pwd)"
CSV="${OUTPUT_DIR}/test-users.csv"
CLERK_API="https://api.clerk.com/v1"

if [ -z "${CLERK_SECRET_KEY:-}" ]; then
  echo "❌ CLERK_SECRET_KEY environment variable is not set."
  echo "   Get it from https://dashboard.clerk.com → API Keys"
  exit 1
fi

if ! command -v jq &>/dev/null; then
  echo "❌ jq is required. Install it: brew install jq"
  exit 1
fi

echo "🧪 Generating ${COUNT} load-test users via Clerk API..."
echo "userId,clerkToken" > "$CSV"
CREATED=0
FAILED=0

for i in $(seq 1 "$COUNT"); do
  EMAIL="loadtest-${i}@resumeflow.dev"
  PASSWORD="$(openssl rand -base64 18)"

  # ── Step 1: Create the user via Clerk API ──
  CREATE_RESPONSE=$(curl -s -X POST "${CLERK_API}/users" \
    -H "Authorization: Bearer ${CLERK_SECRET_KEY}" \
    -H "Content-Type: application/json" \
    -d "$(cat <<EOF
{
  "email_address": ["${EMAIL}"],
  "password": "${PASSWORD}",
  "public_metadata": {
    "onboardingComplete": true,
    "loadtest": true
  },
  "skip_password_checks": true,
  "skip_password_requirement": false
}
EOF
  )")

  USER_ID=$(echo "$CREATE_RESPONSE" | jq -r '.id // empty')

  if [ -z "$USER_ID" ] || [ "$USER_ID" = "null" ]; then
    ERROR=$(echo "$CREATE_RESPONSE" | jq -r '.errors[0].message // "Unknown error"')
    echo "  ⚠️  Failed to create user ${EMAIL}: ${ERROR}"
    FAILED=$((FAILED + 1))
    continue
  fi

  # ── Step 2: Set onboarding metadata ──
  curl -s -X PATCH "${CLERK_API}/users/${USER_ID}/metadata" \
    -H "Authorization: Bearer ${CLERK_SECRET_KEY}" \
    -H "Content-Type: application/json" \
    -d '{
      "public_metadata": {
        "onboardingComplete": true,
        "loadtest": true
      }
    }' > /dev/null

  # ── Step 3: Create a session ──
  SESSION_RESPONSE=$(curl -s -X POST "${CLERK_API}/sessions" \
    -H "Authorization: Bearer ${CLERK_SECRET_KEY}" \
    -H "Content-Type: application/json" \
    -d "{\"user_id\": \"${USER_ID}\"}")

  SESSION_ID=$(echo "$SESSION_RESPONSE" | jq -r '.id // empty')

  if [ -z "$SESSION_ID" ] || [ "$SESSION_ID" = "null" ]; then
    ERROR=$(echo "$SESSION_RESPONSE" | jq -r '.errors[0].message // "Unknown error"')
    echo "  ⚠️  Failed to create session for ${EMAIL}: ${ERROR}"
    echo "${USER_ID},MISSING_SESSION" >> "$CSV"
    FAILED=$((FAILED + 1))
    continue
  fi

  # ── Step 4: Get session JWT via Clerk JWT template ──
  # The Clerk+Convex integration creates a JWT template named "convex".
  # Try it first, then fall back to "default".
  TOKEN=""
  for TEMPLATE in "convex" "default"; do
    TOKEN_RESPONSE=$(curl -s -X POST \
      "${CLERK_API}/sessions/${SESSION_ID}/tokens?template_id=${TEMPLATE}" \
      -H "Authorization: Bearer ${CLERK_SECRET_KEY}")

    TOKEN=$(echo "$TOKEN_RESPONSE" | jq -r '.jwt // empty')

    if [ -n "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
      break
    fi
  done

  if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
    echo "  ⚠️  Could not extract JWT for ${EMAIL}."
    echo "      Make sure your Clerk JWT templates include one named 'convex' or 'default'."
    echo "      See: https://dashboard.clerk.com → JWT Templates"
    echo "${USER_ID},MISSING_JWT" >> "$CSV"
    FAILED=$((FAILED + 1))
    continue
  fi

  echo "${USER_ID},${TOKEN}" >> "$CSV"
  CREATED=$((CREATED + 1))
  echo "  ✅ [${i}/${COUNT}] ${EMAIL} → ${USER_ID}"

  # Brief pause to avoid rate-limiting Clerk API
  sleep 0.5
done

echo ""
echo "═══════════════════════════════════════════"
echo "  ✅ ${CREATED} users created successfully"
echo "  ⚠️  ${FAILED} failures"
echo "  📁 CSV: ${CSV}"
echo "═══════════════════════════════════════════"
echo ""
if [ "$CREATED" -gt 0 ]; then
  echo "⚠️  Next: Upgrade test users to Pro plan in Convex dashboard!"
  echo "   Without Pro plan, free-tier rate limits (20 chats/day, 500cr/resume)"
  echo "   will cause tests to fail early. See README.md for instructions."
  echo ""
fi
echo "Then run:"
echo "  export CONVEX_URL='https://your-project.convex.cloud'"
echo "  npx artillery run scripts/load-test/dashboard-load.yml"
echo ""
