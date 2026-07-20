#!/usr/bin/env bash
set -euo pipefail

# ──────────────────────────────────────────────
# ResumeFlow — SEO Monitoring Setup
# ──────────────────────────────────────────────
# This script helps you set up Google Search Console
# monitoring. Run after deploying to production.
#
# Usage:
#   bash scripts/setup-seo-monitoring.sh
#
# Prerequisites:
#   1. Python 3.8+ with pip
#   2. Node.js 18+
#   3. Project dependencies installed (npm install)
# ──────────────────────────────────────────────

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
ENV_FILE="$PROJECT_DIR/.env.local"

echo "================================================"
echo "  ResumeFlow — SEO Monitoring Setup"
echo "================================================"
echo ""

# ── Step 1: Check Environment ──
echo "── Step 1: Checking Environment ──"

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VER=$(node --version)
    echo "  ✓ Node.js: $NODE_VER"
else
    echo "  ✗ Node.js not found. Install Node.js 18+ and try again."
    exit 1
fi

# Check Python
if command -v python3 &> /dev/null; then
    PY_VER=$(python3 --version)
    echo "  ✓ Python: $PY_VER"
else
    echo "  ✗ Python 3 not found (optional, needed for GSC scripts)"
fi

echo ""

# ── Step 2: Check SEO Infrastructure Files ──
echo "── Step 2: Checking SEO Files ──"

FILES_TO_CHECK=(
    "app/sitemap.ts"
    "app/robots.ts"
    "app/layout.tsx"
    "public/llms.txt"
    "SEO-IMPLEMENTATION-PLAN.md"
)

for file in "${FILES_TO_CHECK[@]}"; do
    if [ -f "$PROJECT_DIR/$file" ]; then
        echo "  ✓ $file"
    else
        echo "  ✗ $file MISSING!"
    fi
done

echo ""

# ── Step 3: Check GSC Environment Variables ──
echo "── Step 3: Checking GSC API Credentials ──"

GSC_EMAIL="${GSC_CLIENT_EMAIL:-}"
GSC_KEY="${GSC_PRIVATE_KEY:-}"

if [ -z "$GSC_EMAIL" ] && [ -f "$ENV_FILE" ]; then
    GSC_EMAIL=$(grep -E "^GSC_CLIENT_EMAIL=" "$ENV_FILE" 2>/dev/null | cut -d= -f2- || true)
    GSC_KEY=$(grep -E "^GSC_PRIVATE_KEY=" "$ENV_FILE" 2>/dev/null | cut -d= -f2- || true)
fi

if [ -n "$GSC_EMAIL" ] && [ -n "$GSC_KEY" ]; then
    echo "  ✓ GSC credentials found"
    echo "    Client Email: $GSC_EMAIL"
    echo ""
    echo "  To submit sitemap via API, run:"
    echo "    curl http://localhost:3000/api/seo"
    echo ""
    echo "  Or submit manually at:"
    echo "    https://search.google.com/search-console"
else
    echo "  ⚠ GSC credentials not configured."
    echo ""
    echo "  To set up GSC API access:"
    echo "    1. Go to https://console.cloud.google.com"
    echo "    2. Create a project (or select existing)"
    echo "    3. Enable 'Google Search Console API'"
    echo "    4. Go to IAM → Service Accounts → Create Service Account"
    echo "    5. Generate a JSON key and download it"
    echo "    6. Add to $ENV_FILE:"
    echo "       GSC_CLIENT_EMAIL=your-sa@project.iam.gserviceaccount.com"
    echo '       GSC_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"'
    echo "    7. In GSC → Settings → Users → Add the service account email"
    echo "       with 'Full' permission"
    echo ""
    echo "  Alternatively, submit sitemap manually:"
    echo "    https://search.google.com/search-console → Sitemaps →"
    echo "    paste 'sitemap.xml' and submit"
fi

echo ""

# ── Step 4: SEO Health Score ──
echo "── Step 4: SEO Infrastructure Score ──"

if command -v node &> /dev/null; then
    echo "  Run the SEO health check after starting your dev server:"
    echo "    curl http://localhost:3000/api/seo"
    echo ""
fi

echo "── Quick Links ──"
echo "  Sitemap:          https://resumeflow.harshithkumar.in/sitemap.xml"
echo "  Robots.txt:       https://resumeflow.harshithkumar.in/robots.txt"
echo "  llms.txt:         https://resumeflow.harshithkumar.in/llms.txt"
echo "  GSC Dashboard:    https://search.google.com/search-console"
echo "  GSC API Docs:     https://developers.google.com/webmaster-tools/v3"
echo "  Schema Validator: https://validator.schema.org"
echo "  PageSpeed:        https://pagespeed.web.dev"
echo "  SEO API Check:    http://localhost:3000/api/seo (after starting dev server)"
echo ""
echo "================================================"
echo "  Setup complete!"
echo "================================================"
