# Auth+ Authentication

[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=auth-plus_auth-plus-authentication&metric=coverage)](https://sonarcloud.io/summary/new_code?id=auth-plus_auth-plus-authentication)

[![Codacy Badge](https://app.codacy.com/project/badge/Coverage/b8c826b4250b4000945bd3e305e3e443)](https://app.codacy.com/gh/auth-plus/auth-plus-authentication/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_coverage)

[![Known Vulnerabilities](https://snyk.io/test/github/auth-plus/auth-plus-authentication/badge.svg)](https://snyk.io/test/github/auth-plus/auth-plus-authentication)

This project is a sample authentication system. It strictly follows a Hexagonal Architecture (Ports and Adapters) pattern to ensure the core domain remains decoupled from external dependencies.

## Project Structure

- **src/core**: The heart of the application, completely isolated from external frameworks.
  - **entities**: Domain models and core business logic.
  - **usecases**: Business use case implementations.
  - **driver**: Inbound ports (interfaces) that define how the outside world interacts with the core.
  - **driven**: Outbound ports (interfaces) that define how the core interacts with the outside world.
  - **services**: Reusable domain services.
- **src/adapters**: Infrastructure implementations.
  - **inbound**: Driving adapters (e.g., Express controllers, REST routes) that invoke driver ports.
  - **outbound**: Driven adapters (e.g., Database repositories, Cache clients) that implement driven ports.

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

- Docker v4.9.3
- Docker Compose v5.1.4
- Node v24.10

## Commands

```bash
# rise/destroy all dependency
make infra/up # already create tables based on ./db/migration folder
make infra/down # does not remove volume
make reset # destroy, rise dependencies, and run migrations

# make test on the same condition where it's executed on CI
make ci
make test/mutation # Run Stryker mutation testing
make test/load # Run k6 load testing (requires make start)

# developer and test enviroment
make start # Build and start the API
make dev # start dependencies and open shell in API container

# clean artifacts
make clean/node # node_modules folder and package-lock remove
```

## Security & Observability

- **Security**: The API uses `helmet` for HTTP header security, restricted CORS, and disables `x-powered-by`.
- **Telemetry**: Instrumented with OpenTelemetry, exporting traces and metrics to a collector (e.g., Uptrace) via `docker-compose`.

## TODO

### Development

- Add decorator to inject dependencies instead of layer management

### Security

- Add [grype](https://github.com/anchore/grype) for security scan (SAST)
- Add [OWASP ZAP](https://owasp.org/www-project-zap/) to scan vulnerabilities (DAST)
