# Graph Report - .  (2026-07-29)

## Corpus Check
- Corpus is ~40,212 words - fits in a single context window. You may not need a graph.

## Summary
- 719 nodes · 1762 edges · 91 communities (17 shown, 74 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 8 edges (avg confidence: 0.61)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- MFA Providers & Use Cases
- User Management
- Infrastructure & Testing
- Organization Management
- Token & Login Management
- HTTP Routes & Schemas
- MFA Code & Services
- Reset Password Management
- Specify Bash Scripts
- TypeScript Configuration
- Package Configuration
- Stryker Configuration
- Community 12
- Community 13
- Community 14
- Community 15
- Community 16
- Community 17
- Community 18
- Community 19
- Community 20
- Community 21
- Community 22
- Community 23
- Community 24
- Community 25
- Community 26
- Community 27
- Community 28
- Community 29
- Community 30
- Community 31
- Community 32
- Community 33
- Community 34
- Community 35
- Community 36
- Community 37
- Community 38
- Community 39
- Community 40
- Community 41
- Community 42
- Community 43
- Community 44
- Community 45
- Community 46
- Community 47
- Community 48
- Community 49
- Community 50
- Community 51
- Community 52
- Community 53
- Community 54
- Community 55
- Community 56
- Community 57
- Community 58
- Community 59
- Community 60
- Community 61
- Community 62
- Community 63
- Community 64
- Community 65
- Community 66
- Community 67
- Community 68
- Community 69
- Community 70
- Community 71
- Community 72
- Community 73
- Community 74
- Community 75
- Community 76
- Community 77
- Community 78
- Community 79
- Community 80
- Community 81
- Community 82
- Community 83
- Community 84
- Community 85
- Community 86
- Community 87
- Community 88

## God Nodes (most connected - your core abstractions)
1. `Strategy` - 61 edges
2. `CacheService` - 30 edges
3. `FindingUser` - 29 edges
4. `User` - 28 edges
5. `UserRepository` - 27 edges
6. `NotificationProvider` - 20 edges
7. `compilerOptions` - 18 edges
8. `FindingMFA` - 17 edges
9. `UpdatingUser` - 17 edges
10. `MFARepository` - 15 edges

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

## Communities (91 total, 74 thin omitted)

### Community 0 - "MFA Providers & Use Cases"
Cohesion: 0.07
Nodes (36): produce(), Mfa, Strategy, MFAChooseRepository, MFARepository, MFARow, NotificationProvider, CreatingMFACode (+28 more)

### Community 1 - "User Management"
Cohesion: 0.07
Nodes (27): ShallowUser, User, UserInfo, UserInfoRow, UserInfoType, UserRepository, UserRow, CreatingSystemUser (+19 more)

### Community 2 - "Infrastructure & Testing"
Cohesion: 0.08
Nodes (29): Enviroment, EnvVar, getEnv(), verifyMandatoryEnv(), logger, CacheClient, CacheService, TOPIC (+21 more)

### Community 3 - "Organization Management"
Cohesion: 0.09
Nodes (28): Organization, OrganizationRepository, OrganizationRow, OrganizationUserRow, AddingUserToOrganization, AddingUserToOrganizationErrors, AddingUserToOrganizationErrorsTypes, CreatingOrganization (+20 more)

### Community 4 - "Token & Login Management"
Cohesion: 0.11
Nodes (21): Credential, TokenRepository, CreatingMFAChoose, CreatingToken, FindingMFA, FindingMFAErrorsTypes, FindingUserErrorsTypes, InvalidatingToken (+13 more)

### Community 5 - "HTTP Routes & Schemas"
Cohesion: 0.06
Nodes (40): express, getPostgres(), getKafka(), getCore(), app, LoginInput, loginRoute, { object, string } (+32 more)

### Community 6 - "MFA Code & Services"
Cohesion: 0.10
Nodes (15): CacheCode, MFACodeRepository, TotpService, UuidService, FindingMFACode, FindingMFACodeErrors, FindingMFACodeErrorsTypes, FindingMFAErrors (+7 more)

### Community 7 - "Reset Password Management"
Cohesion: 0.15
Nodes (13): ResetPasswordRepository, CreatingResetPassword, FindingResetPassword, FindingResetPasswordErrors, FindingResetPasswordErrorsTypes, SendingResetEmail, ForgetPassword, ForgetPasswordErrors (+5 more)

### Community 8 - "Specify Bash Scripts"
Cohesion: 0.10
Nodes (12): check-prerequisites.sh script, check_dir(), check_file(), get_feature_paths(), get_repo_root(), has_jq(), _persist_feature_json(), resolve_specify_init_dir() (+4 more)

### Community 9 - "TypeScript Configuration"
Cohesion: 0.08
Nodes (23): ESNEXT, src/**/*, compilerOptions, emitDecoratorMetadata, esModuleInterop, experimentalDecorators, isolatedModules, lib (+15 more)

### Community 10 - "Package Configuration"
Cohesion: 0.09
Nodes (22): author, bugs, url, description, engines, node, homepage, keywords (+14 more)

### Community 11 - "Stryker Configuration"
Cohesion: 0.15
Nodes (12): html, _comment, concurrency, coverageAnalysis, jest, configFile, enableFindRelatedTests, projectType (+4 more)

### Community 12 - "Community 12"
Cohesion: 0.18
Nodes (11): @eslint/js, husky, devDependencies, @eslint/js, husky, @stryker-mutator/core, @types/chai, @types/supertest (+3 more)

### Community 13 - "Community 13"
Cohesion: 0.22
Nodes (9): bcrypt, kafkajs, dependencies, bcrypt, kafkajs, pg, prom-client, pg (+1 more)

### Community 14 - "Community 14"
Cohesion: 0.33
Nodes (3): options, password, USERS

## Knowledge Gaps
- **173 isolated node(s):** `@commitlint/config-conventional`, `common.sh script`, `name`, `version`, `description` (+168 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **74 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `devDependencies` connect `Community 12` to `Package Configuration`, `Community 19`, `Community 20`, `Community 21`, `Community 22`, `Community 25`, `Community 26`, `Community 27`, `Community 28`, `Community 29`, `Community 30`, `Community 32`, `Community 36`, `Community 40`, `Community 41`, `Community 42`, `Community 67`, `Community 68`, `Community 69`, `Community 70`, `Community 71`, `Community 72`, `Community 73`, `Community 74`, `Community 75`, `Community 76`, `Community 77`, `Community 78`, `Community 79`, `Community 80`, `Community 81`, `Community 82`, `Community 83`, `Community 84`, `Community 85`, `Community 86`, `Community 87`, `Community 88`?**
  _High betweenness centrality (0.192) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Community 13` to `Package Configuration`, `Community 18`, `Community 23`, `Community 24`, `Community 31`, `Community 33`, `Community 37`, `Community 38`, `Community 39`, `Community 43`, `Community 44`, `Community 45`, `Community 46`, `Community 47`, `Community 48`, `Community 49`, `Community 50`, `Community 51`, `Community 52`, `Community 53`, `Community 54`, `Community 55`, `Community 56`, `Community 57`, `Community 58`, `Community 59`, `Community 60`, `Community 61`, `Community 62`, `Community 63`, `Community 64`, `Community 65`, `Community 66`?**
  _High betweenness centrality (0.188) - this node is a cross-community bridge._
- **Why does `express` connect `HTTP Routes & Schemas` to `Package Configuration`, `Infrastructure & Testing`?**
  _High betweenness centrality (0.180) - this node is a cross-community bridge._
- **What connects `@commitlint/config-conventional`, `common.sh script`, `name` to the rest of the system?**
  _173 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `MFA Providers & Use Cases` be split into smaller, more focused modules?**
  _Cohesion score 0.06867305061559507 - nodes in this community are weakly interconnected._
- **Should `User Management` be split into smaller, more focused modules?**
  _Cohesion score 0.06666666666666667 - nodes in this community are weakly interconnected._
- **Should `Infrastructure & Testing` be split into smaller, more focused modules?**
  _Cohesion score 0.08298368298368299 - nodes in this community are weakly interconnected._