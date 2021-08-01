import { promisify } from 'util'

import * as redis from 'redis'

import config from './enviroment_config'

const client = redis.createClient({
  host: config.cache.host,
  port: config.cache.port,
})

client.on('error', (error) => {
  if (config.app.enviroment == 'development') {
    console.error(error)
  }
})
export interface CacheType {
  get: (arg1: string) => Promise<string | null>
  set: (arg1: string, arg2: string) => Promise<unknown>
  expire: (arg1: string, arg2: number) => Promise<number>
}

export default {
  get: promisify(client.get).bind(client),
  set: promisify(client.set).bind(client),
  expire: promisify(client.expire).bind(client),
} as CacheType
