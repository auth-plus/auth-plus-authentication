import Knex from "knex";
import env from "./env";

export default Knex({
  client: "mysql",
  connection: {
    host: "127.0.0.1",
    user: env.db.DB_USER,
    password: env.db.DB_PW,
    database: env.db.DB_NAME
  }
});
