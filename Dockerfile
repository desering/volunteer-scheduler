FROM oven/bun:1.3.5-alpine AS base

WORKDIR /app

FROM base AS deps

COPY package.json bun.lock ./

RUN bun install --no-save --frozen-lockfile

FROM base AS build

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

RUN bun run build

FROM base AS run

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV TZ=UTC

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

HEALTHCHECK \
  --interval=10s \
  --timeout=1s \
  --start-period=5s \
  --start-interval=5s \
  --retries=3 \
  CMD wget -q -O- http://0.0.0.0:3000/health/ready || exit 1

CMD ["bun", "./server.js"]
