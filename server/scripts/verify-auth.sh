#!/usr/bin/env bash
# Smoke test for the auth chain: creates a throwaway Supabase user, calls the
# API with its access token, then deletes the user. Requires the API running.
set -euo pipefail

cd "$(dirname "$0")/.."
set -a
# shellcheck disable=SC1091
source .env.local
set +a

API="${API:-http://localhost:4000}"
# Any valid project key satisfies the apikey header on the token endpoint.
APIKEY="${SUPABASE_ANON_KEY:-$SUPABASE_SERVICE_ROLE_KEY}"
EMAIL="verify-auth-$(date +%s)@example.com"
PASSWORD="verify-auth-$(date +%s)-pw"

json() { python3 -c "import json,sys; d=json.load(sys.stdin); print(d$1 if d$1 is not None else '')" 2>/dev/null || true; }

echo "1. creating throwaway user $EMAIL"
USER_ID=$(curl -s -X POST "$SUPABASE_URL/auth/v1/admin/users" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"email_confirm\":true}" | json "['id']")

if [ -z "$USER_ID" ]; then
  echo "   failed to create user"
  exit 1
fi
echo "   user id: $USER_ID"

cleanup() {
  echo "4. deleting throwaway user"
  curl -s -o /dev/null -X DELETE "$SUPABASE_URL/auth/v1/admin/users/$USER_ID" \
    -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
    -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY"
  echo "   done"
}
trap cleanup EXIT

echo "2. exchanging password for an access token"
TOKEN=$(curl -s -X POST "$SUPABASE_URL/auth/v1/token?grant_type=password" \
  -H "apikey: $APIKEY" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" | json "['access_token']")

if [ -z "$TOKEN" ]; then
  echo "   no access token returned (is the Email provider enabled?)"
  exit 1
fi
echo "   token length: ${#TOKEN}"

echo "3. GET $API/api/media with that token"
curl -s -w "\n   HTTP %{http_code}\n" "$API/api/media" -H "Authorization: Bearer $TOKEN"
