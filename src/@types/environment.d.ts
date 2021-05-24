declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production'
      APP_PORT?: string
    }
  }
}

export {}
