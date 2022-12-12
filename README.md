# Auth+ Authentication

[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=auth-plus_auth-plus-authentication&metric=coverage)](https://sonarcloud.io/summary/new_code?id=auth-plus_auth-plus-authentication)

[![Test Coverage](https://api.codeclimate.com/v1/badges/01f194165a4526cd5001/test_coverage)](https://codeclimate.com/github/auth-plus/auth-plus-authentication/test_coverage)

[![Codacy Badge](https://app.codacy.com/project/badge/Coverage/b8c826b4250b4000945bd3e305e3e443)](https://www.codacy.com/gh/auth-plus/auth-plus-authentication/dashboard?utm_source=github.com&utm_medium=referral&utm_content=auth-plus/auth-plus-authentication&utm_campaign=Badge_Coverage)

This project it's a sample for authentication system. It use a hexagonal architeture with layer for dependency manager.

## Documentation

### Flow for authentication

1. User login with email+password at `POST /login` and server response with JWT token
2. User can set 1 or more strategies of authentication factor at `POST /mfa`. Nowadays we have Email/Phone/TOTP
3. User will be asked to validate at `POST /mfa/validate`:
    - Email: will be sent an email with a code to validate
    - Phone: will be sent an SMS/WhatsApp with a code to validate
    - TOTP: will show a QR code
4. User logout at `POST /logout`
5. Next time the user login, will be sent a list of strategy that is already validated
6. User chooses one of strategy sent before at `POST /mfa/choose`
7. User will receive a code of 6 number according to the strategy chosen (TOTP skip this step)
8. User will be asked for the code at `POST /mfa/code`

### Flow for organization

1. User can create an organization at `POST /organization`
2. User can add another user to an organization at `POST /organization/add`
3. User updates an organization at `PATCH /organization/add`

### Flow for user

1. Can create a user at `POST /user`
2. Can update a user at `PATCH /user`

## Pré-requisite

- Docker v20.10.11
- Docker Compose v1.28.4
- Node v18.12.1
- Minikube v1.23.1

## Commands

```bash

# rise/destroy all dependency
make infra/up # already create tables based on ./db/schema.sql
make infra/down # does not remove volume

# make test on the same condition where it's executed on CI
make test

# developer and test enviroment
make dev

# clean
make clean/docker # prune for container, volumes and image
make clean/node # node_modules folder and package-lock remove

# Minikube
make k8s/up # make minikube deployment based on local Dockerfile
make k8s/down # remove service from k8s and minikube stop
```

## Link after infra build up

- Kafdrop: <http://localhost:19000/>
- Redis-Commander: <http://localhost:8081/>
- Grafana: <http://localhost:3000/>
- Kibana: <http://localhost:5601/>
- Jaeger: <http://localhost:16686/>

## TODO

- [ ] Add Vault from HashiCorp
- [ ] Finish local minikube
- [ ] Add decorator to inject dependencies instead of layer management
