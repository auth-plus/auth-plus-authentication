import { Request, Response, Router, NextFunction } from 'express'

import logger from '../../config/logger'

import { jwtMiddleware } from './middlewares/jwt'
import loginRoute from './routes/login.route'
import logoutRoute from './routes/logout.route'
import mfaRoute from './routes/mfa.route'
import organizationRoute from './routes/organization.route'
import resetPasswordRoute from './routes/reset_password.route'
import userRoute from './routes/user.route'

const app = Router()
app.use('/login', loginRoute)
app.use('/mfa', mfaRoute)
app.use('/logout', jwtMiddleware, logoutRoute)
app.use('/user', jwtMiddleware, userRoute)
app.use('/organization', jwtMiddleware, organizationRoute)
app.use('/password', jwtMiddleware, resetPasswordRoute)

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
