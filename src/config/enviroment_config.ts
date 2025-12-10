import * as dotenv from 'dotenv'

dotenv.config()

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type EnvVar = {
  NODE_ENV: 'development' | 'production' | 'test'
  PORT: string
  APP_NAME: string
  JWT_SECRET: string
  DATABASE_HOST: string
  DATABASE_USER: string
  DATABASE_PASSWORD: string
  DATABASE_DATABASE: string
  DATABASE_PORT: string
  CACHE_URL: string
  KAFKA_URL: string
  ZIPKIN_URL: string
}

function verifyUndefinedEnv(env: NodeJS.ProcessEnv): env is EnvVar {
  return !Object.values(env).includes(undefined)
}

export interface Enviroment {
  app: {
    name: string
    port: number
    enviroment: string
    jwtSecret: string
  }
  database: {
    host: string
    user: string
    password: string
    database: string
    port: number
  }
  cache: {
    url: string
  }
  broker: {
    url: string
  }
  zipkin: {
    url: string
  }
}

export function getEnv(): Enviroment {
  if (!verifyUndefinedEnv(process.env)) {
    throw new Error('There is undefined enviroment variables')
  }
  return {
    app: {
      name: process.env.APP_NAME,
      port: Number(process.env.PORT),
      enviroment: process.env.NODE_ENV,
      jwtSecret: process.env.JWT_SECRET,
    },
    database: {
      host: process.env.DATABASE_HOST,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_DATABASE,
      port: Number(process.env.DATABASE_PORT),
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
}

export default {
  getEnv,
}
