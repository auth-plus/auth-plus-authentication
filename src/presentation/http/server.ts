import cors from 'cors'
import express, { json, Request, Response, urlencoded } from 'express'
import helmet from 'helmet'
import { getEnv } from '../../config/enviroment_config'
import app from './app'
import { traceMiddleware } from './middlewares/trace'
import { logger } from '../../config/logger'
import { sdk } from '../tracing'

const server = express()
sdk.start()

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

// APPLICATION ENDPOINT
server.use(app)

// SERVING
const PORT = getEnv().app.port
if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    logger.warn(`Server running on: ${PORT}`)
  })
}

export default server
