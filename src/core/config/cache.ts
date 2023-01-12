import { createClient } from 'redis'

import env from '../../config/enviroment_config'

const client = createClient({
  url: `redis://${env.cache.url}`,
})

export default client
