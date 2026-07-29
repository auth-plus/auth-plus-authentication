# Data Model: Enhanced Flow Logging

This document outlines the structured event layout for system logs. Since the logging system doesn't introduce new persistent tables or databases, this serves as the schema definition for all flow logs.

## Log Schema

Every structured log output via the Pino logger will match this pattern:

| Field Name | Type | Description |
|------------|------|-------------|
| `level` | `number` | Pino log level (30 = Info, 40 = Warn, 50 = Error) |
| `time` | `number` | Epoch millisecond timestamp of the log event |
| `msg` | `string` | Human-readable action message (e.g., "Login initiated") |
| `trace_id` | `string` | OpenTelemetry Trace ID for request correlation (injected by mixin) |
| `span_id` | `string` | OpenTelemetry Span ID for context correlation (injected by mixin) |
| `event` | `string` | Unique event identifier (e.g., `auth.login.started`, `auth.mfa.code.failed`) |
| `status` | `string` | Outcome status of the step (`started`, `success`, `failed`) |
| `userId` | `string` | (Optional) Unique identifier of the authenticated user |
| `organizationId` | `string` | (Optional) Organization identifier |
| `strategy` | `string` | (Optional) MFA strategy type (`email`, `phone`, `totp`) |
| `error` | `object` | (Optional) Details of the failure/error exception |
