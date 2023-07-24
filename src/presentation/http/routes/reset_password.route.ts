import {
  Router,
  Request,
  Response,
  NextFunction,
  RequestHandler,
} from 'express'
import * as Joi from 'joi'

import Core from '../../../core/layers'

// eslint-disable-next-line import/namespace
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
    const resp = await Core.reset().forget(email)
    res.body = resp
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
    const resp = await Core.reset().recover(password, hash)
    res.body = resp
    res.status(200).send(resp)
  } catch (error) {
    next(error)
  }
}) as RequestHandler)

export default resetPasswordRoute
