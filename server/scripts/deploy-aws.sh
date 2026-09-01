#!/usr/bin/env bash
# Builds the API image and deploys it to AWS Lambda behind a Function URL.
#
# Idempotent: safe to re-run. First run creates the ECR repository, IAM role,
# function and Function URL; later runs push a new image and update the config.
#
# Requires: docker, the AWS CLI configured with credentials, and python3.
#
#   AWS_REGION=ap-southeast-2 CORS_ORIGIN=https://logkeep.vercel.app ./scripts/deploy-aws.sh
set -euo pipefail

cd "$(dirname "$0")/.."
set -a
# shellcheck disable=SC1091
source .env.local
set +a

# Match this to your Supabase project's region. Every request hits Postgres, so a
# mismatch adds a round trip to each one.
REGION="${AWS_REGION:-ap-southeast-2}"
REPO="${ECR_REPO:-logkeep-api}"
FUNCTION="${FUNCTION_NAME:-logkeep-api}"
ROLE="${ROLE_NAME:-logkeep-api-lambda-role}"
# Locked down to the deployed frontend after its domain exists.
ALLOWED_ORIGIN="${CORS_ORIGIN:-http://localhost:3000}"

ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
REGISTRY="$ACCOUNT.dkr.ecr.$REGION.amazonaws.com"
TAG=$(git rev-parse --short HEAD 2>/dev/null || date +%s)
IMAGE="$REGISTRY/$REPO:$TAG"

echo "account $ACCOUNT / region $REGION / tag $TAG"

echo "==> ECR repository"
aws ecr describe-repositories --repository-names "$REPO" --region "$REGION" >/dev/null 2>&1 ||
  aws ecr create-repository --repository-name "$REPO" --region "$REGION" \
    --image-scanning-configuration scanOnPush=true >/dev/null

aws ecr get-login-password --region "$REGION" |
  docker login --username AWS --password-stdin "$REGISTRY" >/dev/null

echo "==> build and push $IMAGE"
# Lambda runs the image as-is, so the architecture must match the function's.
docker buildx build --platform linux/arm64 -t "$IMAGE" --push .

echo "==> IAM execution role"
if ! aws iam get-role --role-name "$ROLE" >/dev/null 2>&1; then
  aws iam create-role --role-name "$ROLE" --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Principal": { "Service": "lambda.amazonaws.com" },
      "Action": "sts:AssumeRole"
    }]
  }' >/dev/null
  aws iam attach-role-policy --role-name "$ROLE" \
    --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
  # Role propagation is eventually consistent; creating the function too soon
  # fails with an InvalidParameterValueException about assuming the role.
  echo "    waiting for the new role to propagate"
  sleep 15
fi
ROLE_ARN=$(aws iam get-role --role-name "$ROLE" --query Role.Arn --output text)

export ALLOWED_ORIGIN
ENV_JSON=$(python3 -c "
import json, os
print(json.dumps({'Variables': {
    'SUPABASE_URL': os.environ['SUPABASE_URL'],
    'SUPABASE_SERVICE_ROLE_KEY': os.environ['SUPABASE_SERVICE_ROLE_KEY'],
    'CORS_ORIGIN': os.environ['ALLOWED_ORIGIN'],
    'NODE_ENV': 'production',
}}))
")

if aws lambda get-function --function-name "$FUNCTION" --region "$REGION" >/dev/null 2>&1; then
  echo "==> updating existing function"
  aws lambda update-function-code --function-name "$FUNCTION" --region "$REGION" \
    --image-uri "$IMAGE" >/dev/null
  aws lambda wait function-updated-v2 --function-name "$FUNCTION" --region "$REGION"
  aws lambda update-function-configuration --function-name "$FUNCTION" --region "$REGION" \
    --environment "$ENV_JSON" >/dev/null
  aws lambda wait function-updated-v2 --function-name "$FUNCTION" --region "$REGION"
else
  echo "==> creating function"
  aws lambda create-function --function-name "$FUNCTION" --region "$REGION" \
    --package-type Image --code ImageUri="$IMAGE" --role "$ROLE_ARN" \
    --architectures arm64 --memory-size 1024 --timeout 30 \
    --environment "$ENV_JSON" >/dev/null
  aws lambda wait function-active-v2 --function-name "$FUNCTION" --region "$REGION"
fi

echo "==> Function URL"
if ! aws lambda get-function-url-config --function-name "$FUNCTION" --region "$REGION" >/dev/null 2>&1; then
  # Auth type NONE means AWS does not authenticate callers. That is intended: the
  # API authenticates every request itself in src/middleware/auth.ts.
  aws lambda create-function-url-config --function-name "$FUNCTION" --region "$REGION" \
    --auth-type NONE >/dev/null
  aws lambda add-permission --function-name "$FUNCTION" --region "$REGION" \
    --statement-id FunctionURLAllowPublicAccess \
    --action lambda:InvokeFunctionUrl --principal '*' \
    --function-url-auth-type NONE >/dev/null
fi

URL=$(aws lambda get-function-url-config --function-name "$FUNCTION" --region "$REGION" \
  --query FunctionUrl --output text)

echo
echo "deployed: $URL"
echo "CORS_ORIGIN is currently: $ALLOWED_ORIGIN"
echo
echo "verify with:  API=${URL%/} ./scripts/verify-auth.sh"
