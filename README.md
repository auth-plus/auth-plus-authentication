# Auth+

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=AndrewHanasiro_auth-plus&metric=alert_status)](https://sonarcloud.io/dashboard?id=AndrewHanasiro_auth-plus)
[![codecov](https://codecov.io/gh/AndrewHanasiro/auth-plus/branch/master/graph/badge.svg?token=RLIX1BB8VH)](https://codecov.io/gh/AndrewHanasiro/auth-plus)
[![Test Coverage](https://api.codeclimate.com/v1/badges/3113d07756cc7cac4d41/test_coverage)](https://codeclimate.com/github/AndrewHanasiro/auth-plus/test_coverage)
[![Known Vulnerabilities](https://snyk.io/test/github/AndrewHanasiro/auth-plus/badge.svg)](https://snyk.io/test/github/AndrewHanasiro/auth-plus)
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/4542ed683fe44d89aae9e65e7a0a939c)](https://www.codacy.com/gh/AndrewHanasiro/auth-plus/dashboard?utm_source=github.com&utm_medium=referral&utm_content=AndrewHanasiro/auth-plus&utm_campaign=Badge_Grade)

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

- add jwt
- add entropy on password
- complete test
- add GOOGLE_AUTHENTICATOR on Strategy
- fix GCP Cloud Build to deploy on GCP Virtual Machine
- Add GCP Secret Manager
- Add a GCP CLoud SQL
- Add a GCP Memorystore
