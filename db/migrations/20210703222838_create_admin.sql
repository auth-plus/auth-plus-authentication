-- migrate:up
INSERT INTO "user"
            ("email",
             "name",
             "password_hash")
VALUES      ('admin@authplus.com',
             'administrator',
             '$2b$12$N5NbVrKwQYjDl6xFdqdYdunBnlbl1oyI32Uo5oIbpkaXoeG6fF1Ji');
-- migrate:down
DELETE FROM "user"
WHERE  "email" = 'admin@authplus.com'
       AND "name" = 'administrator'
       AND "password_hash" =
           '$2b$12$N5NbVrKwQYjDl6xFdqdYdunBnlbl1oyI32Uo5oIbpkaXoeG6fF1Ji'; 