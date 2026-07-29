# Quickstart: Logging Verification

This document provides instructions for validating the implementation of enhanced flow logging.

## Prerequisites

- Docker and Docker Compose installed.
- Node.js environment configured.

## Step 1: Spin up the environment

Start the full stack including ClickHouse, Uptrace, and the API:

```bash
docker compose up --build -d
```

Ensure all services are running and healthy.

## Step 2: Run End-to-End Tests

Trigger the integration test suite to generate flow traffic and logs:

```bash
npm run test:integration
```

## Step 3: Verify Logs in Uptrace

Open the Uptrace UI at [http://localhost:14318](http://localhost:14318).

1. Navigate to the **Logs** dashboard.
2. Verify that log records show up with attributes:
   - `trace_id` and `span_id` are populated and match the active HTTP tracing spans.
   - `event` and `status` fields are populated.
3. Search for log statements where `event` matches:
   - `auth.login.started`
   - `auth.login.success`
   - `auth.logout.success`
4. Inspect a failed login attempt and check that:
   - A `warn` level log is recorded.
   - The error reason is listed in the payload.
   - The email is masked (e.g. `a***n@uptrace.local`).
   - No passwords or tokens are present in the log payload.
