# Implementation Plan: Enhanced Flow Logging

**Branch**: `001-add-flow-logging` | **Date**: 2026-07-29 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-add-flow-logging/spec.md`

## Summary

The objective is to implement detailed, structured logging across all authentication and management flows (Login, Logout, MFA, Password Reset, Org/User Management). The approach leverages the existing Pino configuration and OpenTelemetry instrumentation to automatically propagate trace context, ensuring logs are correlated in Uptrace. Sensitive data (passwords, codes, tokens) will be redacted automatically using Pino's native redaction (`fast-redact`), and PII will be masked using utility helper functions.

## Technical Context

**Language/Version**: Node.js v24.x, TypeScript v6.x

**Primary Dependencies**: `pino`, `@opentelemetry/api`, `@opentelemetry/instrumentation-pino`, `express`

**Storage**: ClickHouse & PostgreSQL (via Uptrace Docker services)

**Testing**: Jest integration and unit tests

**Target Platform**: Linux server (Docker environment)

**Project Type**: web-service

**Performance Goals**: Log overhead < 5% request latency

**Constraints**: < 200ms p95 latency, no credential leakage in logs

**Scale/Scope**: ~10 routes/use-cases instrumented

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Hexagonal Architecture Compliance**: Yes. Logger imports are located in `src/config/logger.ts` and called inside both presentation adapters (routes/middleware) and core use cases/repositories. The logging configuration itself is decoupled from core business rules.
- **Deep Observability & Telemetry Compliance**: Yes. Injects OpenTelemetry `trace_id` and `span_id` automatically using the existing Pino OTel instrumentation.
- **Strict Token & Session Lifecycle Compliance**: Yes. Logs token invalidation without printing the actual tokens to the logs.

## Project Structure

### Documentation (this feature)

```text
specs/001-add-flow-logging/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
└── quickstart.md        # Phase 1 output
```

### Source Code (repository root)

```text
src/
├── config/
│   └── logger.ts        # Pino configuration (update to add redaction & PII masking helpers)
├── core/
│   ├── usecases/        # Core business flows (instrument with milestone logging)
│   └── providers/       # Repositories for DB & Cache operations (instrument with metadata logs)
```

**Structure Decision**: Single project layout under `src/` following hexagonal architecture patterns.

## Proposed Changes

### Configuration

#### [MODIFY] [logger.ts](file:///home/andrew/Documents/auth-plus-symphony/auth-plus-authentication/src/config/logger.ts)
- Configure Pino `redact` option to automatically redact fields like `password`, `confirmPassword`, `code`, `token`, `secret`.
- Add and export utility functions `maskEmail` and `maskPhone` for PII protection.

### Core Use Cases

#### [MODIFY] [login.usecase.ts](file:///home/andrew/Documents/auth-plus-symphony/auth-plus-authentication/src/core/usecases/login.usecase.ts)
- Add logs at starting, verification milestones, and completion (with masked email).

#### [MODIFY] [logout.usecase.ts](file:///home/andrew/Documents/auth-plus-symphony/auth-plus-authentication/src/core/usecases/logout.usecase.ts)
- Log starting and success states of invalidating session.

#### [MODIFY] [mfa.usecase.ts](file:///home/andrew/Documents/auth-plus-symphony/auth-plus-authentication/src/core/usecases/mfa.usecase.ts)
#### [MODIFY] [mfa_choose.usecase.ts](file:///home/andrew/Documents/auth-plus-symphony/auth-plus-authentication/src/core/usecases/mfa_choose.usecase.ts)
#### [MODIFY] [mfa_code.usecase.ts](file:///home/andrew/Documents/auth-plus-symphony/auth-plus-authentication/src/core/usecases/mfa_code.usecase.ts)
- Instrument all MFA configuration, strategy choices, and code verification flows.

#### [MODIFY] [organization.usecase.ts](file:///home/andrew/Documents/auth-plus-symphony/auth-plus-authentication/src/core/usecases/organization.usecase.ts)
- Log organization setup, user additions, and modifications.

#### [MODIFY] [reset_password.usecase.ts](file:///home/andrew/Documents/auth-plus-symphony/auth-plus-authentication/src/core/usecases/reset_password.usecase.ts)
- Log password forget link generations and recovery updates.

#### [MODIFY] [user.usecase.ts](file:///home/andrew/Documents/auth-plus-symphony/auth-plus-authentication/src/core/usecases/user.usecase.ts)
- Log user onboarding and profile updates.

### Repositories (Providers)

#### [MODIFY] [user.repository.ts](file:///home/andrew/Documents/auth-plus-symphony/auth-plus-authentication/src/core/providers/user.repository.ts)
#### [MODIFY] [mfa.repository.ts](file:///home/andrew/Documents/auth-plus-symphony/auth-plus-authentication/src/core/providers/mfa.repository.ts)
#### [MODIFY] [token.repository.ts](file:///home/andrew/Documents/auth-plus-symphony/auth-plus-authentication/src/core/providers/token.repository.ts)
- Log repository-level metadata about queries/operations without leaking values.
