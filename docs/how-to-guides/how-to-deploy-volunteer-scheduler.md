# How to deploy volunteer-scheduler

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

See <.env.example> for required environment variables.
