-- migrate:up
CREATE TABLE IF NOT EXISTS "user_info" (
  "id" BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "user_id" BIGINT NOT NULL,
  "type" VARCHAR(64) NOT NULL,
  "value" TEXT DEFAULT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT Timezone('utc', Now()),
  CONSTRAINT fk_user_info_user FOREIGN KEY("user_id") REFERENCES "user"("id")
);
-- migrate:down
DROP TABLE "user_info";