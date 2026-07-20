#!/bin/bash
# scripts/load-test/generate-test-token.sh
#
# Outputs instructions for getting a Clerk JWT token to use with load tests.
#
# Usage:
#   ./scripts/load-test/generate-test-token.sh
#   export CLERK_TOKEN='<paste-token-here>'
#   npx artillery run scripts/load-test/dashboard-load.yml

set -euo pipefail

echo "🔑 ResumeFlow Load Test — Token Setup"
echo ""
echo "To run load tests, you need a valid Clerk JWT session token."
echo ""
echo "--- Option 1: Extract from browser (easiest) ---"
echo ""
echo "  1. Open https://resumeflow.harshithkumar.in in Chrome"
echo "  2. Sign in with any account"
echo "  3. Open DevTools → Application → Local Storage"
echo "  4. Find the Clerk entry (usually https://clerk.resumeflow.harshithkumar.in)"
echo "  5. Copy the value of the '__session' key"
echo "  6. Export it:"
echo ""
echo "     export CLERK_TOKEN='<paste-copied-token>'"
echo ""
echo "--- Option 2: Create a dedicated test user ---"
echo ""
echo "  1. Go to https://dashboard.clerk.com → Users → Add User"
echo "  2. Create a test user (e.g., loadtest@resumeflow.dev)"
echo "  3. Sign in as that user in an incognito window"
echo "  4. Extract the __session token as described above"
echo "  5. Use that token for all load test runs"
echo ""
echo "--- Run tests ---"
echo ""
echo "  export TARGET_URL='https://dynamic-warthog-953.convex.cloud'"
echo "  export CLERK_TOKEN='<your-token>'"
echo "  npx artillery run --output reports/dashboard.json scripts/load-test/dashboard-load.yml"
echo ""
