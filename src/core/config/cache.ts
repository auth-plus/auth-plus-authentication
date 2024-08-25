import {
  RedisClientType,
  RedisDefaultModules,
  RedisFunctions,
  RedisModules,
  RedisScripts,
  createClient,
} from 'redis'

import { getEnv } from '../../config/enviroment_config'
import logger from '../../config/logger'

let client: RedisClient
export function getRedis(url: string): RedisClient {
  if (client != undefined) {
    return client
  } else {
    client = createClient({
      url: url ?? `redis://${getEnv().cache.url}`,
    })
    client.on('error', (error: Error) => {
      logger.error('error on connecting:', error)
      client.quit().finally(() => {
        throw error
      })
    })
    return client
  }
}

export type RedisClient = RedisClientType<
  RedisDefaultModules & RedisModules,
  RedisFunctions,
  RedisScripts
>
