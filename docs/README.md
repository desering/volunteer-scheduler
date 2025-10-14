# volunteer-scheduler

Repo for the Volunteer Scheduler project.

## Tech Stack

* [Park UI](https://park-ui.com/) ([Panda CSS](https://panda-css.com/) & [Ark UI](https://ark-ui.com/)) - Style, UI components, etc.
* [Payload CMS](https://payloadcms.com/) - Database abstraction, API, etc.
* [Next.js](https://nextjs.org/) & [React](https://react.dev/)

## How to get started with development

### Setup & run

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
   docker compose -f docker-compose.db.yml up
   ```

4. Start Next:
   ```shell
   bun dev
   ```

### Create a user and event

After running the dev server, it is possible to access the app (default:
`localhost:3000`), but there will be no events to show. To fix this, create an
admin account and an event:

1. Navigate to `localhost:3000/admin`
2. Fill in the form. Make sure to select `admin` as the user role. This process is only necessary for first time setup or when rebuilding the db.

Now, you can create and publish new event templates, which will show up in the app for non-privileged users.

### Connect to te database

To connect to the database container:

```shell
docker exec -it volunteer-scheduler-postgres-1 psql -U schedule
```
