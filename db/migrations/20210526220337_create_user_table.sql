-- migrate:up
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
-- migrate:down
DROP TABLE "user";