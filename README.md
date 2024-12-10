# volunteer-scheduler

## Frontend Stack

* [Park UI](https://park-ui.com/) ([Panda CSS](https://panda-css.com/) & [Ark UI](https://ark-ui.com/)) - Style, UI components, etc.
* [SolidJS](https://www.solidjs.com/) - Reactivity, State, Routing, etc.
* [Astro](https://astro.build/) - Server, SSR or SSG, etc. (similar to Next.js, Nuxt.js)

## Backend Stack

* [Payload CMS](https://payloadcms.com/) - Database abstraction, API, etc.
* [Next.js](https://nextjs.org/) & [React](https://react.dev/) - The Payload backend UI

## How to get started with development

Install all dependencies:

```shell
bun install
```

Start a database container:
```shell
docker-compose -f docker-compose.db.yml up
```

Start Payload:
```shell
cd packages/payload
bun run dev
```

Start Astro:
```shell
cd packages/astro
bun run dev
```

## Production deployment

This builds docker images for both Payload and Astro, and then starts a PostgreSQL database and both applications:

```shell
docker-compose -f docker-compose.deploy.yml up
```
