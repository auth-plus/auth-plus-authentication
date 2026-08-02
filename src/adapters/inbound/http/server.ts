import cors from 'cors'
import express, { json, Request, Response, urlencoded } from 'express'
import helmet from 'helmet'
import client from 'prom-client'
import { getEnv } from '../../../config/enviroment_config'
import app from './app'
import { traceMiddleware } from './middlewares/trace'
import { logger } from '../../../config/logger'
import { sdk } from '../tracing'

const server = express()
if (process.env.NODE_ENV !== 'test') {
  sdk.start()
}

client.collectDefaultMetrics()
const requestHistogram = new client.Histogram({
  name: 'histogram_request',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['method', 'route', 'code'],
  buckets: [0.1, 5, 15, 50, 100, 500],
})
requestHistogram.observe({ method: 'GET', route: '/metrics', code: '200' }, 1)

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
server.use(traceMiddleware)

// DEFAULT ENDPOINTS
server.get('/health', (req: Request, res: Response) => {
  res.status(200).send('OK')
})

server.get('/metrics', async (req: Request, res: Response) => {
  res.set('Content-Type', client.register.contentType)
  res.end(await client.register.metrics())
})

// APPLICATION ENDPOINT
server.use(app)

// SERVING
const PORT = getEnv().app.port
if (getEnv().app.enviroment !== 'test') {
  server.listen(PORT, () => {
    logger.warn(`Server running on: ${PORT}`)
  })
}

export default server
