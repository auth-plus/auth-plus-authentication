import { StartedPostgreSqlContainer } from '@testcontainers/postgresql'
import knex, { Knex } from 'knex'

export async function setupDB(container: StartedPostgreSqlContainer) {
  const database = knex({
      client: 'pg',
      version: '11.12',
      connection: {
        host: container.getHost(),
        port: container.getPort(),
        database: container.getDatabase(),
        user: container.getUsername(),
        password: container.getPassword(),
      },
    }),
    tables = `
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    CREATE TABLE IF NOT EXISTS "user" (
        "id" UUID NOT NULL DEFAULT Uuid_generate_v1(),
        "name" VARCHAR(128) NOT NULL,
        "email" VARCHAR(64) NOT NULL UNIQUE,
        "password_hash" TEXT NOT NULL,
        "is_enable" BOOLEAN NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT Timezone('utc', Now()),
        PRIMARY KEY ("id")
    );

    CREATE TABLE IF NOT EXISTS "user_info" (
        "id" UUID NOT NULL DEFAULT Uuid_generate_v1(),
        "user_id" UUID NOT NULL,
        "type" VARCHAR(64) NOT NULL,
        "value" TEXT DEFAULT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT Timezone('utc', Now()),
        PRIMARY KEY ("id"),
        CONSTRAINT fk_user_info_user FOREIGN KEY("user_id") REFERENCES "user"("id")
    );

    CREATE TABLE IF NOT EXISTS "multi_factor_authentication" (
      "id" UUID NOT NULL DEFAULT Uuid_generate_v1(),
      "user_id" UUID NOT NULL,
      "strategy" VARCHAR(32) NOT NULL,
      "is_enable" BOOLEAN NOT NULL DEFAULT false,
      "created_at" TIMESTAMP NOT NULL DEFAULT Timezone('utc', Now()),
      PRIMARY KEY ("id"),
      CONSTRAINT fk_mfa_user FOREIGN KEY("user_id") REFERENCES "user"("id")
    );

    CREATE TABLE IF NOT EXISTS "organization" (
      "id" UUID NOT NULL DEFAULT Uuid_generate_v1(),
      "name" TEXT NOT NULL,
      "document" VARCHAR(64) DEFAULT NULL,
      "document_type" VARCHAR(32) DEFAULT NULL,
      "parent_organization_id" UUID DEFAULT NULL,
      "is_enable" BOOLEAN NOT NULL DEFAULT true,
      "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY ("id"),
      CONSTRAINT fk_o_parent_organization FOREIGN KEY("parent_organization_id") REFERENCES "organization"("id")
    );

    CREATE TABLE IF NOT EXISTS "organization_user" (
      "id" UUID NOT NULL DEFAULT Uuid_generate_v1(),
      "user_id" UUID NOT NULL,
      "organization_id" UUID NOT NULL,
      "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "remove_at" TIMESTAMP DEFAULT NULL,
      PRIMARY KEY ("id"),
      CONSTRAINT fk_ou_user_id FOREIGN KEY("user_id") REFERENCES "user"("id"),
      CONSTRAINT fk_ou_organization_id FOREIGN KEY("organization_id") REFERENCES "organization"("id")
    );
  `
  await database.raw(tables)
  return database
}

export async function truncate(database: Knex) {
  await database('organization_user').del()
  await database('organization').del()
  await database('multi_factor_authentication').del()
  await database('user_info').del()
  await database('user').del()
}
