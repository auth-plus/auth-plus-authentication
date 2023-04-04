-- migrate:up
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
-- migrate:down
DROP TABLE "organization_user";
DROP TABLE "organization";