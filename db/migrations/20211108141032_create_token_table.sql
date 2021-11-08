-- migrate:up
CREATE TABLE IF NOT EXISTS "token" (
    "id" UUID not null default uuid_generate_v1(),
    "value" text not null,
    "user_id" UUID not null,
    "is_enable" boolean not null default FALSE,
    PRIMARY KEY ("id"),
    CONSTRAINT fk_token_user
      FOREIGN KEY("user_id") 
	  REFERENCES "user"("id")
);

-- migrate:down

DROP TABLE "token";