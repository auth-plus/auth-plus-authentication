import winston from 'winston'

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  silent: process.env.ENVIROMENT !== ' development',
  defaultMeta: { service: 'user-service' },
  transports: [],
})

if (process.env.ENVIROMENT === 'development') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  )
}

export default logger
