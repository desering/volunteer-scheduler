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
> This guide is tested on MacOS and Linux. If any one is using Windows and
> encounters issues, please open an issue in the repository. 

### Run the project locally

### DevContainer (recommended)

The easiest way to get started with development is to use the provided
[DevContainer](https://code.visualstudio.com/docs/devcontainers/containers):

#### Prequisites

1. Any IDE with DevContainer support (e.g., [Visual Studio Code](https://code.visualstudio.com/)) installed
2. [Docker Desktop](https://docs.docker.com/desktop/) or [Rancher Desktop](https://rancherdesktop.io/)
   running

#### Setup

1. Clone the repository:
   ```shell
   git clone git@github.com:desering/volunteer-scheduler.git
   ```

2. If using Visual Studio Code, make sure the [DevContainer extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
   is installed.

3. Open the `volunteer-scheduler` project folder in Visual Studio Code.

4. When prompted, reopen the project in the DevContainer.

This will set up the development environment automatically, including all
prerequisites, dependencies, and services.

### Local Setup

If you prefer to set up the development environment manually on your local
machine without using a DevContainer, follow the instructions below.

#### Prequisites

1. [Docker Desktop](https://docs.docker.com/desktop/) or [Rancher Desktop](https://rancherdesktop.io/)
   running
2. [Bun Javascript Runtime](https://bun.com/) installed
3. Only MacOs | [Node.js Javascript Runtime](https://nodejs.org/en/download) installed

#### Setup

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
   bun generate:env
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

4. Replace docker container names with localhost
   ```shell
   sedi '/^SMTP_HOST=/s|maildev|localhost|' .env
   sedi '/^DATABASE_URI=/s|@postgres:|@localhost:|' .env
   ```

5. Install all dependencies:
   ```shell
   bun install
   ```

6. Start additional development services (database, mail):
   ```shell
   docker compose up
   ```

7. Start the Next.js development server:
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
