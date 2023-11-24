import cors from 'cors'
import express, {
  Request,
  Response,
  urlencoded,
  json,
  RequestHandler,
} from 'express'
import helmet from 'helmet'

import { getEnv } from '../../config/enviroment_config'
import logger from '../../config/logger'
import { registry } from '../../config/metric'
import redis from '../../core/config/cache'

import app from './app'
import { metricMiddleware } from './middlewares/metric'
import { traceMiddleware } from './middlewares/trace'

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

// DEFAULT MIDDLEWARES
server.use(metricMiddleware)
server.use(traceMiddleware)

// DEFAULT ENDPOINTS
server.get('/metrics', (async (req: Request, res: Response) => {
  const metric = await registry.metrics()
  res.setHeader('Content-Type', 'text/plain')
  res.status(200).send(metric)
}) as RequestHandler)
server.get('/health', (req: Request, res: Response) => {
  res.status(200).send('OK')
})

// APPLICATION ENDPOINT
server.use(app)

// SERVING
const PORT = getEnv().app.port
server.listen(PORT, () => {
  logger.warn(`Server running on: ${PORT}`)
  redis.connect()
})

export default server
