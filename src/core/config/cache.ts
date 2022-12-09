import { createClient } from 'redis'

import env from '../../config/enviroment_config'
import logger from '../../config/logger'

export const redis = createClient({
  url: `redis://${env.cache.host}:${env.cache.port}`,
  socket: {
    port: env.cache.port,
    keepAlive: false,
  },
})

redis.on('error', async (err: Error) => {
  logger.error(`Redis error: ${err.message}`)
  await redis.quit()
})

export function redisConnect() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ): PropertyDescriptor {
    const originalMethod = descriptor.value
    descriptor.value = async function (...args: any[]) {
      await redis.connect()
      const result = originalMethod.apply(this, args)
      await redis.disconnect()
      return result
    }
    return descriptor
  }
}
