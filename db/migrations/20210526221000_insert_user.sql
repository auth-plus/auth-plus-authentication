-- migrate:up

INSERT INTO "user"
            ("email",
             "name",
             "password_hash")
VALUES      ('admin@authplus.com',
             'Administrador',
             '$2b$12$ihP6.Wwn.6/UvAZvkv/F5uMOOAZ3VxzMp/sUoyniXlcQP8M7uD1iy') 

-- migrate:down

DELETE FROM "user"
WHERE  "email" = 'admin@authplus.com'
       AND "name" = 'Administrador'
       AND "password_hash" =
           '$2b$12$ihP6.Wwn.6/UvAZvkv/F5uMOOAZ3VxzMp/sUoyniXlcQP8M7uD1iy' 