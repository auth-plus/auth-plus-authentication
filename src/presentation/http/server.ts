import cors from 'cors'
import express, { Request, Response, urlencoded, json } from 'express'
import helmet from 'helmet'

import env from '../../config/enviroment_config'
import logger from '../../config/logger'
import { metric } from '../../config/metric'
import redis from '../../core/config/cache'

import app from './app'
import { metricMiddleware } from './middlewares/metric'
import { traceMiddleware } from './middlewares/tracer'

const server = express()

// SECURITY
server.use(helmet())
server.use(
  cors({
    origin: /http:\/\/localhost:\d+$/,
  })
)
server.disable('x-powered-by')

// PARSE BODY TO OBJECT
server.use(urlencoded({ extended: false }))
server.use(json())

// DEFAULT ENDPOINTS
server.get('/metrics', async (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/plain')
  res.status(200).send(await metric.getMetrics())
})
server.get('/health', (req: Request, res: Response) => {
  res.status(200).send('OK')
})

// DEFAULT MIDDLEWARES
server.use(traceMiddleware)
server.use(metricMiddleware)

// APPLICATION ENDPOINT
server.use(app)

// SERVING
const PORT = env.app.port
server.listen(PORT, async () => {
  logger.warn(`Server running on: ${PORT}`)
  await redis.connect()
  redis.on('error', async (error: Error) => {
    logger.error(error)
    await redis.quit()
    throw error
  })
})

export default server
