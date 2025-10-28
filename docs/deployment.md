# Deployment

## Production Deployment

Coolify is connected to this GitHub repo and continuously monitors it for
changes. Merging a PR to the `main` branch triggers a Docker build and a
redeployment in Coolify. Within ~5-10 minutes, the new versions should be
available online at:

```
https://schedule.desering.org/
```

## Preview Deployments

Coolify [Preview Deployments](https://coolify.io/docs/applications/#preview-deployments)
are configured to automatically create a new deployment for each PR opened in
this repo. Cloudflare does not offer Wildcard SSL certificates for second-level
subdomains (e.g. `*.schedule.desering.org`), so we configured `*.desering.org`
to point to Coolify instead (see
[here](https://github.com/desering/terraform/blob/main/dns_desering.org.tf)).

The preview deployment urls look as follows:

```
https://schedule-pr-{PR-Number}.desering.org/
```

Coolify also automatically posts this information to the PR.

Details about Cloudflare SSL Certificates can be found here:

https://developers.cloudflare.com/ssl/edge-certificates/universal-ssl/enable-universal-ssl/

## Manual Deployment

Use `docker-compose` to build and run the whole stack including a database container:
```shell
docker-compose -f docker-compose.deploy.yml up
```

Or build and run the docker image directly:
```shell
docker build . -t ghcr.io/desering/volunteer-scheduler:dev
docker run --init -p 3000:3000 --rm --env-file .env ghcr.io/desering/volunteer-scheduler:dev
docker run --init --network host --rm --env-file .env ghcr.io/desering/volunteer-scheduler:dev
```
