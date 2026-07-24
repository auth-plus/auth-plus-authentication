<!--
SYNC IMPACT REPORT
==================
- Version change: [CONSTITUTION_VERSION] -> 1.0.0
- Modified principles:
  - [PRINCIPLE_1_NAME] -> I. Hexagonal Architecture (Ports & Adapters)
  - [PRINCIPLE_2_NAME] -> II. Modular Multi-Strategy MFA
  - [PRINCIPLE_3_NAME] -> III. Strict Token & Session Lifecycle
  - [PRINCIPLE_4_NAME] -> IV. Deep Observability & Telemetry
  - [PRINCIPLE_5_NAME] -> V. Hermetic and Robust Testing
- Added sections:
  - Technical Constraints (replaces [SECTION_2_NAME])
  - Development Workflow & Quality Gates (replaces [SECTION_3_NAME])
- Templates/files requiring updates:
  - .specify/templates/plan-template.md: ✅ updated (already aligned, generic template)
  - .specify/templates/spec-template.md: ✅ updated (already aligned, generic template)
  - .specify/templates/tasks-template.md: ✅ updated (already aligned, generic template)
  - README.md: ✅ updated (already aligned)
- Follow-up TODOs: None
-->

# Auth+ Authentication Constitution

## Core Principles

### I. Hexagonal Architecture (Ports & Adapters)
The core domain (entities, services, and use cases) MUST remain strictly decoupled from external databases, delivery mechanisms, or web frameworks. All interactions with external services (PostgreSQL, Redis, Kafka, Express) must be defined as ports (interfaces) in the core layer and implemented by providers (adapters).

### II. Modular Multi-Strategy MFA
The system MUST support extensible, decoupled multi-factor authentication strategies (Email validation, SMS/WhatsApp Phone validation, and TOTP QR codes) via standard interfaces. Strategy validation should remain modular so new strategies can be integrated without modifying existing flows.

### III. Strict Token & Session Lifecycle
JWT-based session authentication must enforce a strict 1-hour expiration window, support token rotation/refresh mechanics, and utilize a Redis-backed cache blacklist for immediate token invalidation upon logout.

### IV. Deep Observability & Telemetry
All API endpoints, database queries, cache hits/misses, and messaging events MUST be instrumented using OpenTelemetry. Standardized logging (via Winston) and trace spans must be exported to a SigNoz collector to maintain continuous operational visibility.

### V. Hermetic and Robust Testing
Ensure high-reliability and prevent regression bugs using a combination of Jest unit/integration tests, Testcontainers (for real isolated Postgres, Redis, and Kafka Docker containers), and Stryker mutation testing. Mocking external services must be minimized in favor of containerized integration testing.

## Technical Constraints

- **Runtime & Language**: Node.js (v24.x) and TypeScript (v6.x).
- **Framework**: Express.js (v5.x).
- **Database & Cache**: PostgreSQL (pg/Knex.js) and Redis (redis).
- **Messaging**: Apache Kafka (kafkajs).
- **Monitoring**: OpenTelemetry Node SDK & SigNoz.

## Development Workflow & Quality Gates

- **Conventional Commits**: Enforced using commitlint and Husky hooks.
- **Linting & Formatting**: Code quality is validated using ESLint, Prettier.
- **Testing**: Jest test suites and mutation testing scores (Stryker) must be monitored to ensure the efficacy of the test suite.

## Governance
All architectural modifications, schema changes, and dependency introductions MUST be verified against these principles during Pull Request reviews. Any divergence from the Hexagonal Architecture or testing standards requires explicit justification and must be documented as an amendment to this constitution.

**Version**: 1.0.0 | **Ratified**: 2026-07-04 | **Last Amended**: 2026-07-04
