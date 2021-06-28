import { promisify } from 'util'

import redis from 'redis'

import config from './enviroment_config'

const client = redis.createClient({
  host: config.cache.host,
  port: config.cache.port,
})
const getAsync = promisify(client.get).bind(client)
const setAsync = promisify(client.set).bind(client)

export interface CacheType {
  get: (arg1: string) => Promise<string | null>
  set: (
    arg1: string,
    arg2: string,
    mode: string,
    duration: number
  ) => Promise<unknown>
}

export default {
  get: getAsync,
  set: setAsync,
} as CacheType
