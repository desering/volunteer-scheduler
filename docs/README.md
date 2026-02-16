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
> This guide is tested on macOS & Linux. If you run into steps that work
> differently on Windows, please open a PR to improve it.

### Prerequisites

Install the following prerequisites:

1. docker runtime, pick one:
   * [Docker "Engine"](https://docs.docker.com/engine/)
   * [Docker Desktop](https://docs.docker.com/desktop/)
     * macOS tip: `brew install --cask rancher`
   * [Rancher Desktop](https://rancherdesktop.io/)
     * macOS tip: `brew install --cask docker-desktop`

2. optionally, get the [Bun Javascript Runtime](https://bun.com/)
   * macOS Homebrew: `brew tap oven-sh/bun; brew install bun`

**Payload compatibility with the Bun Runtime**

Payload only officially supports the Node.js runtime. However, the Payload
CLI seems to work with Bun without issues when using the `--disable-transpile`
option as documented in
[using alternative runtimes with Payload](https://payloadcms.com/docs/local-api/outside-nextjs#option-2-use-an-alternative-runtime-like-bun).

This is only relevant for the use of the `payload` cli during development and
not for the build process. See
[this issue](https://github.com/payloadcms/payload/issues/15015) for details.

### Run the project locally

1. Clone the repository:
   ```shell
   git clone git@github.com:desering/volunteer-scheduler.git
   ```

2. Because of macOS, and its BSD `sed`:
   ```shell
   source .github/scripts/functions.sh
   ```

3. Create a `.env` file and generate a secret key for Payload:
   ```shell
   cp .env.example .env
   sedi -e "s/PAYLOAD_SECRET_PLACEHOLDER/$(openssl rand -hex 32)/g" .env
   ```

Then choose between:

<details>
<summary>Run the project locally with docker only</summary>

### _with docker only_

4. Start development services (database, mail, bun):
   ```shell
   docker compose --profile bun up
   ```

5. If your dependencies change, rebuild the image:
   ```shell
   docker compose --profile bun build
   ```
   and restart docker compose

> This configuration stores your local build cache (`.next`) in a dedicated volume and `node_modules` are in the docker bun image.

</details>

<details>
<summary>Run the project locally using standalone bun</summary>

### _using standalone `bun`_

4. Install all dependencies:
   ```shell
   bun install
   ```

5. Start additional development services (database, mail):
   ```shell
   docker compose up
   ```

6. Start the Next.js development server:
   ```shell
   bun --bun dev
   ```

> This configuration stores your local build cache (`.next`) and `node_modules` in your host filesystem.
</details>

You should now be able to access your local version of `volunteer-scheduler` at
http://localhost:3000/.

### Create a user and events

When starting the app for the first time or after resetting the database, you
will have to first create an admin user to access the backend and create events:

1. Open http://localhost:3000/admin/create-first-user
2. Fill in the form and make sure to select `admin` as the user role

Now, you can create and publish new events, which will show up in the frontend.

### Working with the database

To connect to the [PostgreSQL](https://www.postgresql.org/) database container of your local development environment:

```shell
docker compose exec postgres psql -U schedule
```

Check out our [PostgreSQL Cheat Sheet](PostgreSQL%20Cheat%20Sheet.md)!

### Working with mail

Payload requires an external mail server to send emails like password resets or
shift reminders. To view emails sent from your local development environment,
use [MailDev](https://maildev.github.io/maildev/):

* with above dev docker compose it should be running on http://localhost:1080/#/
