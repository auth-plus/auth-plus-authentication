import {
  Router,
  Request,
  Response,
  NextFunction,
  RequestHandler,
} from 'express'
import * as Joi from 'joi'

import { getCore } from '../../../core'
import { jwtMiddleware } from '../middlewares/jwt'

// eslint-disable-next-line import/namespace
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
    const resp = await getCore().login.login(email, password)
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
    const token = req.params.token
    const resp = await getCore().token.refresh(token)
    res.status(200).send(resp)
  } catch (error) {
    next(error)
  }
}) as RequestHandler)

export default loginRoute
