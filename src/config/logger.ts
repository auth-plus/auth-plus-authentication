import { createLogger, format, transports } from 'winston'

import env from './enviroment_config'

const logger = createLogger({
  level: 'info',
  format: format.combine(format.errors({ stack: true }), format.timestamp()),
  defaultMeta: { service: env.app.name },
})

if (env.app.enviroment === 'development') {
  logger.add(
    new transports.Console({
      format: format.simple(),
    })
  )
  logger.add(
    new transports.Http({
      host: env.elk.logstashHost,
      port: env.elk.logstashPort,
      format: format.json(),
    })
  )
}

if (env.app.enviroment === 'test') {
  logger.add(
    new transports.Console({
      format: format.simple(),
      silent: true,
    })
  )
}

if (env.app.enviroment === 'production') {
  logger.add(
    new transports.Http({
      host: env.elk.logstashHost,
      port: env.elk.logstashPort,
      format: format.json(),
    })
  )
}

export default logger
