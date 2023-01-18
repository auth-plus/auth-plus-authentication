import * as dotenv from 'dotenv'

dotenv.config()

export default {
  app: {
    name: process.env.APP_NAME,
    port: parseInt(process.env.PORT),
    enviroment: process.env.NODE_ENV,
    jwtSecret: process.env.JWT_SECRET,
  },
  database: {
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_DATABASE,
    port: parseInt(process.env.DATABASE_PORT),
  },
  cache: {
    url: process.env.CACHE_URL,
  },
  broker: {
    url: process.env.KAFKA_URL,
  },
  zipkin: {
    url: process.env.ZIPKIN_URL,
  },
}
