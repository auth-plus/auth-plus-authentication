import { createClient } from 'redis'

import logger from '../../config/logger'

export type RedisClient = ReturnType<typeof createClient>
let client: RedisClient
export async function getRedis(url: string): Promise<RedisClient> {
  if (client != undefined) {
    return client
  }
  client = await createClient({
    url: url.includes('redis') ? url : `redis://${url}`,
  })
    .on('error', (error: Error) => {
      logger.error('error on connecting:', error)
      throw error
    })
    .connect()
  return client
}
