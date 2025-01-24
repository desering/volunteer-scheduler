# Deployment

## Preview Deployments

Coolify [Preview Deployments](https://coolify.io/docs/applications/#preview-deployments)
are configured to automatically create a new deployment of both Astro and
Payload for each PR opened in this repo. Cloudflare does not offer Wildcard SSL
certificates for second-level subdomains (e.g. `*.schedule.desering.org`), so we
configured `*.desering.org` to point to Coolify instead. The preview deployment
urls for Schedule look as follows:

```
https://schedule-pr-{PR-Number}.desering.org/
```

Coolify also automatically posts this information to the PR.

Details about Cloudflare SSL Certificates can be found here:

https://developers.cloudflare.com/ssl/edge-certificates/universal-ssl/enable-universal-ssl/

## Production Deployment

Coolify is connected to this GitHub repo and continuously monitors it for
changes. Merging a PR to the `main` branch triggers a Docker build and a
redeployment in Coolify. Within ~5-10 minutes, the new versions should be
available online at:

```
https://schedule.desering.org/
```

## Manual Deployment

Use `docker-compose` to build and run the whole stack including a database container:
```shell
docker-compose -f docker-compose.deploy.yml up
```

Or build and run the images individually:
```shell
# Astro:
docker build -f Dockerfile.astro -t ghcr.io/desering/volunteer-scheduler-astro:dev .
docker run -p 3000:3000 --env-file packages/shared/.env ghcr.io/desering/volunteer-scheduler-astro:dev

# Payload:
docker build -f Dockerfile.payload -t ghcr.io/desering/volunteer-scheduler-payload:dev .
docker run -p 3000:3000 --env-file packages/shared/.env ghcr.io/desering/volunteer-scheduler-payload:dev
```
