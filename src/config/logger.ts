import { createLogger, format, transports } from 'winston'

import env from './enviroment_config'

const logger = createLogger({
  level: 'info',
  format: format.combine(format.errors({ stack: true }), format.timestamp()),
  defaultMeta: { service: env.app.name },
  transports: [
    new transports.Console({
      format: format.simple(),
      silent: env.app.enviroment === 'test',
    }),
  ],
})

export default logger
