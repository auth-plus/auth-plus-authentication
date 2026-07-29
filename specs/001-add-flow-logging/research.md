# Research: Enhanced Flow Logging

This document outlines design decisions, technical research, and chosen patterns for implementing enhanced flow logging correlated with OpenTelemetry and Uptrace.

## Decision 1: Logging Framework and Trace Correlation

- **Chosen Approach**: Leverage the existing **Pino** logger and its automated **OpenTelemetry Pino Instrumentation**.
- **Rationale**: Pino is high-performance and already integrates with OpenTelemetry via `@opentelemetry/instrumentation-pino` in `tracing.ts` and the mixin in `logger.ts`. This ensures `trace_id` and `span_id` are automatically correlated without manually passing tracing context down to use cases.
- **Alternatives Considered**: 
  - **Winston**: Standardized logging package, but requires configuration from scratch and has higher serialization overhead compared to Pino.
  - **Custom Logger**: Doing a custom wrapper over stdout/stderr, but we would lose native trace context propagation and formatting features provided by Pino and the OTel instrumentation.

## Decision 2: Sensitive Data Sanitization (Redaction) and PII Masking

- **Chosen Approach**:
  1. Use Pino's native redaction capabilities (powered by `fast-redact`) to automatically sanitize sensitive keys like `password`, `code`, `token`, `secret`, and `confirmPassword` from logged objects.
  2. Implement utility functions `maskEmail(email)` and `maskPhone(phone)` to obfuscate PII when logging identifiers.
- **Example Masking Logic**:
  - `admin@uptrace.local` -> `a***n@uptrace.local`
  - `+1234567890` -> `+12***890`
- **Rationale**: Native fast redaction guarantees that sensitive payload values will never leak even if developers accidentally pass raw input objects to the logger, with zero runtime performance impact. Custom masking allows trace debugging of specific users without exposing their raw contact details in logs.

## Decision 3: Database & Cache Logging

- **Chosen Approach**: Add logger statements in the **Repository** layer (e.g., in `UserRepository`, `MfaRepository`, `TokenRepository`) to log high-level metadata rather than raw queries or values.
- **Format**:
  - `logger.debug({ table: 'users', action: 'findUserByEmailAndPassword' }, 'Database operation initiated')`
  - `logger.debug({ cacheKeyPattern: 'invalidate:*', action: 'set' }, 'Cache operation executed')`
- **Rationale**: Keeps database payload logs clean while providing detailed flow observability. Pino's asynchronous batching to Uptrace ensures that these additional repository logs do not block request execution.
