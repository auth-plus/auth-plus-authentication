# Auth+

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=auth-plus_auth-plus-backend-main&metric=alert_status)](https://sonarcloud.io/dashboard?id=auth-plus_auth-plus-backend-main)

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

## TODO

- [ ] add jwt
- [ ] add entropy on password
- [ ] complete test, still on 70%
- [ ] add GOOGLE_AUTHENTICATOR on Strategy
- [ ] fix GCP Cloud Build to deploy on GCP Virtual Machine
- [ ] Add GCP Secret Manager
- [ ] Add a GCP CLoud SQL
- [ ] Add a GCP Memorystore
