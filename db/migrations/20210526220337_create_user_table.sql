-- migrate:up
CREATE TABLE IF NOT EXISTS "user" (
    "id" BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "public_id" UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
    "name" VARCHAR(128) NOT NULL,
    "email" VARCHAR(64) NOT NULL UNIQUE,
    "password_hash" TEXT NOT NULL,
    "is_enable" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP NOT NULL DEFAULT Timezone('utc', Now())
);
-- migrate:down
DROP TABLE "user";