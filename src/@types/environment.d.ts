declare global {
  namespace NodeJS {
    interface ProcessEnv {
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
    }
  }
}

export {}
