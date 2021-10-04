import { createLogger, format, transports } from 'winston'

import config from './enviroment_config'

const logger = createLogger({
  level: 'info',
  format: format.combine(format.errors({ stack: true }), format.timestamp()),
  defaultMeta: { service: config.app.name },
})

if (config.app.enviroment === 'development') {
  logger.add(
    new transports.Console({
      format: format.simple(),
    })
  )
  logger.add(
    new transports.Http({
      host: config.elk.logstashHost,
      port: config.elk.logstashPort,
      format: format.json(),
    })
  )
}

if (config.app.enviroment === 'production') {
  logger.add(
    new transports.Http({
      host: config.elk.logstashHost,
      port: config.elk.logstashPort,
      format: format.json(),
    })
  )
}

export default logger
