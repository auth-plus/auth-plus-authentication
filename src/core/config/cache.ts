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
export async function getRedis(url: string): Promise<RedisClient> {
  if (client != undefined) {
    return client
  } else {
    client = await createClient({
      url: `redis://${url ?? getEnv().cache.url}`,
    })
      .on('error', (error: Error) => {
        logger.error('error on connecting:', error)
        throw error
      })
      .connect()
    return client
  }
}

export type RedisClient = RedisClientType<
  RedisDefaultModules & RedisModules,
  RedisFunctions,
  RedisScripts
>
