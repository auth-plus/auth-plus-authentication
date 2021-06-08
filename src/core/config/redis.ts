import { promisify } from 'util'

import redis from 'redis'

const client = redis.createClient()
const getAsync = promisify(client.get).bind(client)
const setAsync = promisify(client.set).bind(client)

export default {
  get: getAsync,
  set: setAsync,
}
