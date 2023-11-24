import { createLogger, format, transports } from 'winston'

import { getEnv } from './enviroment_config'

const logger = createLogger({
  level: 'info',
  format: format.combine(format.errors({ stack: true }), format.timestamp()),
  defaultMeta: { service: getEnv().app.name },
  transports: [
    new transports.Console({
      format: format.simple(),
      silent: getEnv().app.enviroment === 'test',
    }),
  ],
})

export default logger
