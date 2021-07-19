# Auth+

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=AndrewHanasiro_auth-plus&metric=alert_status)](https://sonarcloud.io/dashboard?id=AndrewHanasiro_auth-plus)
[![codecov](https://codecov.io/gh/AndrewHanasiro/auth-plus/branch/master/graph/badge.svg?token=RLIX1BB8VH)](https://codecov.io/gh/AndrewHanasiro/auth-plus)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![Test Coverage](https://api.codeclimate.com/v1/badges/3113d07756cc7cac4d41/test_coverage)](https://codeclimate.com/github/AndrewHanasiro/auth-plus/test_coverage)

## Stack

<img alt="TypeScript" src="https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white"/>
<img alt="Express.js" src="https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB"/>
<img alt="Google Cloud" src="https://img.shields.io/badge/GoogleCloud-%234285F4.svg?style=for-the-badge&logo=google-cloud&logoColor=white"/>
<img alt="Postgres" src ="https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white"/>
<img alt="Mocha" src="https://img.shields.io/badge/-mocha-%238D6748?style=for-the-badge&logo=mocha&logoColor=white"/>
<img alt="ESLint" src="https://img.shields.io/badge/ESLint-4B3263?style=for-the-badge&logo=eslint&logoColor=white" />
<img alt="Kubernetes" src="https://img.shields.io/badge/kubernetes-%23326ce5.svg?style=for-the-badge&logo=kubernetes&logoColor=white"/>

## Pré-requisite

- Docker v20.10.6
- Docker Compose v1.28.4
- Node v14.17.0

## Commands

```bash

# rise/destroy all dependency
make infra/up # already create tables based on ./db/schema.sql
make infra/down # does not remove volume

# sync migration
make database-sync

# developer and test enviroment
make dev


# clean
make clean/docker # prune for container, volumes and image
make clean/node # node_modules folder and package-lock remove


```

## TODO:

- add jwt
- add entropy on password
- complete test
- add GOOGLE_AUTHENTICATOR on Strategy
