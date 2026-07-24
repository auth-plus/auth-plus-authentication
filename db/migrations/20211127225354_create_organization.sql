-- migrate:up
CREATE TABLE IF NOT EXISTS "organization" (
  "id" BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "public_id" UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  "name" TEXT NOT NULL,
  "document" VARCHAR(64) DEFAULT NULL,
  "document_type" VARCHAR(32) DEFAULT NULL,
  "parent_organization_id" BIGINT DEFAULT NULL,
  "is_enable" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_o_parent_organization FOREIGN KEY("parent_organization_id") REFERENCES "organization"("id")
);
CREATE TABLE IF NOT EXISTS "organization_user" (
  "id" BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "user_id" BIGINT NOT NULL,
  "organization_id" BIGINT NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "remove_at" TIMESTAMP DEFAULT NULL,
  CONSTRAINT fk_ou_user_id FOREIGN KEY("user_id") REFERENCES "user"("id"),
  CONSTRAINT fk_ou_organization_id FOREIGN KEY("organization_id") REFERENCES "organization"("id")
);
-- migrate:down
DROP TABLE "organization_user";
DROP TABLE "organization";