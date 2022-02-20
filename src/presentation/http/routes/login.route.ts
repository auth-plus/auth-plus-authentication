import { Router, Request, Response, NextFunction } from 'express'
import * as Joi from 'joi'

import Core from '../../../core/layers'

// eslint-disable-next-line import/namespace
const { object, string } = Joi.types()

const loginRoute = Router()

interface LoginInput {
  email: string
  password: string
}

const schema = object.keys({
  email: string
    .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } })
    .required(),
  password: string.required(),
})

loginRoute.post(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password }: LoginInput = await schema.validateAsync(
        req.body
      )
      const resp = await Core.login().login(email, password)
      res.body = resp
      res.status(200).send(resp)
    } catch (error) {
      next(error)
    }
  }
)

export default loginRoute
