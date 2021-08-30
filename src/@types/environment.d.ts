declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test'
      PORT: string
      APP_NAME: string
      DATABASE_HOST: string
      DATABASE_USER: string
      DATABASE_PASSWORD: string
      DATABASE_DATABASE: string
      DATABASE_PORT: string
      CACHE_HOST: string
      CACHE_PORT: string
      FIREBASE_API_KEY: string
      FIREBASE_AUTH_DOMAIN: string
      FIREBASE_PROJECT_ID: string
      FIREBASE_STORAGE_BUCKET: string
      FIREBASE_MESSAGING_SENDER_ID: string
      FIREBASE_APP_ID: string
    }
  }
}

export {}
