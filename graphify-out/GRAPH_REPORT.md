# Graph Report - auth-plus-authentication  (2026-07-29)

## Corpus Check
- 157 files · ~44,053 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 885 nodes · 1921 edges · 104 communities (29 shown, 75 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 8 edges (avg confidence: 0.61)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `effebd07`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Strategy
- index.ts
- mfa.repository.test.ts
- organization.usecase.test.ts
- login.usecase.test.ts
- mfa.route.ts
- CacheService
- Core Use Cases
- common.sh
- compilerOptions
- package.json
- stryker.config.json
- devDependencies
- dependencies
- k6.js
- extends
- environment.d.ts
- express.d.ts
- body-parser
- Tasks: [FEATURE NAME]
- chai
- @commitlint/cli
- @commitlint/config-conventional
- cors
- UserRepository
- eslint
- @eslint/css
- @eslint/json
- @eslint/markdown
- eslint-plugin-security
- eslint-plugin-sonarjs
- express
- globals
- helmet
- commit-msg
- pre-commit
- jest
- joi
- jsonwebtoken
- knex
- nock
- nodemon
- nyc
- @opentelemetry/api
- @opentelemetry/auto-instrumentations-node
- @opentelemetry/exporter-logs-otlp-grpc
- @opentelemetry/exporter-logs-otlp-http
- @opentelemetry/exporter-metrics-otlp-http
- @opentelemetry/exporter-trace-otlp-grpc
- @opentelemetry/exporter-trace-otlp-http
- @opentelemetry/instrumentation-express
- @opentelemetry/instrumentation-http
- @opentelemetry/instrumentation-pino
- @opentelemetry/instrumentation-winston
- @opentelemetry/resources
- @opentelemetry/sdk-logs
- @opentelemetry/sdk-metrics
- @opentelemetry/sdk-node
- @opentelemetry/semantic-conventions
- @opentelemetry/winston-transport
- otpauth
- pino
- pino-http
- swagger-ui-express
- @valkey/valkey-glide
- winston
- zxcvbn
- prettier
- @stryker-mutator/jest-runner
- supertest
- @testcontainers/kafka
- @testcontainers/postgresql
- @testcontainers/valkey
- ts-jest
- ts-mockito
- ts-node
- @types/bcrypt
- @types/cors
- @types/eslint-plugin-security
- @types/express
- @types/jest
- @types/jsonwebtoken
- @types/node
- @types/swagger-ui-express
- @types/zxcvbn
- typescript
- typescript-eslint
- @typescript-eslint/parser
- w
- Auth+ Authentication Constitution
- Documentation
- Feature Specification: [FEATURE NAME]
- Tasks: Enhanced Flow Logging
- Core Principles
- Implementation Plan: [FEATURE]
- Quickstart: Logging Verification
- [CHECKLIST TYPE] Checklist: [FEATURE NAME]
- Research: Enhanced Flow Logging
- Data Model: Enhanced Flow Logging
- kafkajs
- @types/supertest

## God Nodes (most connected - your core abstractions)
1. `Strategy` - 61 edges
2. `CacheService` - 30 edges
3. `FindingUser` - 29 edges
4. `User` - 28 edges
5. `UserRepository` - 27 edges
6. `NotificationProvider` - 20 edges
7. `compilerOptions` - 18 edges
8. `logger` - 17 edges
9. `FindingMFA` - 17 edges
10. `UpdatingUser` - 17 edges

## Surprising Connections (you probably didn't know these)
- `setupDB()` --references--> `knex`  [EXTRACTED]
  test/fixtures/setup_migration.ts → package.json
- `MfaInput` --references--> `Strategy`  [EXTRACTED]
  test/fixtures/multi_factor_authentication.ts → src/core/entities/strategy.ts
- `tokenGenerator()` --calls--> `getEnv()`  [EXTRACTED]
  test/fixtures/generators.ts → src/config/enviroment_config.ts
- `LoginMFAChooseInput` --references--> `Strategy`  [EXTRACTED]
  src/presentation/http/routes/mfa.route.ts → src/core/entities/strategy.ts
- `MFACreateInput` --references--> `Strategy`  [EXTRACTED]
  src/presentation/http/routes/mfa.route.ts → src/core/entities/strategy.ts

## Import Cycles
- None detected.

## Communities (104 total, 75 thin omitted)

### Community 0 - "Strategy"
Cohesion: 0.07
Nodes (37): produce(), Mfa, Strategy, MFAChooseRepository, MFARepository, MFARow, NotificationProvider, CreatingMFACode (+29 more)

### Community 1 - "index.ts"
Cohesion: 0.07
Nodes (37): ShallowUser, ResetPasswordRepository, UserInfoRow, UserInfoType, UserRow, CreatingResetPassword, CreatingSystemUser, CreatingUser (+29 more)

### Community 2 - "mfa.repository.test.ts"
Cohesion: 0.05
Nodes (57): express, Enviroment, EnvVar, getEnv(), verifyMandatoryEnv(), logger, CacheClient, getPostgres() (+49 more)

### Community 3 - "organization.usecase.test.ts"
Cohesion: 0.09
Nodes (28): Organization, OrganizationRepository, OrganizationRow, OrganizationUserRow, AddingUserToOrganization, AddingUserToOrganizationErrors, AddingUserToOrganizationErrorsTypes, CreatingOrganization (+20 more)

### Community 4 - "login.usecase.test.ts"
Cohesion: 0.09
Nodes (26): Credential, User, TokenRepository, CreatingMFAChoose, CreatingToken, FindingMFA, FindingMFAErrors, FindingMFAErrorsTypes (+18 more)

### Community 5 - "mfa.route.ts"
Cohesion: 0.18
Nodes (10): counterError, counterTotal, LoginMFAChooseInput, LoginMFACodeInput, MFACreateInput, mfaRoute, { object, string }, schema (+2 more)

### Community 6 - "CacheService"
Cohesion: 0.09
Nodes (11): CacheService, CacheCode, MFACodeRepository, TotpService, UuidService, FindingMFACode, FindingMFACodeErrors, FindingMFACodeErrorsTypes (+3 more)

### Community 7 - "Core Use Cases"
Cohesion: 0.05
Nodes (39): Content Quality, Feature Readiness, Notes, Requirement Completeness, Specification Quality Checklist: Enhanced Flow Logging, Configuration, Constitution Check, Core Use Cases (+31 more)

### Community 8 - "common.sh"
Cohesion: 0.10
Nodes (12): check-prerequisites.sh script, check_dir(), check_file(), get_feature_paths(), get_repo_root(), has_jq(), _persist_feature_json(), resolve_specify_init_dir() (+4 more)

### Community 9 - "compilerOptions"
Cohesion: 0.08
Nodes (23): ESNEXT, src/**/*, compilerOptions, emitDecoratorMetadata, esModuleInterop, experimentalDecorators, isolatedModules, lib (+15 more)

### Community 10 - "package.json"
Cohesion: 0.09
Nodes (22): author, bugs, url, description, engines, node, homepage, keywords (+14 more)

### Community 11 - "stryker.config.json"
Cohesion: 0.15
Nodes (12): html, _comment, concurrency, coverageAnalysis, jest, configFile, enableFindRelatedTests, projectType (+4 more)

### Community 12 - "devDependencies"
Cohesion: 0.18
Nodes (11): casual, @eslint/js, husky, devDependencies, casual, @eslint/js, husky, @stryker-mutator/core (+3 more)

### Community 13 - "dependencies"
Cohesion: 0.22
Nodes (9): bcrypt, dotenv, dependencies, bcrypt, dotenv, pg, prom-client, pg (+1 more)

### Community 14 - "k6.js"
Cohesion: 0.33
Nodes (3): options, password, USERS

### Community 19 - "Tasks: [FEATURE NAME]"
Cohesion: 0.07
Nodes (26): Dependencies & Execution Order, Format: `[ID] [P?] [Story] Description`, Implementation for User Story 1, Implementation for User Story 2, Implementation for User Story 3, Implementation Strategy, Incremental Delivery, MVP First (User Story 1 Only) (+18 more)

### Community 24 - "UserRepository"
Cohesion: 0.14
Nodes (3): UserInfo, UserRepository, PasswordService

### Community 91 - "Auth+ Authentication Constitution"
Cohesion: 0.12
Nodes (15): Auth+ Authentication Constitution, Core Business Rules & Use Cases, Core Principles, Development Workflow & Quality Gates, Governance, I. Hexagonal Architecture (Ports & Adapters), I. User & Organization Management, II. Authentication & Authorization (+7 more)

### Community 92 - "Documentation"
Cohesion: 0.15
Nodes (12): Auth+ Authentication, Commands, Development, Documentation, Flow for authentication, Flow for organization, Flow for user, Information about Credential (+4 more)

### Community 93 - "Feature Specification: [FEATURE NAME]"
Cohesion: 0.15
Nodes (12): Assumptions, Edge Cases, Feature Specification: [FEATURE NAME], Functional Requirements, Key Entities *(include if feature involves data)*, Measurable Outcomes, Requirements *(mandatory)*, Success Criteria *(mandatory)* (+4 more)

### Community 94 - "Tasks: Enhanced Flow Logging"
Cohesion: 0.15
Nodes (12): Dependencies & Execution Order, Format: `[ID] [P?] [Story] Description`, Implementation for User Story 1, Implementation for User Story 2, Parallel Opportunities, Phase 1: Setup (Shared Infrastructure), Phase 2: Foundational (Blocking Prerequisites), Phase 3: User Story 1 - Flow Event Tracing (Priority: P1) 🎯 MVP (+4 more)

### Community 95 - "Core Principles"
Cohesion: 0.18
Nodes (10): Core Principles, Governance, [PRINCIPLE_1_NAME], [PRINCIPLE_2_NAME], [PRINCIPLE_3_NAME], [PRINCIPLE_4_NAME], [PRINCIPLE_5_NAME], [PROJECT_NAME] Constitution (+2 more)

### Community 96 - "Implementation Plan: [FEATURE]"
Cohesion: 0.22
Nodes (8): Complexity Tracking, Constitution Check, Documentation (this feature), Implementation Plan: [FEATURE], Project Structure, Source Code (repository root), Summary, Technical Context

### Community 97 - "Quickstart: Logging Verification"
Cohesion: 0.33
Nodes (5): Prerequisites, Quickstart: Logging Verification, Step 1: Spin up the environment, Step 2: Run End-to-End Tests, Step 3: Verify Logs in Uptrace

### Community 98 - "[CHECKLIST TYPE] Checklist: [FEATURE NAME]"
Cohesion: 0.40
Nodes (4): [Category 1], [Category 2], [CHECKLIST TYPE] Checklist: [FEATURE NAME], Notes

### Community 99 - "Research: Enhanced Flow Logging"
Cohesion: 0.40
Nodes (4): Decision 1: Logging Framework and Trace Correlation, Decision 2: Sensitive Data Sanitization (Redaction) and PII Masking, Decision 3: Database & Cache Logging, Research: Enhanced Flow Logging

## Knowledge Gaps
- **282 isolated node(s):** `@commitlint/config-conventional`, `common.sh script`, `name`, `version`, `description` (+277 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **75 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `devDependencies` connect `devDependencies` to `package.json`, `chai`, `@commitlint/cli`, `@commitlint/config-conventional`, `eslint`, `@eslint/css`, `@eslint/json`, `@eslint/markdown`, `eslint-plugin-security`, `eslint-plugin-sonarjs`, `globals`, `jest`, `nock`, `nodemon`, `nyc`, `prettier`, `@stryker-mutator/jest-runner`, `supertest`, `@testcontainers/kafka`, `@testcontainers/postgresql`, `@testcontainers/valkey`, `ts-jest`, `ts-mockito`, `ts-node`, `@types/bcrypt`, `@types/cors`, `@types/eslint-plugin-security`, `@types/express`, `@types/jest`, `@types/jsonwebtoken`, `@types/node`, `@types/swagger-ui-express`, `@types/zxcvbn`, `typescript`, `typescript-eslint`, `@typescript-eslint/parser`, `w`, `@types/supertest`?**
  _High betweenness centrality (0.127) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `package.json`, `body-parser`, `cors`, `express`, `helmet`, `joi`, `jsonwebtoken`, `knex`, `@opentelemetry/api`, `@opentelemetry/auto-instrumentations-node`, `@opentelemetry/exporter-logs-otlp-grpc`, `@opentelemetry/exporter-logs-otlp-http`, `@opentelemetry/exporter-metrics-otlp-http`, `@opentelemetry/exporter-trace-otlp-grpc`, `@opentelemetry/exporter-trace-otlp-http`, `@opentelemetry/instrumentation-express`, `@opentelemetry/instrumentation-http`, `@opentelemetry/instrumentation-pino`, `@opentelemetry/instrumentation-winston`, `@opentelemetry/resources`, `@opentelemetry/sdk-logs`, `@opentelemetry/sdk-metrics`, `@opentelemetry/sdk-node`, `@opentelemetry/semantic-conventions`, `@opentelemetry/winston-transport`, `otpauth`, `pino`, `pino-http`, `swagger-ui-express`, `@valkey/valkey-glide`, `winston`, `zxcvbn`, `kafkajs`?**
  _High betweenness centrality (0.124) - this node is a cross-community bridge._
- **Why does `express` connect `mfa.repository.test.ts` to `package.json`, `mfa.route.ts`?**
  _High betweenness centrality (0.120) - this node is a cross-community bridge._
- **What connects `@commitlint/config-conventional`, `common.sh script`, `name` to the rest of the system?**
  _282 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Strategy` be split into smaller, more focused modules?**
  _Cohesion score 0.06562819203268641 - nodes in this community are weakly interconnected._
- **Should `index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06693306693306693 - nodes in this community are weakly interconnected._
- **Should `mfa.repository.test.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05128205128205128 - nodes in this community are weakly interconnected._