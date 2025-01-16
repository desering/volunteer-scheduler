# Operations

This is intended to be a comprehensive guide on how to maintain and operate the
`volunteer-scheduler` application available at https://schedule.desering.org/.

## Daily operations

There are "normal" users and admin users. Normal users can only access the
schedule and sign up for shifts. Admin users have additional permissions to
access the backend at `/admin`, where they can create, edit and delete shifts,
and also make other people admins.

## Features & Functionality

Any change in functionality needs to be implemented by developers/software
engineers familiar with typical web technologies:

* Node.js/Javascript, Typescript, CSS, HTML, etc.
* [Park UI](https://park-ui.com/) ([Panda CSS](https://panda-css.com/) & [Ark UI](https://ark-ui.com/))
* [React](https://react.dev/) & [Next.js](https://nextjs.org/)
* [Astro](https://astro.build/), [Payload CMS](https://payloadcms.com/)

## Deployment & Hosting

There is a [GitHub Actions](https://github.com/features/actions)
[workflow](../.github/workflows/build.yaml) that builds a new docker image of
each latest version of the code, pushes it to the GitHub Container Registry and
then notifies our [Coolify](https://coolify.io/) instance
(https://coolify.desering.org/) that a new version is available and a deployment
should be started.

Coolify then pulls the latest container images from `ghcr.io`, starts new
containers and stops the old ones.

The server that Coolify is running on is manually logged in to the GitHub
Container Registry `ghcr.io` using a GitHub classic personal access token owned
by Bernhard (scope: `read:packages`).

The server itself is a virtual server, running in
[Hetzner Cloud](https://www.hetzner.com/cloud/) and managed in code here:

* https://github.com/desering/terraform (creating the server, resources, cpu, memory, etc.)
* https://github.com/desering/ansible (configuring the server, installing coolify, etc.)

The current server costs ~8eur/month and runs many other projects as well (wiki,
crm, etc.).

## Backups

Coolify is automatically creating a backup of the database every night.
