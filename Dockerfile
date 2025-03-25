FROM oven/bun:1.1.38-alpine AS build

ENV NEXT_TELEMETRY_DISABLED=1

WORKDIR /home/bun/app

COPY package.json bun.lockb ./

RUN bun install

COPY . .

RUN bun run build

FROM oven/bun:1.1.38-alpine

WORKDIR /home/bun/app

COPY --from=build /home/bun/app/.next/standalone ./
COPY --from=build /home/bun/app/.next/static ./.next/static

ENV TZ=UTC
EXPOSE 3000

RUN ls -la

# CMD ["node", "packages/payload/server.js"]
