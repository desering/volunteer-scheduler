# Deployment

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

## Production deployment

deployed to scheduler.desering.org
gha workflow
triggers deployment via webhook in coolify.desering.org
coolify pulls newest image from ghcr.io and replaces image.

[build.yaml](../.github/workflows/build.yaml)
