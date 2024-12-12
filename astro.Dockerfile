FROM oven/bun:1.1.38-alpine as base

WORKDIR /home/bun/app

COPY package.json bun.lockb ./
COPY packages/astro/package.json ./packages/astro/package.json
COPY packages/payload/package.json ./packages/payload/package.json
COPY packages/shared/package.json ./packages/shared/package.json

FROM base as prod-deps
RUN bun install --production

FROM base as build-deps
RUN bun install

FROM build-deps as build

COPY packages/astro ./packages/astro
COPY packages/payload ./packages/payload
COPY packages/shared ./packages/shared

WORKDIR /home/bun/app/packages/astro

ENV ASTRO_TELEMETRY_DISABLED=1

RUN bun run build

FROM base as runtime

COPY --from=prod-deps /home/bun/app/node_modules/ ./node_modules/
COPY --from=build /home/bun/app/packages/astro/dist/ ./dist/

ENV HOST=0.0.0.0
ENV PORT=3000
EXPOSE 3000

CMD ["bun", "run", "./dist/server/entry.mjs"]
