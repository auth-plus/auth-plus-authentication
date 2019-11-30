import dot from "dotenv";

dot.config();

export default {
  app: {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    JWT_HASH: process.env.JWT_HASH
  },
  db: {
    DB_NAME: process.env.DB_NAME,
    DB_USER: process.env.DB_USER,
    DB_PW: process.env.DB_PW
  }
};
