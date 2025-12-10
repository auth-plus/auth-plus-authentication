import {
  NextFunction,
  Request,
  RequestHandler,
  Response,
  Router,
} from 'express'
import * as Joi from 'joi'

import { getCore } from '../../../core'

const { object, string } = Joi.types()
const resetPasswordRoute = Router()

interface ForgetPasswordInput {
  email: string
}

const schema = object.keys({
  email: string.email().required(),
})

resetPasswordRoute.post('/forget', (async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email }: ForgetPasswordInput = await schema.validateAsync(req.body)
    const core = await getCore()
    const resp = await core.reset.forget(email)
    res.status(200).send(resp)
  } catch (error) {
    next(error)
  }
}) as RequestHandler)

interface RecoverPasswordInput {
  password: string
  hash: string
}

const schema2 = object.keys({
  password: string.required(),
  hash: string.required(),
})

resetPasswordRoute.post('/recover', (async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { password, hash }: RecoverPasswordInput =
      await schema2.validateAsync(req.body)
    const core = await getCore()
    const resp = await core.reset.recover(password, hash)
    res.status(200).send(resp)
  } catch (error) {
    next(error)
  }
}) as RequestHandler)

export default resetPasswordRoute
