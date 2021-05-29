-- migrate:up

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS "user" (
    "id" UUID not null default uuid_generate_v1(),
    "name" varchar(128) not null,
    "email" varchar(64) not null,
    "password_hash" text not null,
    PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "organization" (
    "id" UUID not null default uuid_generate_v1(),
    "name" varchar(128) not null,
    "document" varchar(64) not null,
    "document_type" varchar(32) not null,
    PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "administrator" (
    "id" UUID not null default uuid_generate_v1(),
    "user_id" UUID not null,
    PRIMARY KEY ("id"),
    CONSTRAINT fk_administrator_user
      FOREIGN KEY("user_id") 
	  REFERENCES "user"("id")
);

CREATE TABLE IF NOT EXISTS "organization_manager" (
    "id" UUID not null default uuid_generate_v1(),
    "user_id" UUID not null,
    "organization_id" UUID not null,
    PRIMARY KEY ("id"),
    CONSTRAINT fk_om_user
      FOREIGN KEY("user_id") 
	  REFERENCES "user"("id"),
    CONSTRAINT fk_om_organization
      FOREIGN KEY("organization_id") 
	  REFERENCES "organization"("id")
);

CREATE TABLE IF NOT EXISTS "organization_user" (
    "id" UUID not null default uuid_generate_v1(),
    "user_id" UUID not null,
    "organization_id" UUID not null,
    PRIMARY KEY ("id"),
    CONSTRAINT fk_ou_user
      FOREIGN KEY("user_id") 
	  REFERENCES "user"("id"),
    CONSTRAINT fk_ou_organization
      FOREIGN KEY("organization_id") 
	  REFERENCES "organization"("id")
);

-- migrate:down

DROP TABLE "user";
DROP TABLE "organization";
DROP TABLE "administrator";
DROP TABLE "organization_manager";
DROP TABLE "organization_user";
