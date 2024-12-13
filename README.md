# volunteer-scheduler

## Frontend Stack

* [Park UI](https://park-ui.com/) ([Panda CSS](https://panda-css.com/) & [Ark UI](https://ark-ui.com/)) - Style, UI components, etc.
* [SolidJS](https://www.solidjs.com/) - Rendering, Reactivity (like React, Vue, ...)
* [Astro](https://astro.build/) - Server, SSR or SSG, etc. (similar to Next.js, Nuxt.js)

## Backend Stack

* [Payload CMS](https://payloadcms.com/) - Database abstraction, API, etc.
* [Next.js](https://nextjs.org/) & [React](https://react.dev/) - The Payload backend UI

## How to get started with development

1. Install all dependencies:
   ```shell
   bun install
   ```

2. Create a `.env` file and generate a secret key for Payload:
   ```shell
   cp packages/shared/.env.example packages/shared/.env
   sed -i -e "s/YOUR_SECRET_HERE/$(openssl rand -hex 32)/g" packages/shared/.env
   ```

3. Start a database container:
   ```shell
   docker-compose -f docker-compose.db.yml up
   ```

4. Start Payload:
   ```shell
   cd packages/payload
   bun run dev
   ```

5. Start Astro:
   ```shell
   cd packages/astro
   bun run dev
   ```

## Production deployment

Use `docker-compose` to build and run the whole stack including a database container:
```shell
docker-compose -f docker-compose.deploy.yml up
```

Or build and run the images individually:
```shell
# Astro:
docker build -f Dockerfile.astro -t ghcr.io/desering/astro:latest .
docker run -p 3000:3000 --env-file packages/shared/.env ghcr.io/desering/astro:latest

# Payload:
docker build -f Dockerfile.payload -t ghcr.io/desering/payload:latest .
docker run -p 3000:3000 --env-file packages/shared/.env ghcr.io/desering/payload:latest
```
