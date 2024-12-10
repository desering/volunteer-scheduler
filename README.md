# volunteer-scheduler

## Frontend Stack

* [Park UI](https://park-ui.com/) ([Panda CSS](https://panda-css.com/) & [Ark UI](https://ark-ui.com/)) - Style, UI components, etc.
* [SolidJS](https://www.solidjs.com/) - Reactivity, State, Routing, etc.
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
   cat packages/shared/.env.example | sed "s/YOUR_SECRET_HERE/$(openssl rand -hex 32)/g" > packages/shared/.env
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

This builds docker images for both Payload and Astro, and then starts a PostgresSQL database and both applications:

```shell
docker-compose -f docker-compose.deploy.yml up
```
