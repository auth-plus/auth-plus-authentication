# Tasks: Enhanced Flow Logging

**Input**: Design documents from `/specs/001-add-flow-logging/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project logging initialization and basic structure

- [x] T001 [P] Configure Pino redaction rules in `src/config/logger.ts` for sensitive fields (`password`, `confirmPassword`, `code`, `token`, `secret`)
- [x] T002 [P] Implement and export `maskEmail` and `maskPhone` utility functions in `src/config/logger.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Basic logger and telemetry correlation validation

- [x] T003 Verify OpenTelemetry Pino integration setup in `src/presentation/tracing.ts` has auto-correlation enabled

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Flow Event Tracing (Priority: P1) 🎯 MVP

**Goal**: Operators can trace flow execution status and milestones across all key core modules.

**Independent Test**: Trigger all authentication endpoint flows via Integration Tests (`npm run test:integration`) and inspect logs output to stdout.

### Implementation for User Story 1

- [x] T004 [P] [US1] Instrument `src/core/usecases/login.usecase.ts` with started, success, and error flow milestones
- [x] T005 [P] [US1] Instrument `src/core/usecases/logout.usecase.ts` with start and finish status logging
- [x] T006 [P] [US1] Instrument `src/core/usecases/mfa.usecase.ts` with modular strategy configuration and validation logs
- [x] T007 [P] [US1] Instrument `src/core/usecases/mfa_choose.usecase.ts` with strategy choice milestones
- [x] T008 [P] [US1] Instrument `src/core/usecases/mfa_code.usecase.ts` with validation and error milestones
- [x] T009 [P] [US1] Instrument `src/core/usecases/organization.usecase.ts` with user updates and membership transition logs
- [x] T010 [P] [US1] Instrument `src/core/usecases/reset_password.usecase.ts` with forget and recovery milestones
- [x] T011 [P] [US1] Instrument `src/core/usecases/user.usecase.ts` with registration milestones
- [x] T012 [P] [US1] Add high-level metadata logging for DB queries and Cache updates in `src/core/providers/user.repository.ts`, `src/core/providers/mfa.repository.ts`, and `src/core/providers/token.repository.ts`

**Checkpoint**: User Story 1 is complete and flow tracing is fully active.

---

## Phase 4: User Story 2 - Security Auditing and Anti-Leakage (Priority: P2)

**Goal**: Cleanse logs of raw credential payloads and ensure user identifiers are properly masked.

**Independent Test**: Trigger login/reset requests with test payloads and verify console/trace output does not contain raw passwords/codes and that emails are masked.

### Implementation for User Story 2

- [x] T013 [US2] Update logging statements in `src/core/usecases/login.usecase.ts` and `src/core/usecases/user.usecase.ts` to wrap email inputs in the `maskEmail` utility helper
- [x] T014 [US2] Run and verify that Pino redaction handles any developer-configured logs carrying object keys like `password` or `code`

**Checkpoint**: User Story 2 is complete.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final verification, cleanup, and validation against success criteria

- [x] T015 Run integration tests and execute validation steps in `specs/001-add-flow-logging/quickstart.md`
- [x] T016 Run lint and formatting check: `npm run lint` and `npm run format`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### Parallel Opportunities

- T001 and T002 in Setup can be done in parallel
- T004 through T012 in Phase 3 can run in parallel since they involve separate files and use-cases
