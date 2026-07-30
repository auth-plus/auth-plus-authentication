import * as dotenv from 'dotenv'

dotenv.config({ quiet: true })

interface EnvVar extends NodeJS.ProcessEnv {
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
  OTEL_EXPORTER_OTLP_ENDPOINT: string
  LOG_LEVEL: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal'
}

function verifyMandatoryEnv(env: NodeJS.ProcessEnv): env is EnvVar {
  const mandatoryKeys: (keyof EnvVar)[] = [
    'NODE_ENV',
    'PORT',
    'APP_NAME',
    'JWT_SECRET',
    'DATABASE_HOST',
    'DATABASE_USER',
    'DATABASE_PASSWORD',
    'DATABASE_DATABASE',
    'DATABASE_PORT',
    'CACHE_URL',
    'LOG_LEVEL',
  ]

  // eslint-disable-next-line security/detect-object-injection
  return mandatoryKeys.every((key) => env[key] !== undefined)
}

export interface Enviroment {
  app: {
    name: string
    port: number
    enviroment: string
    jwtSecret: string
    logLevel: string
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
  signoz: {
    url: string
  }
}

export function getEnv(): Enviroment {
  if (!verifyMandatoryEnv(process.env)) {
    throw new Error('There is undefined enviroment variables')
  }
  return {
    app: {
      name: process.env.APP_NAME,
      port: Number(process.env.PORT),
      enviroment: process.env.NODE_ENV,
      jwtSecret: process.env.JWT_SECRET,
      logLevel: process.env.LOG_LEVEL,
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
      url: process.env.KAFKA_URL || 'http://localhost:9092',
    },
    signoz: {
      url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318',
    },
  }
}

export default {
  getEnv,
}
