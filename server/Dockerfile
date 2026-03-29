# ──────────────────────────────────────────────────────────────
#  Finora – Backend Dockerfile  (Node.js + Express + Prisma)
#  Multi-stage build:  deps → builder → runner
# ──────────────────────────────────────────────────────────────

# ── Stage 1: Install ALL dependencies (including devDeps) ─────
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# ── Stage 2: Build TypeScript ──────────────────────────────────
FROM node:20-alpine AS builder
RUN apk add --no-cache openssl
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client before tsc build
RUN npx prisma generate

# Compile TypeScript → dist/
RUN npm run build

# ── Stage 3: Production image ──────────────────────────────────
FROM node:20-alpine AS runner
RUN apk add --no-cache openssl libc6-compat
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser  --system --uid 1001 express

# Copy compiled output
COPY --from=builder /app/dist ./dist

# Copy prisma schema & generated client (needed at runtime)
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Create uploads and logs directories
RUN mkdir -p /app/uploads /app/logs && chown -R express:nodejs /app/uploads /app/logs

USER express

EXPOSE 5000

# Run Prisma migrate deploy then start the compiled server
# Using a shell entrypoint so we can run multiple commands
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
