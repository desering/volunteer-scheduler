FROM oven/bun:1.1.38-alpine as build

WORKDIR /home/bun/app

COPY package.json ./
COPY packages/payload ./packages/payload
COPY packages/shared ./packages/shared

RUN bun install

WORKDIR /home/bun/app/packages/payload

ENV NEXT_TELEMETRY_DISABLED=1

RUN bun run build

FROM oven/bun:1.1.38-alpine

WORKDIR /home/node/app/

COPY --from=build /home/bun/app/packages/payload/.next/ ./

EXPOSE 3000

CMD ["node", "standalone/packages/payload/server.js"]
