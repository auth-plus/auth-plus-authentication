# Auth+ Authentication Constitution

## Core Principles

### I. Hexagonal Architecture (Ports & Adapters)
The core domain (entities, services, and use cases) MUST remain strictly decoupled from external databases, delivery mechanisms, or web frameworks. All interactions with external services (PostgreSQL, Valkey, Kafka, Express) must be defined as ports (interfaces) in the core layer and implemented by providers (adapters).

### II. Modular Multi-Strategy MFA
The system MUST support extensible, decoupled multi-factor authentication strategies (Email validation, SMS/WhatsApp Phone validation, and TOTP QR codes) via standard interfaces. Strategy validation should remain modular so new strategies can be integrated without modifying existing flows.

### III. Strict Token & Session Lifecycle
JWT-based session authentication must enforce a strict 1-hour expiration window, support token rotation/refresh mechanics, and utilize a Valkey-backed cache blacklist for immediate token invalidation upon logout.

### IV. Deep Observability & Telemetry
All API endpoints, database queries, cache hits/misses, and messaging events MUST be instrumented using OpenTelemetry. Standardized logging (via Winston) and trace spans must be exported to an Uptrace collector to maintain continuous operational visibility.

### V. Hermetic and Robust Testing
Ensure high-reliability and prevent regression bugs using a combination of Jest unit/integration tests, Testcontainers (for real isolated Postgres, Valkey, and Kafka Docker containers), and Stryker mutation testing. Mocking external services must be minimized in favor of containerized integration testing.

## Core Business Rules & Use Cases

### I. User & Organization Management
- **Organizations**: Users can belong to organizations for logical grouping, but the system does not currently enforce strict multi-tenancy.
- **User Management**: User creation and updates enforce secure credential hashing (bcrypt) and strict validation.

### II. Authentication & Authorization
- **Login Flow**: Standard authentication via `POST /login` to verify email and password, issuing a JWT access token. If MFA is configured, subsequent logins will prompt for an MFA strategy choice.
- **Logout Flow**: Secure termination of sessions via `POST /logout`, explicitly blacklisting JWTs in the Valkey cache to prevent token reuse before natural expiration.
- **Password Reset**: A challenge-response mechanism initiated via `POST /password/forget` (sends email link with hash) and completed via `POST /password/recover` (submits new password and hash).

### III. Multi-Factor Authentication (MFA)
- **MFA Configuration**: Users can set up one or more strategies (TOTP, Email, SMS/WhatsApp) via `POST /mfa`.
- **MFA Validation**: Strategies must be validated initially at `POST /mfa/validate` (receiving a code for Email/Phone or a QR for TOTP).
- **MFA Login Flow**: During subsequent logins, users retrieve their validated strategies, choose one via `POST /mfa/choose` (receiving a code for Email/Phone), and complete the login by providing the 6-digit code at `POST /mfa/code`.

## Technical Constraints

- **Runtime & Language**: Node.js (v24.x) and TypeScript (v6.x).
- **Framework**: Express.js (v5.x).
- **Database & Cache**: PostgreSQL (pg/Knex.js) and Valkey (@valkey/valkey-glide).
- **Messaging**: Apache Kafka (kafkajs).
- **Monitoring**: OpenTelemetry Node SDK & Uptrace.

### VI. API Security
- **Header & Transport Security**: Express must utilize `Helmet` for robust HTTP header security, disable `x-powered-by`, and strictly enforce `CORS` policies (currently restricted to local origins).

## Development Workflow & Quality Gates

- **Conventional Commits**: Enforced using commitlint and Husky hooks.
- **Linting & Formatting**: Code quality is validated using ESLint, Prettier.
- **Testing & Static Analysis**: Jest test suites and mutation testing scores (Stryker) must be monitored. Static analysis and test coverage metrics are continuously validated via SonarQube (`sonar-project.properties`).

## Governance
All architectural modifications, schema changes, and dependency introductions MUST be verified against these principles during Pull Request reviews. Any divergence from the Hexagonal Architecture or testing standards requires explicit justification and must be documented as an amendment to this constitution.

**Version**: 1.1.0 | **Ratified**: 2026-07-04 | **Last Amended**: 2026-07-28
