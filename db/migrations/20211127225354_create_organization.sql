-- migrate:up

CREATE TABLE IF NOT EXISTS "organization" (
    "id" UUID not null default uuid_generate_v1(),
    "name" text not null,
    "parent_organization_id" UUID default null,
    "is_enable" boolean not null default TRUE,
    PRIMARY KEY ("id"),
    CONSTRAINT fk_o_parent_organization
      FOREIGN KEY("parent_organization_id") 
	  REFERENCES "organization"("id")
);

CREATE TABLE IF NOT EXISTS "organization_user" (
    "id" UUID not null default uuid_generate_v1(),
    "user_id" UUID not null,
    "organization_id" UUID not null,
    "date_create" timestamp not null default now,
    "date_remove" timestamp default null,
    PRIMARY KEY ("id"),
    CONSTRAINT fk_ou_user_id
      FOREIGN KEY("user_id") 
	  REFERENCES "user"("id"),
    CONSTRAINT fk_ou_organization_id
      FOREIGN KEY("organization_id") 
	  REFERENCES "organization"("id")
);

-- migrate:down

DROP TABLE "organization";

DROP TABLE "organization_user";