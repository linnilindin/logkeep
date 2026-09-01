# syntax=docker/dockerfile:1

# Compile TypeScript with dev dependencies available.
FROM node:22-slim AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Resolve production dependencies separately so no build tooling reaches the
# final image.
FROM node:22-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

FROM node:22-slim AS runtime

# The Lambda Web Adapter runs as an external extension: it starts the app, waits
# for the readiness check to pass, then translates each Lambda invocation into an
# ordinary HTTP request against it. The Express app needs no Lambda-specific code
# and the same image runs unchanged on a laptop, Fargate, or EC2.
COPY --from=public.ecr.aws/awsguru/aws-lambda-adapter:1.0.1 /lambda-adapter /opt/extensions/lambda-adapter

ENV NODE_ENV=production
ENV PORT=8080
ENV AWS_LWA_READINESS_CHECK_PATH=/api/health

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package.json ./

USER node
EXPOSE 8080
CMD ["node", "dist/index.js"]
