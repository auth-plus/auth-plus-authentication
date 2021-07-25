import * as dotenv from 'dotenv'

dotenv.config()

export default {
  app: {
    name: process.env.APP_NAME ?? 'auth-plus',
    port: parseInt(process.env.APP_PORT ?? '5000'),
    enviroment: process.env.NODE_ENV ?? 'development',
  },
  database: {
    host: process.env.DATABASE_HOST ?? 'localhost',
    user: process.env.DATABASE_USER ?? 'root',
    password: process.env.DATABASE_PASSWORD ?? 'root',
    database: process.env.DATABASE_DATABASE ?? 'auth',
    port: parseInt(process.env.DATABASE_PORT ?? '5432'),
  },
  cache: {
    host: process.env.CACHE_HOST ?? 'localhost',
    port: parseInt(process.env.CACHE_PORT ?? '6379'),
  },
}
