import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import * as dotenv from 'dotenv'

import logger from './config/winston'
import loginRoute from './routes/login.route'

dotenv.config()

const app = express()

app.use(cors())
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

app.get('/health', (req: Request, res: Response) => {
  res.status(200).send('OK')
})

app.use('/login', loginRoute)

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err) {
    logger.error(err)
    res.status(500).send(err)
  } else {
    next()
  }
})

app.use((req: Request, res: Response) => {
  res.status(404).send('Sorry cant find that')
})

const PORT = process.env.APP_PORT ? parseInt(process.env.APP_PORT) : 5000
app.listen(PORT, () => {
  logger.warn(`Server running on: ${PORT}`)
})
