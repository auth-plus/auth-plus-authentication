import * as dotenv from 'dotenv'

dotenv.config()

export default {
  app: {
    name: process.env.APP_NAME,
    port: parseInt(process.env.APP_PORT ?? '5000'),
    enviroment: process.env.NODE_ENV,
  },
  database: {
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_DATABASE,
    port: parseInt(process.env.DATABASE_PORT ?? '5432'),
  },
  cache: {
    host: process.env.CACHE_HOST,
    port: parseInt(process.env.CACHE_PORT ?? '6379'),
  },
}
