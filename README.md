# Auth+

[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=auth-plus_auth-plus-backend-main&metric=coverage)](https://sonarcloud.io/summary/new_code?id=auth-plus_auth-plus-backend-main)

This project it's a sample for authentication and authorization system. It use a hexagonal architeture with layer for dependency issue.

## Pré-requisite

- Docker v20.10.6
- Docker Compose v1.28.4
- Node v14.17.0

## Commands

```bash

# rise/destroy all dependency
make infra/up # already create tables based on ./db/schema.sql
make infra/down # does not remove volume

# make test on the same condition where it's executed on CI
make test/ci

# developer and test enviroment
make dev

# clean
make clean/docker # prune for container, volumes and image
make clean/node # node_modules folder and package-lock remove

```

## Link after infra build up

- Kafdrop: http://localhost:19000/
- Redis-Commander: http://localhost:8081/
- Grafana: http://localhost:3000/
- Kibana: http://localhost:5601/
- Jaeger: http://localhost:16686/

## TODO

- [ ] add GOOGLE_AUTHENTICATOR on Strategy
