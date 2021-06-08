import winston from 'winston'

import config from './enviroment_config'

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  silent: config.app.enviroment !== 'development',
  defaultMeta: { service: 'user-service' },
  transports: [],
})

if (config.app.enviroment === 'development') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  )
}

export default logger
