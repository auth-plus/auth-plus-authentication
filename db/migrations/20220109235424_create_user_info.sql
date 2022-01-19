-- migrate:up

CREATE TABLE IF NOT EXISTS "user_info" (
    "id" UUID not null default uuid_generate_v1(),
    "user_id" UUID not null,
    "type" varchar(64) not null,
    "value" text default null,
    "created_at" timestamp not null default timezone('utc', now()),
    PRIMARY KEY ("id"),
    CONSTRAINT fk_user_info_user
      FOREIGN KEY("user_id") 
	    REFERENCES "user"("id")
);


-- migrate:down

DROP TABLE "user_info";