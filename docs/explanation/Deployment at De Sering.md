# Deployment at De Sering

This document explains how De Sering deploys the `volunteer-scheduler` for our
own use.

## Production Deployment

Every commit to the `main` branch of this repository triggers a [GitHub Actions
Workflow](/.github/workflows/build.yaml) that builds a new docker image of the
`volunteer-scheduler` that is pushed to the GitHub Container Registry with the
tag `ghcr.io/desering/volunteer-scheduler`.

Then, the workflow calls a webhook to trigger an application deployment in our
self-hosted [Coolify](https://coolify.io/) instance
(https://coolify.desering.org/).

Coolify pulls the latest container image from `ghcr.io`, starts new containers
with the latest application and stops the old ones.

Within ~2 minutes, the latest version should be available online at:

```
https://schedule.desering.org/
```

The server that Coolify is running on is manually logged in to the GitHub
Container Registry `ghcr.io` using a GitHub classic personal access token owned
by @baer95 (scope: `read:packages`).

The server itself is a virtual server, running in
[Hetzner Cloud](https://www.hetzner.com/cloud/) and managed in code here:

* https://github.com/desering/terraform (creating the server, resources, cpu, memory, etc.)
* https://github.com/desering/ansible (configuring the OS, installing Coolify, etc.)

The server currently (January 2026) costs ~8eur/month and also runs many other
projects for De Sering.

Coolify automatically creates nightly database backups and uploads them to a
Hetzner Storage Bucket.

## Preview Deployments

Coolify [Preview Deployments](https://coolify.io/docs/applications/#preview-deployments)
are configured to automatically create a new deployment for each PR opened in
this repository. Cloudflare does not offer Wildcard SSL certificates for
second-level subdomains (e.g. `*.schedule.desering.org`), so we configured
`*.desering.org` to point to our Coolify instance instead (see
[here](https://github.com/desering/terraform/blob/main/dns_desering.org.tf)).

The preview deployment urls look as follows:

```
https://schedule-pr-{PR-Number}.desering.org/
```

Coolify also automatically posts this information to the PR.

Details about Cloudflare SSL Certificates can be found here:

https://developers.cloudflare.com/ssl/edge-certificates/universal-ssl/enable-universal-ssl/
