# Auth+ Authentication

[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=auth-plus_auth-plus-authentication&metric=coverage)](https://sonarcloud.io/summary/new_code?id=auth-plus_auth-plus-authentication)

[![Test Coverage](https://api.codeclimate.com/v1/badges/01f194165a4526cd5001/test_coverage)](https://codeclimate.com/github/auth-plus/auth-plus-authentication/test_coverage)

[![Codacy Badge](https://app.codacy.com/project/badge/Coverage/b8c826b4250b4000945bd3e305e3e443)](https://www.codacy.com/gh/auth-plus/auth-plus-authentication/dashboard?utm_source=github.com&utm_medium=referral&utm_content=auth-plus/auth-plus-authentication&utm_campaign=Badge_Coverage)

This project it's a sample for authentication system. It use a hexagonal architeture with layer for dependency manager.

## Documentation

### Model Entity Relation

![diagram made by DBeaver](/db/MER.png "Database Diagram")

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
9. User can reset password:
    - Send email at `POST /password/forget`
    - Check email with a link (containing a hash)
    - Send the new password and hash at `POST /password/recover`

### Flow for organization

1. User can create an organization at `POST /organization`
2. User can add another user to an organization at `POST /organization/add`
3. User updates an organization at `PATCH /organization/add`

### Flow for user

1. Can create a user at `POST /user`
2. Can update a user at `PATCH /user`

### Information about Credential

- Created at `POST /login` or `POST /mfa/code`
- User has 1h to interact with any protected endpoint before token expire
- Refresh at `GET /login/refresh/:token`
  - Token is invalidated and a new one is returned
  - Cannot refresh if token is already invalid or expired
- Invalidate token when logout by adding to cache

## Pré-requisite

- Docker v20.10.11
- Docker Compose v1.28.4
- Node v18.12.1

## Commands

```bash

# rise/destroy all dependency
make infra/up # already create tables based on ./db/migration folder
make infra/down # does not remove volume

# make test on the same condition where it's executed on CI
make ci

# developer and test enviroment
make dev

# clean artifacts
make clean/docker # prune for container, volumes and image
make clean/node # node_modules folder and package-lock remove
```

## TODO

### Development

- Add decorator to inject dependencies instead of layer management
- Add load testing with [k6](https://k6.io/docs/)

### Security

- Add [grype](https://github.com/anchore/grype) for security scan (SAST)
- Add [OWASP ZAP](https://owasp.org/www-project-zap/) to scan vulnerabilities (DAST)
