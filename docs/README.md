# volunteer-scheduler

Repo for the Volunteer Scheduler project.

## Tech Stack

* [Park UI](https://park-ui.com/) ([Panda CSS](https://panda-css.com/) & [Ark UI](https://ark-ui.com/)) - Style, UI components, etc.
* [Payload CMS](https://payloadcms.com/) - Database abstraction, API, etc.
* [Next.js](https://nextjs.org/) & [React](https://react.dev/)

## How to get started with development

1. Install all dependencies:
   ```shell
   bun install
   ```

2. Create a `.env` file and generate a secret key for Payload:
   ```shell
   cp .env.example .env
   sed -i -e "s/YOUR_SECRET_HERE/$(openssl rand -hex 32)/g" .env
   ```

3. Start a database container:
   ```shell
   docker-compose -f docker-compose.db.yml up
   ```

4. Start the app:
   ```shell
   bun run dev
   ```
