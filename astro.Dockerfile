FROM oven/bun:1.1.38-alpine

WORKDIR /home/bun/app

COPY package.json ./
COPY packages/astro ./packages/astro
COPY packages/shared ./packages/shared

RUN bun install

WORKDIR /home/bun/app/packages/astro

ENV ASTRO_TELEMETRY_DISABLED=1

RUN bun run build

EXPOSE 3000
