-- migrate:up

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS "user" (
    "id" UUID not null default uuid_generate_v1(),
    "name" varchar(128) not null,
    "email" varchar(64) not null UNIQUE,
    "password_hash" text not null,
    "is_enable" boolean not null default TRUE,
    "created_at" timestamp not null default timezone('utc', now()),
    PRIMARY KEY ("id")
);


-- migrate:down

DROP TABLE "user";