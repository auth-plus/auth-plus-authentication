import * as dotenv from 'dotenv'

dotenv.config()

export default {
  app: {
    name: process.env.APP_NAME ?? 'auth-plus',
    port: parseInt(process.env.PORT ?? '5000'),
    enviroment: process.env.NODE_ENV ?? 'development',
    jwtSecret: process.env.JWT_SECRET,
  },
  database: {
    host: process.env.DATABASE_HOST ?? 'localhost',
    user: process.env.DATABASE_USER ?? 'root',
    password: process.env.DATABASE_PASSWORD ?? 'db_password',
    database: process.env.DATABASE_DATABASE ?? 'auth',
    port: parseInt(process.env.DATABASE_PORT ?? '5432'),
  },
  cache: {
    host: process.env.CACHE_HOST ?? 'localhost',
    port: parseInt(process.env.CACHE_PORT ?? '6379'),
  },
  firebase: {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
  },
  elk: {
    logstashHost: process.env.LOGSTASH_HOST,
    logstashPort: parseInt(process.env.LOGSTASH_PORT ?? '5044'),
  },
  broker: {
    host: process.env.KAFKA_HOST,
    port: process.env.KAFKA_PORT,
  },
  vault: {
    host: process.env.VAULT_HOST,
    port: process.env.VAULT_PORT,
  },
}
