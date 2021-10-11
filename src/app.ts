import { Request, Response, Router, NextFunction } from 'express'

import logger from './core/config/logger'
import loginRoute from './routes/login.route'
import mfaRoute from './routes/mfa.route'
import userRoute from './routes/user.route'

const app = Router()
app.use('/login', loginRoute)
app.use('/mfa', mfaRoute)
app.use('/user', userRoute)

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err) {
    logger.error(err)
    res.status(500).send(err.message)
  } else {
    next()
  }
})
app.use((req: Request, res: Response) => {
  res.status(404).send('Sorry cant find that')
})

export default app
