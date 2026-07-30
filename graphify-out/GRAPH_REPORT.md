# Graph Report - .  (2026-07-30)

## Corpus Check
- 66 files · ~43,798 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 878 nodes · 1766 edges · 98 communities (33 shown, 65 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 7 edges (avg confidence: 0.59)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- multi factor authentication.ts
- creating reset password.driven.ts
- notification.provider.test.ts
- adding user to organization.driven.ts
- OrganizationUpdateUserInput
- [MODIFY] [reset password.usecase.ts](file:///home/andrew/Documents/auth plus
- finding mfa choose.driven.ts
- creating system user.driven.ts
- invalidating token.driven.ts
- read feature json feature directory()
- Tests for User Story
- experimentalDecorators
- package.json
- I. Hexagonal Architecture (Ports
- .findUserByEmailAndPassword()
- @typescript eslint/parser
- Information about Credential
- enableFindRelatedTests
- Key Entities *(include if
- Phase 4: User Story
- [PROJECT NAME] Constitution
- @opentelemetry/sdk logs
- Implementation Plan: [FEATURE]
- Quickstart: Logging Verification
- generateUUID()
- [CHECKLIST TYPE] Checklist: [FEATURE NAME]
- Decision 2: Sensitive Data
- @commitlint/config conventional
- @opentelemetry/instrumentation winston
- @opentelemetry/exporter logs otlp grpc
- @opentelemetry/exporter trace otlp grpc
- Data Model: Enhanced Flow Logging
- environment.d.ts
- express.d.ts
- bcrypt
- body parser
- casual
- @commitlint/cli
- cors
- dotenv
- eslint
- @eslint/css
- @eslint/js
- @eslint/json
- @eslint/markdown
- eslint plugin sonarjs
- globals
- helmet
- husky
- commit msg script
- pre commit script
- jest
- joi
- kafkajs
- knex
- nock
- nodemon
- @opentelemetry/api
- @opentelemetry/auto instrumentations node
- @opentelemetry/exporter metrics otlp http
- @opentelemetry/instrumentation express
- @opentelemetry/resources
- @opentelemetry/sdk metrics
- @opentelemetry/semantic conventions
- @opentelemetry/winston transport
- otpauth
- pg
- pino
- pino http
- prom client
- swagger ui express
- @valkey/valkey glide
- zxcvbn
- prettier
- @stryker mutator/core
- @stryker mutator/jest runner
- supertest
- @testcontainers/kafka
- @testcontainers/postgresql
- @testcontainers/valkey
- ts jest
- ts mockito
- ts node
- @types/bcrypt
- @types/chai
- @types/cors
- @types/eslint plugin security
- @types/jest
- @types/jsonwebtoken
- @types/node
- @types/swagger ui express
- @types/zxcvbn
- typescript
- typescript eslint
- w

## God Nodes (most connected - your core abstractions)
1. `Strategy` - 49 edges
2. `CacheService` - 30 edges
3. `UserRepository` - 24 edges
4. `User` - 22 edges
5. `FindingUser` - 21 edges
6. `NotificationProvider` - 20 edges
7. `compilerOptions` - 18 edges
8. `logger` - 17 edges
9. `OrganizationRepository` - 14 edges
10. `getEnv()` - 14 edges

## Surprising Connections (you probably didn't know these)
- `setupDB()` --references--> `knex`  [EXTRACTED]
  test/fixtures/setup_migration.ts → package.json
- `MfaInput` --references--> `Strategy`  [EXTRACTED]
  test/fixtures/multi_factor_authentication.ts → src/core/entities/strategy.ts
- `extends` --extends--> `@commitlint/config-conventional`  [EXTRACTED]
  .commitlintrc.json → package.json
- `LoginMFAChooseInput` --references--> `Strategy`  [EXTRACTED]
  src/presentation/http/routes/mfa.route.ts → src/core/entities/strategy.ts
- `MFACreateInput` --references--> `Strategy`  [EXTRACTED]
  src/presentation/http/routes/mfa.route.ts → src/core/entities/strategy.ts

## Import Cycles
- None detected.

## Communities (98 total, 65 thin omitted)

### Community 0 - "multi factor authentication.ts"
Cohesion: 0.07
Nodes (43): Credential, Mfa, Strategy, User, UserInfo, MFARepository, MFARow, UserInfoRow (+35 more)

### Community 1 - "creating reset password.driven.ts"
Cohesion: 0.05
Nodes (26): getPostgres(), getKafka(), CacheCode, MFACodeRepository, ResetPasswordRepository, TotpService, UuidService, CreatingResetPassword (+18 more)

### Community 2 - "notification.provider.test.ts"
Cohesion: 0.08
Nodes (27): Enviroment, EnvVar, getEnv(), verifyMandatoryEnv(), CacheClient, CacheService, TOPIC, PasswordService (+19 more)

### Community 3 - "adding user to organization.driven.ts"
Cohesion: 0.09
Nodes (26): Organization, OrganizationRepository, OrganizationRow, OrganizationUserRow, AddingUserToOrganization, AddingUserToOrganizationErrors, AddingUserToOrganizationErrorsTypes, CreatingOrganization (+18 more)

### Community 4 - "OrganizationUpdateUserInput"
Cohesion: 0.05
Nodes (42): express, getCore(), app, jwtMiddleware(), JwtPayloadContent, option, retriveToken(), LoginInput (+34 more)

### Community 5 - "[MODIFY] [reset password.usecase.ts](file:///home/andrew/Documents/auth plus"
Cohesion: 0.05
Nodes (37): Content Quality, Feature Readiness, Notes, Requirement Completeness, Specification Quality Checklist: Enhanced Flow Logging, Configuration, Constitution Check, Core Use Cases (+29 more)

### Community 6 - "finding mfa choose.driven.ts"
Cohesion: 0.10
Nodes (15): produce(), MFAChooseRepository, NotificationProvider, FindingMFAChoose, FindingMFAChooseErrors, FindingMFAChooseErrorsTypes, SendingMfaCode, SendingMfaCodeErrors (+7 more)

### Community 7 - "creating system user.driven.ts"
Cohesion: 0.10
Nodes (18): ShallowUser, CreatingSystemUser, CreatingUser, CreatingUserErrors, CreatingUserErrorsTypes, UpdatingUserErrors, UpdatingUserErrorsTypes, CreateUser (+10 more)

### Community 8 - "invalidating token.driven.ts"
Cohesion: 0.11
Nodes (12): logger, TokenRepository, CreatingToken, InvalidatingToken, LogoutUser, LogoutUserErrors, LogoutUserErrorsTypes, RefreshToken (+4 more)

### Community 9 - "read feature json feature directory()"
Cohesion: 0.10
Nodes (12): check-prerequisites.sh script, check_dir(), check_file(), get_feature_paths(), get_repo_root(), has_jq(), _persist_feature_json(), resolve_specify_init_dir() (+4 more)

### Community 10 - "Tests for User Story"
Cohesion: 0.07
Nodes (26): Dependencies & Execution Order, Format: `[ID] [P?] [Story] Description`, Implementation for User Story 1, Implementation for User Story 2, Implementation for User Story 3, Implementation Strategy, Incremental Delivery, MVP First (User Story 1 Only) (+18 more)

### Community 11 - "experimentalDecorators"
Cohesion: 0.08
Nodes (23): ESNEXT, src/**/*, compilerOptions, emitDecoratorMetadata, esModuleInterop, experimentalDecorators, isolatedModules, lib (+15 more)

### Community 12 - "package.json"
Cohesion: 0.09
Nodes (22): author, bugs, url, description, engines, node, homepage, keywords (+14 more)

### Community 13 - "I. Hexagonal Architecture (Ports"
Cohesion: 0.12
Nodes (15): Auth+ Authentication Constitution, Core Business Rules & Use Cases, Core Principles, Development Workflow & Quality Gates, Governance, I. Hexagonal Architecture (Ports & Adapters), I. User & Organization Management, II. Authentication & Authorization (+7 more)

### Community 15 - "@typescript eslint/parser"
Cohesion: 0.15
Nodes (13): chai, eslint-plugin-security, nyc, devDependencies, chai, eslint-plugin-security, nyc, @types/express (+5 more)

### Community 16 - "Information about Credential"
Cohesion: 0.15
Nodes (12): Auth+ Authentication, Commands, Development, Documentation, Flow for authentication, Flow for organization, Flow for user, Information about Credential (+4 more)

### Community 17 - "enableFindRelatedTests"
Cohesion: 0.15
Nodes (12): html, _comment, concurrency, coverageAnalysis, jest, configFile, enableFindRelatedTests, projectType (+4 more)

### Community 18 - "Key Entities *(include if"
Cohesion: 0.15
Nodes (12): Assumptions, Edge Cases, Feature Specification: [FEATURE NAME], Functional Requirements, Key Entities *(include if feature involves data)*, Measurable Outcomes, Requirements *(mandatory)*, Success Criteria *(mandatory)* (+4 more)

### Community 19 - "Phase 4: User Story"
Cohesion: 0.15
Nodes (12): Dependencies & Execution Order, Format: `[ID] [P?] [Story] Description`, Implementation for User Story 1, Implementation for User Story 2, Parallel Opportunities, Phase 1: Setup (Shared Infrastructure), Phase 2: Foundational (Blocking Prerequisites), Phase 3: User Story 1 - Flow Event Tracing (Priority: P1) 🎯 MVP (+4 more)

### Community 20 - "[PROJECT NAME] Constitution"
Cohesion: 0.18
Nodes (10): Core Principles, Governance, [PRINCIPLE_1_NAME], [PRINCIPLE_2_NAME], [PRINCIPLE_3_NAME], [PRINCIPLE_4_NAME], [PRINCIPLE_5_NAME], [PROJECT_NAME] Constitution (+2 more)

### Community 21 - "@opentelemetry/sdk logs"
Cohesion: 0.20
Nodes (10): jsonwebtoken, @opentelemetry/sdk-logs, @opentelemetry/sdk-node, dependencies, express, jsonwebtoken, @opentelemetry/sdk-logs, @opentelemetry/sdk-node (+2 more)

### Community 22 - "Implementation Plan: [FEATURE]"
Cohesion: 0.22
Nodes (8): Complexity Tracking, Constitution Check, Documentation (this feature), Implementation Plan: [FEATURE], Project Structure, Source Code (repository root), Summary, Technical Context

### Community 23 - "Quickstart: Logging Verification"
Cohesion: 0.33
Nodes (5): Prerequisites, Quickstart: Logging Verification, Step 1: Spin up the environment, Step 2: Run End-to-End Tests, Step 3: Verify Logs in Uptrace

### Community 24 - "generateUUID()"
Cohesion: 0.33
Nodes (3): options, password, USERS

### Community 25 - "[CHECKLIST TYPE] Checklist: [FEATURE NAME]"
Cohesion: 0.40
Nodes (4): [Category 1], [Category 2], [CHECKLIST TYPE] Checklist: [FEATURE NAME], Notes

### Community 26 - "Decision 2: Sensitive Data"
Cohesion: 0.40
Nodes (4): Decision 1: Logging Framework and Trace Correlation, Decision 2: Sensitive Data Sanitization (Redaction) and PII Masking, Decision 3: Database & Cache Logging, Research: Enhanced Flow Logging

### Community 27 - "@commitlint/config conventional"
Cohesion: 0.50
Nodes (3): @commitlint/config-conventional, extends, @commitlint/config-conventional

### Community 28 - "@opentelemetry/instrumentation winston"
Cohesion: 0.50
Nodes (4): @opentelemetry/instrumentation-http, @opentelemetry/instrumentation-http, @opentelemetry/instrumentation-pino, @opentelemetry/instrumentation-winston

### Community 29 - "@opentelemetry/exporter logs otlp grpc"
Cohesion: 0.67
Nodes (3): @opentelemetry/exporter-logs-otlp-grpc, @opentelemetry/exporter-logs-otlp-grpc, @opentelemetry/exporter-logs-otlp-http

### Community 30 - "@opentelemetry/exporter trace otlp grpc"
Cohesion: 0.67
Nodes (3): @opentelemetry/exporter-trace-otlp-grpc, @opentelemetry/exporter-trace-otlp-grpc, @opentelemetry/exporter-trace-otlp-http

## Knowledge Gaps
- **277 isolated node(s):** `common.sh script`, `name`, `version`, `description`, `dev` (+272 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **65 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `express` connect `OrganizationUpdateUserInput` to `notification.provider.test.ts`, `package.json`, `@opentelemetry/sdk logs`?**
  _High betweenness centrality (0.150) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `@typescript eslint/parser` to `package.json`, `@commitlint/config conventional`, `casual`, `@commitlint/cli`, `eslint`, `@eslint/css`, `@eslint/js`, `@eslint/json`, `@eslint/markdown`, `eslint plugin sonarjs`, `globals`, `husky`, `jest`, `nock`, `nodemon`, `prettier`, `@stryker mutator/core`, `@stryker mutator/jest runner`, `supertest`, `@testcontainers/kafka`, `@testcontainers/postgresql`, `@testcontainers/valkey`, `ts jest`, `ts mockito`, `ts node`, `@types/bcrypt`, `@types/chai`, `@types/cors`, `@types/eslint plugin security`, `@types/jest`, `@types/jsonwebtoken`, `@types/node`, `@types/swagger ui express`, `@types/zxcvbn`, `typescript`, `typescript eslint`, `w`?**
  _High betweenness centrality (0.132) - this node is a cross-community bridge._
- **Why does `dependencies` connect `@opentelemetry/sdk logs` to `package.json`, `@opentelemetry/instrumentation winston`, `@opentelemetry/exporter logs otlp grpc`, `@opentelemetry/exporter trace otlp grpc`, `bcrypt`, `body parser`, `cors`, `dotenv`, `helmet`, `joi`, `kafkajs`, `knex`, `@opentelemetry/api`, `@opentelemetry/auto instrumentations node`, `@opentelemetry/exporter metrics otlp http`, `@opentelemetry/instrumentation express`, `@opentelemetry/resources`, `@opentelemetry/sdk metrics`, `@opentelemetry/semantic conventions`, `@opentelemetry/winston transport`, `otpauth`, `pg`, `pino`, `pino http`, `prom client`, `swagger ui express`, `@valkey/valkey glide`, `zxcvbn`?**
  _High betweenness centrality (0.118) - this node is a cross-community bridge._
- **What connects `common.sh script`, `name`, `version` to the rest of the system?**
  _277 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `multi factor authentication.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0661729574773053 - nodes in this community are weakly interconnected._
- **Should `creating reset password.driven.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05472837022132797 - nodes in this community are weakly interconnected._
- **Should `notification.provider.test.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08243727598566308 - nodes in this community are weakly interconnected._