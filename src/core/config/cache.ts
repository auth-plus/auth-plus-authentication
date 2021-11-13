import { promisify } from 'util'

import * as redis from 'redis'

import env from '../../config/enviroment_config'
import logger from '../../config/logger'

const client = redis.createClient({
  host: env.cache.host,
  port: env.cache.port,
})

client.on('error', (error) => {
  if (env.app.enviroment == 'development') {
    logger.error(error)
  }
})
export interface CacheType {
  get: (arg1: string) => Promise<string | null>
  set: (arg1: string, arg2: string) => Promise<unknown>
  expire: (arg1: string, arg2: number) => Promise<number>
  del: (arg1: string) => Promise<number>
}

export default {
  get: promisify(client.get).bind(client),
  set: promisify(client.set).bind(client),
  expire: promisify(client.expire).bind(client),
  del: promisify(client.del).bind(client),
} as CacheType
