import cors from 'cors'
import express, { Request, Response, urlencoded, json } from 'express'
import helmet from 'helmet'

import app from './app'
import env from './core/config/enviroment_config'
import logger from './core/config/logger'
import { metric } from './core/config/metric'
import { metricMiddleware } from './middlewares/metric'
import { traceMiddleware } from './middlewares/tracer'

const server = express()

// SECURITY
server.use(helmet())
server.use(
  cors({
    origin: 'localhost',
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

// APPLICATION ENDPOINTS
server.use(traceMiddleware)
server.use(metricMiddleware)
server.use(app)

// SERVING
const PORT = env.app.port
server.listen(PORT, () => {
  logger.warn(`Server running on: ${PORT}`)
})

export default server
