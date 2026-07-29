# Feature Specification: Enhanced Flow Logging

**Feature Branch**: `001-add-flow-logging`

**Created**: 2026-07-29

**Status**: Draft

**Input**: User description: "I just added uptrace as APM, but I want to add more logs on all flows that can help me to debug more easily"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Flow Event Tracing for Operators (Priority: P1)

As a system operator/developer, I want to trace user activity and flow execution across all authentication and management actions in Uptrace, so that I can easily pinpoint where a failure occurs and inspect its context.

**Why this priority**: Crucial for operational visibility. Pinpointing flow failures makes debugging production issues fast and reliable.

**Independent Test**: Trigger each auth flow (login, MFA, logout, password reset, organization updates) and verify that structured logs containing correct correlation trace/span IDs and transition statuses are present in the APM system.

**Acceptance Scenarios**:

1. **Given** a user initiates a login request, **When** they provide credentials and go through MFA validation steps, **Then** Uptrace should show structured log records matching each milestone of the flow (credential validation, MFA challenge selection, MFA code verification), all sharing the same `trace_id`.
2. **Given** a flow fails due to invalid input or system error (e.g., wrong password, expired MFA code, db connection failure), **When** the failure is handled, **Then** a structured warning or error log should be recorded containing the reason for failure and the corresponding `trace_id`.

---

### User Story 2 - Security Auditing and Anti-Leakage (Priority: P2)

As a security auditor, I want to ensure that no sensitive credentials (like passwords, MFA verification codes, or JWT secrets) are written to the logs, while still keeping relevant context (such as masked email and user/organization IDs).

**Why this priority**: Essential to protect user privacy, prevent credential exposure, and maintain security compliance.

**Independent Test**: Verify that logs generated during password reset, login, and MFA setup contain masked or hashed identifiers and exclude raw passwords or codes.

**Acceptance Scenarios**:

1. **Given** a password reset or MFA verification is executed, **When** a log is written, **Then** it must not contain the plaintext password, password hash, reset token, or verification code, and email/phone values must be masked (e.g., `a***w@domain.com`).

---

### Edge Cases

- **System/DB Down**: How does the system handle database or cache disconnects during log generation? The logging library should handle these failures gracefully without crashing the main Express application.
- **Trace Context Missing**: If an action is triggered outside an active trace context, logs should still be captured and structured correctly, using empty trace correlation attributes rather than failing or omitting logs.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST generate structured logs for the start, milestones, and completion of all core flows (Login, Logout, MFA setup, MFA validation, Password Reset Request, Password Recovery, User Creation, and Organization updates).
- **FR-002**: All generated logs MUST include context-rich attributes: event name, execution status (success, failed, pending), user ID (where available), and organization ID (where available).
- **FR-003**: The logger MUST automatically correlate with the active OpenTelemetry span/trace context, injecting `trace_id` and `span_id` into every log entry.
- **FR-004**: The system MUST sanitize all logged payloads, preventing the serialization of fields containing sensitive information, specifically `password`, `code`, `token`, `secret`, and raw MFA secrets.
- **FR-005**: Database queries, database transitions (transactions), and cache operations (such as token blacklist registration) MUST log high-level metadata (e.g., action type, target table/key pattern, status) without logging raw payloads or query values.

### Key Entities *(include if feature involves data)*

- **Log Entry**: Structured representation of an event. Contains `level`, `time`, `msg`, `event`, `status`, `trace_id`, `span_id`, and contextual metadata (e.g., `userId`, `organizationId`).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Developers can search and filter logs in Uptrace by `trace_id` to view the exact sequence of events for 100% of handled requests.
- **SC-002**: Zero (0) raw credentials or sensitive PII (like unmasked emails/phone numbers or plain text passwords) are leaked into the logging storage.
- **SC-003**: Logging overhead does not degrade request latency by more than 5%.

## Assumptions

- We assume the existing logging framework (Pino) and its OTel/Uptrace instrumentation are fully functional and will be leveraged.
- Direct console logging (`console.log`, `console.error`) will be replaced by the structured `logger` instance across all flows.
- Performance limits on Uptrace are sufficient to handle debug/info level logs for all request flows in the development environment.
