# AGENTS.md - Auth+ Authentication Service

> **Propósito:** Ponto de entrada técnico e guia de regras de negócio para Agentes de IA atuando no microsserviço `auth-plus-authentication`.
>
> **Bounded Context:** Gerenciamento de Identidade, Autenticação, Multi-Factor Authentication (MFA), Organizações e Autorização por Tokens JWT.

---

## 1. Visão Geral e Stack Tecnológica

O `auth-plus-authentication` é o microsserviço responsável pela gestão de identidade de todo o ecossistema `auth-plus`.

- **Runtime / Linguagem:** Node.js (v24.x / `.nvmrc`: `24.10`) com TypeScript (v6.x)
- **Framework Web:** Express.js 5.x
- **Arquitetura:** Hexagonal / Ports & Adapters:
  - `src/core/entities/`: Entidades de domínio puras (`user`, `credentials`, `mfa`, `strategy`, `organization`)
  - `src/core/driver/`: Portas de entrada (inbound ports / interfaces de use cases)
  - `src/core/driven/`: Portas de saída (outbound ports / interfaces de repositórios e serviços externos)
  - `src/core/usecases/` e `src/core/services/`: Casos de uso e serviços de domínio
  - `src/adapters/inbound/http/`: Controllers, rotas Express, middlewares (`jwt`, `trace`) e Swagger
  - `src/adapters/outbound/`: Adaptadores externos (Knex/PostgreSQL, Valkey, Kafka)
- **Persistência Relacional:** PostgreSQL 17.6 (`database:5432/auth`) via Knex.js
- **Cache & Sessão:** Valkey via `@valkey/valkey-glide` (`cache:6379`)
- **Mensageria:** Apache Kafka (`kafka:9092`) via `kafkajs`
- **Criptografia de Senhas:** `bcrypt` (v6.0.0)
- **Observabilidade:** OpenTelemetry Node SDK integrado ao Uptrace / `otelcol:4317` e métricas Prometheus via `/metrics`
- **Porta:** `5000` (host e container)

---

## 2. Regras de Negócio Fundamentais

### 2.1. Ciclo de Vida do Usuário e Cadastro
1. **Unicidade de Identidade:** O e-mail do usuário é único no sistema. Tentativas de cadastro com e-mail duplicado devem retornar erro de negócio explícito (`USER_ALREADY_EXISTS`).
2. **Senha e Criptografia:** Senhas nunca são persistidas em texto plano. Devem ser tratadas via hash criptográfico com `bcrypt`.
3. **Publicação de Evento de Criação:** Ao cadastrar um novo usuário com sucesso, o serviço **deve obrigatoriamente** emitir o evento `USER_CREATED` no Kafka para sincronização com os serviços `billing`, `monetization` e `notification`.
4. **Informações Adicionais (`user_info`):** Dados de contato (como `phone` e `totpToken`) são armazenados na tabela `user_info` associada ao usuário para suportar canais de MFA.
5. **Autenticação de Rotas de Usuário:** As operações de usuário (`POST /user`, `PATCH /user`, `GET /user`) são protegidas via `jwtMiddleware` (requer `Authorization: Bearer <token>`).

### 2.2. Fluxo de Autenticação (Login) & MFA Obrigatório
1. **Proteção contra Enumeração:** Em caso de credenciais inválidas (usuário não encontrado ou senha incorreta), o retorno deve ser padronizado como `WRONG_CREDENTIAL` (HTTP 500 / 401), sem expor se o e-mail existe no banco.
2. **Desafio de MFA Condicional:**
   - Se o usuário **NÃO** possui estratégias de MFA cadastradas e ativas: o sistema autentica diretamente (`POST /login`) e emite o token JWT com `{ id, name, email, token }`.
   - Se o usuário **POSSUI** estratégias de MFA ativas: o sistema **NÃO** emite o JWT no primeiro passo. Em vez disso, armazena um desafio temporário em cache (Valkey) e retorna `{ hash, strategyList }` (`EMAIL`, `PHONE`, etc.).
3. **Seleção e Validação do Desafio MFA:**
   - O usuário escolhe a estratégia via `POST /mfa/choose` enviando `{ hash, strategy }`. Um código OTP de 6 dígitos é gerado, persistido no cache (`strategy:<hash>`) e despachado via Kafka (`2FA_EMAIL_SENT` ou `2FA_PHONE_SENT`). O endpoint retorna o `{ hash }`.
   - O JWT definitivo só é gerado após a validação bem-sucedida do código OTP em `POST /mfa/code` enviando `{ hash, code }`, que retorna `{ id, name, email, token }`.

### 2.3. Multi-Factor Authentication (MFA) - Configuração e Ativação
1. **Estratégias Suportadas:** `EMAIL`, `PHONE` (SMS/WhatsApp) e `TOTP` (Google Authenticator / TOTP).
2. **Cadastro de Método:** `POST /mfa` recebe `{ userId, strategy }` e cria a estratégia com `is_enable = false`, retornando `{ mfaId }`. Dispara hash inicial via Kafka (`2FA_EMAIL_CREATED` ou `2FA_PHONE_CREATED`).
3. **Ativação Segura:** `POST /mfa/validate` recebe `{ id: mfaId }` e ativa a estratégia (`is_enable = true`).
4. **Listagem:** `GET /mfa/:id` lista as estratégias MFA ativas cadastradas para o usuário.

### 2.4. Sessão e Token Lifecycle
1. **Renovação de Token (Refresh):** `GET /login/refresh/:token` com Bearer JWT invalida o token anterior no Valkey (`invalidate:<token>`) e gera um novo par de credenciais.
2. **Logout:** `POST /logout` com Bearer JWT encerra a sessão imediatamente, registrando o token na blacklist do Valkey (`invalidate:<token>`).

### 2.5. Recuperação de Senha (Password Reset)
1. **Solicitação:** `POST /password/forget` recebe `{ email }`, cria hash no Valkey (`reset-password:<hash>`) com TTL e despacha evento `RESET_PASSWORD` no Kafka.
2. **Redefinição:** `POST /password/recover` recebe `{ hash, password }`, valida o hash temporário no Valkey, atualiza a senha criptografada com `bcrypt` no banco e invalida o hash.

### 2.6. Gestão de Organizações
1. **Criação:** `POST /organization` recebe `{ name, parentId }` e cria a organização.
2. **Associação de Membros:** `POST /organization/add` recebe `{ organizationId, userId }`.
3. **Atualização:** `PATCH /organization` recebe `{ organizationId, name, parentId }`.

---

## 3. Contratos de API (Endpoints)

| Método | Rota | Descrição | Autenticação Requerida |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | Healthcheck do serviço | Não |
| `GET` | `/metrics` | Métricas Prometheus | Não |
| `POST` | `/login` | Início de login (retorna JWT ou desafio MFA) | Não |
| `GET` | `/login/refresh/:token` | Renovação de token de autenticação | Sim (Bearer JWT) |
| `POST` | `/logout` | Invalidação de sessão / blacklist do token | Sim (Bearer JWT) |
| `POST` | `/user` | Criação de novo usuário | Sim (Bearer JWT) |
| `PATCH` | `/user` | Atualização de dados cadastrais do usuário | Sim (Bearer JWT) |
| `GET` | `/user` | Listagem de usuários | Sim (Bearer JWT) |
| `POST` | `/mfa` | Criação/registro de novo método MFA | Não |
| `GET` | `/mfa/:id` | Listagem de estratégias ativas do usuário | Não |
| `POST` | `/mfa/validate` | Validação/ativação do método MFA criado | Não |
| `POST` | `/mfa/choose` | Seleção do canal MFA no login (despacha OTP) | Não (Desafio Hash) |
| `POST` | `/mfa/code` | Validação de código OTP de login e emissão de JWT | Não (Desafio Hash) |
| `POST` | `/password/forget` | Solicitação de reset de senha (emite evento Kafka) | Sim (Bearer JWT) |
| `POST` | `/password/recover` | Redefinição de senha com hash de desafio | Sim (Bearer JWT) |
| `POST` | `/organization` | Criação de nova organização | Sim (Bearer JWT) |
| `POST` | `/organization/add` | Adição de membro à organização | Sim (Bearer JWT) |
| `PATCH` | `/organization` | Atualização de organização | Sim (Bearer JWT) |

---

## 4. Eventos de Mensageria (Kafka Producer)

O serviço publica nos seguintes tópicos do Kafka:

- **`USER_CREATED`**: Disparado ao criar usuário. Payload: `{ "external_id": "<uuid>" }`.
- **`2FA_EMAIL_CREATED` / `2FA_PHONE_CREATED`**: Hash de desafio para ativação de MFA. Payload: `{ "email": "...", "content": "<hash>" }`.
- **`2FA_EMAIL_SENT` / `2FA_PHONE_SENT`**: Código OTP de 6 dígitos disparado para o canal do usuário durante o login. Payload: `{ "email": "...", "content": "<code>" }`.
- **`RESET_PASSWORD`**: Solicitação de redefinição de senha. Payload: `{ "email": "...", "hash": "<token>" }`.

---

## 5. Instruções de Desenvolvimento e Testes

```bash
# Instalação de dependências
npm ci # ou npm install

# Execução em desenvolvimento local (nodemon)
npm run dev

# Compilação TypeScript
npm run build
npm run build:check

# Testes unitários e de integração (Jest com Testcontainers)
npm test

# Testes de mutação (Stryker)
npm run stryker

# Linting e Formatação
npm run lint
npm run lint:check
```

---

## 6. Diretrizes para Agentes de IA

1. **Camadas Arquiteturais:** Mantenha a separação rígida entre `core` (regras puras, interfaces driver/driven sem dependência de frameworks) e `adapters` (Express, Knex, KafkaJS, Valkey).
2. **Propagação de Tracing:** Em todos os produtores Kafka e rotas Express, garanta que o contexto OpenTelemetry seja extraído e propagado via headers W3C (`traceparent`).
3. **Migrações de Banco:** Toda alteração de schema deve ser criada dentro de `db/migrations/` e executada de forma versionada.
