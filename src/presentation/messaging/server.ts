import env from '../../config/enviroment_config'
import { configKafka, consume } from '../../config/kafka'
import logger from '../../config/logger'

import { app } from './app'

export function run() {
  configKafka().then(() => {
    consume(app).catch((e) =>
      logger.error(`[${env.app.name}/consumer] ${e.message}`, e)
    )
  })
}

run()
