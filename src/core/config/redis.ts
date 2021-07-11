import { promisify } from 'util'

import redis from 'redis'

import config from './enviroment_config'

const client = redis.createClient({
  host: config.cache.host,
  port: config.cache.port,
})
client.on('error', function (error) {
  if (config.app.enviroment == 'development') {
    console.error(error)
  }
})
export { RedisClient as CacheType } from 'redis'

export default {
  get: promisify(client.get).bind(client),
  set: promisify(client.set).bind(client),
  expire: promisify(client.expire).bind(client),
}
