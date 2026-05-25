-- migrate:up
CREATE TABLE IF NOT EXISTS "multi_factor_authentication" (
  "id" BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "public_id" UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  "user_id" BIGINT NOT NULL,
  "strategy" VARCHAR(32) NOT NULL,
  "is_enable" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP NOT NULL DEFAULT Timezone('utc', Now()),
  CONSTRAINT fk_mfa_user FOREIGN KEY("user_id") REFERENCES "user"("id")
);
-- migrate:down
DROP TABLE "multi_factor_authentication";