import env from '../../config/enviroment_config'
import { consume } from '../../config/kafka'
import logger from '../../config/logger'

import { app } from './app'

consume(app).catch((e) =>
  logger.error(`[${env.app.name}/consumer] ${e.message}`, e)
)
