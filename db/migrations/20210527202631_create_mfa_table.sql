-- migrate:up
CREATE TABLE IF NOT EXISTS "multi_factor_authentication" (
  "id" UUID NOT NULL DEFAULT Uuid_generate_v1(),
  "user_id" UUID NOT NULL,
  "strategy" VARCHAR(32) NOT NULL,
  "is_enable" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP NOT NULL DEFAULT Timezone('utc', Now()),
  PRIMARY KEY ("id"),
  CONSTRAINT fk_mfa_user FOREIGN KEY("user_id") REFERENCES "user"("id")
);
-- migrate:down
DROP TABLE "multi_factor_authentication";