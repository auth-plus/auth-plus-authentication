import { createClient } from 'redis'

import env from '../../config/enviroment_config'
import logger from '../../config/logger'

const client = createClient({
  url: `redis://${env.cache.url}`,
})

client.on('error', (error: Error) => {
  logger.error(error)
  client.quit().finally(() => {
    throw error
  })
})

export default client
