import {
  Router,
  Request,
  Response,
  NextFunction,
  RequestHandler,
} from 'express'

import { getCore } from '../../../core'
import { retriveToken } from '../middlewares/jwt'

const logoutRoute = Router()

logoutRoute.post('/', (async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = retriveToken(req)
    await getCore().logout.logout(token)
    res.status(200).send('Ok')
  } catch (error) {
    next(error)
  }
}) as RequestHandler)

export default logoutRoute
