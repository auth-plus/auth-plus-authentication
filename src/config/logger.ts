import { OpenTelemetryTransportV3 } from '@opentelemetry/winston-transport'
import { createLogger, format, transports } from 'winston'

import { getEnv } from './enviroment_config'

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.errors({ stack: true }),
    format.timestamp(),
    format.json()
  ),
  defaultMeta: { service: getEnv().app.name },
  transports: [
    new transports.Console({
      format: format.simple(),
      silent: getEnv().app.enviroment === 'test',
    }),
    new OpenTelemetryTransportV3(),
  ],
})

export default logger
