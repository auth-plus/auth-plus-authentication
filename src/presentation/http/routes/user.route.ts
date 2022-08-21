import { Request, Response, NextFunction, Router } from 'express'
import * as Joi from 'joi'

import Core from '../../../core/layers'

// eslint-disable-next-line import/namespace
const { object, string } = Joi.types()

const userRoute = Router()

interface UserInput {
  name: string
  email: string
  password: string
}
const schema = object.keys({
  name: string.required(),
  email: string.email().required(),
  password: string.required(),
})

userRoute.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password }: UserInput = await schema.validateAsync(
      req.body
    )
    const id = await Core.user().create(name, email, password)
    res.body = { id }
    res.status(200).send({ id })
  } catch (error) {
    next(error)
  }
})

interface UserInfoInput {
  userId: string
  name?: string
  email?: string
  phone?: string
  deviceId?: string
  gaToken?: string
}
const schema2 = object.keys({
  userId: string.required(),
  name: string,
  email: string.email(),
  phone: string,
  deviceId: string,
  gaToken: string,
})

userRoute.patch(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId, name, email, phone, deviceId, gaToken }: UserInfoInput =
        await schema2.validateAsync(req.body)
      const resp = await Core.user().update({
        userId,
        name,
        email,
        phone,
        deviceId,
        gaToken,
      })
      res.body = { result: resp }
      res.status(200).send({ result: resp })
    } catch (error) {
      next(error)
    }
  }
)

export default userRoute
