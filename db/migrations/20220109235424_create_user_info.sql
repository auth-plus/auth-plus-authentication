-- migrate:up
CREATE TABLE IF NOT EXISTS "user_info" (
  "id" UUID NOT NULL DEFAULT Uuid_generate_v1(),
  "user_id" UUID NOT NULL,
  "type" VARCHAR(64) NOT NULL,
  "value" TEXT DEFAULT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT Timezone('utc', Now()),
  PRIMARY KEY ("id"),
  CONSTRAINT fk_user_info_user FOREIGN KEY("user_id") REFERENCES "user"("id")
);
-- migrate:down
DROP TABLE "user_info";