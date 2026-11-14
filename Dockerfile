# syntax=docker/dockerfile:1

# ---- Dependencies -----------------------------------------------------------
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---- Build ------------------------------------------------------------------
FROM node:20-alpine AS builder
WORKDIR /app
# Public site URL for Open Graph tags; NEXT_PUBLIC_* values are inlined at build time.
ARG NEXT_PUBLIC_SITE_URL=""
ENV NEXT_TELEMETRY_DISABLED=1 \
    NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---- Runtime ----------------------------------------------------------------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

# `output: 'standalone'` bundles only the files the server needs.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
# The dataset is read at runtime by the API routes.
COPY --from=builder --chown=nextjs:nodejs /app/data ./data

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
