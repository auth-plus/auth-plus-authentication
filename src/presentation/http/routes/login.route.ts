import {
  NextFunction,
  Request,
  RequestHandler,
  Response,
  Router,
} from 'express'
import * as Joi from 'joi'

import { getCore } from '../../../core'
import { jwtMiddleware } from '../middlewares/jwt'

const { object, string } = Joi.types()
const loginRoute = Router()

interface LoginInput {
  email: string
  password: string
}

const schema = object.keys({
  email: string.email().required(),
  password: string.required(),
})

loginRoute.post('/', (async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password }: LoginInput = await schema.validateAsync(req.body)
    const core = await getCore()
    const resp = await core.login.login(email, password)
    res.status(200).send(resp)
  } catch (error) {
    next(error)
  }
}) as RequestHandler)

loginRoute.get('/refresh/:token', jwtMiddleware, (async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token } = req.params
    const core = await getCore()
    const resp = await core.token.refresh(token)
    res.status(200).send(resp)
  } catch (error) {
    next(error)
  }
}) as RequestHandler)

export default loginRoute
