import { createClient } from 'redis'

import env from '../../config/enviroment_config'
import logger from '../../config/logger'

const client = createClient({
  url: `redis://${env.cache.host}:${env.cache.port}`,
})

export default client
