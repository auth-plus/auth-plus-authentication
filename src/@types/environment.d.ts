declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test'
      APP_PORT: string
      DATABASE_HOST: string
      DATABASE_USER: string
      DATABASE_PASSWORD: string
      DATABASE_DATABASE: string
      DATABASE_PORT: string
      CACHE_HOST: string
      CACHE_PORT: string
      CACHE_PASSWORD: string
    }
  }
}

export {}
