import { createClient } from 'redis'

import { getEnv } from '../../config/enviroment_config'
import logger from '../../config/logger'

const client = createClient({
  url: `redis://${getEnv().cache.url}`,
})

client.on('error', (error: Error) => {
  logger.error(error)
  client.quit().finally(() => {
    throw error
  })
})

export default client
