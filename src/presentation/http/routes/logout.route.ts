import {
  NextFunction,
  Request,
  RequestHandler,
  Response,
  Router,
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
    const token = retriveToken(req),
      core = await getCore()
    await core.logout.logout(token)
    res.status(200).send('Ok')
  } catch (error) {
    next(error)
  }
}) as RequestHandler)

export default logoutRoute
