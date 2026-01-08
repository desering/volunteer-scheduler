# volunteer-scheduler

Repo for the Volunteer Scheduler project.

To understand why this project exists and how it differs from existing
solutions, start with
[Vision](explanation/vision-strategy-and-roadmap.md) and
[Purpose](explanation/purpose.md).

## Tech Stack

The `volunteer-scheduler` is a [Next.js](https://nextjs.org/) and
[React](https://react.dev/)-based web application.

We use [Payload CMS](https://payloadcms.com/) as an out-of-the-box backend - it
provides an admin panel, database abstractions, an API, and a lot more that we
would otherwise have to build ourselves.

The frontend is built with [Park UI](https://park-ui.com/)
([Panda CSS](https://panda-css.com/) & [Ark UI](https://ark-ui.com/)), and uses API endpoints
and interfaces exposed by Payload.

## How to get started with development

> [!IMPORTANT]
> This guide is tested on macOS. If you run into steps that work differently on
> Windows or Linux, please open a PR to improve it.

### Prerequisites

Install the following prerequisites:

1. [Docker Desktop](https://docs.docker.com/desktop/) or [Rancher Desktop](https://rancherdesktop.io/)
   * macOS Homebrew: `brew install --cask docker-desktop` or `brew install --cask rancher`
2. The [Bun Javascript Runtime](https://bun.com/)
   * macOS Homebrew: `brew tap oven-sh/bun; brew install bun`
3. The [Node.js Javascript Runtime](https://nodejs.org/en/download)
   * macOS Homebrew: `brew install node`
   * Node.js is required for payload development, see https://github.com/payloadcms/payload/issues/15015

### Run the project locally

Then, follow the steps below to start the project:

1. Clone the repository:
   ```shell
   git clone git@github.com:desering/volunteer-scheduler.git
   ```

2. Install all dependencies:
   ```shell
   bun install
   ```

3. Create a `.env` file and generate a secret key for Payload:
   ```shell
   cp .env.example .env
   sed -i '' -e "s/PAYLOAD_SECRET_PLACEHOLDER/$(openssl rand -hex 32)/g" .env
   ```

4. Start additional development services (database, mail):
   ```shell
   docker compose -f docker-compose.dev.yml up
   ```

5. Start the Next.js development server:
   ```shell
   bun --bun dev
   ```

You should now be able to access your local version of `volunteer-scheduler` at
http://localhost:3000/.

### Create a user and events

When starting the app for the first time or after resetting the database, you
will have to first create an admin user to access the backend and create events:

1. Open http://localhost:3000/admin/create-first-user
2. Fill in the form and make sure to select `admin` as the user role

Now, you can create and publish new events, which will show up in the frontend.

### Working with the database

To connect to the [PostgreSQL](https://www.postgresql.org/) database container
of your local development environment:

```shell
docker exec -it volunteer-scheduler-postgres-1 psql -U schedule
```

Check out our [PostgreSQL Cheat Sheet](PostgreSQL%20Cheat%20Sheet.md)!

### Working with mail

Payload requires an external mail server to send emails like password resets or
shift reminders. To view emails sent from your local development environment,
use [MailDev](https://maildev.github.io/maildev/):

* http://localhost:1080/#/
