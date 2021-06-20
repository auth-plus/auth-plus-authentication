import { promisify } from 'util'

import redis from 'redis'

import config from './enviroment_config'

const client = redis.createClient({
  host: config.cache.host,
  port: config.cache.port,
  password: config.cache.password,
})
const getAsync = promisify(client.get).bind(client)
const setAsync = promisify(client.set).bind(client)

export default {
  get: getAsync,
  set: setAsync,
}
