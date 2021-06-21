-- migrate:up
CREATE TABLE IF NOT EXISTS "multi_factor_authentication" (
    "id" UUID not null default uuid_generate_v1(),
    "user_id" UUID not null,
    "strategy" varchar(32) not null,
    "is_enable" boolean not null default TRUE,
    PRIMARY KEY ("id"),
    CONSTRAINT fk_mfa_user
      FOREIGN KEY("user_id") 
	  REFERENCES "user"("id")
);

-- migrate:down

DROP TABLE "multi_factor_authentication";
