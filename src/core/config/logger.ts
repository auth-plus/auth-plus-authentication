import { createLogger, format, transports } from 'winston'

import config from './enviroment_config'

const logger = createLogger({
  level: 'info',
  format: format.json(),
  silent: config.app.enviroment !== 'development',
  defaultMeta: { service: 'user-service' },
  transports: [],
})

if (config.app.enviroment === 'development') {
  logger.add(
    new transports.Console({
      format: format.simple(),
    })
  )
}

export default logger
