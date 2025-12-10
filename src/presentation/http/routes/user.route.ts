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

userRoute.post('/', (async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, password }: UserInput = await schema.validateAsync(
      req.body
    )
    const core = await getCore()
    const id = await core.user.create(name, email, password)
    res.status(201).send({ id })
  } catch (error) {
    next(error)
  }
}) as RequestHandler)

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

userRoute.patch('/', (async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId, name, email, phone, deviceId, gaToken }: UserInfoInput =
      await schema2.validateAsync(req.body)
    const core = await getCore()
    const resp = await core.user.update({
      userId,
      name,
      email,
      phone,
      deviceId,
      gaToken,
    })
    res.status(200).send({ result: resp })
  } catch (error) {
    next(error)
  }
}) as RequestHandler)

userRoute.get('/', (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const core = await getCore()
    const resp = await core.user.list()
    res.status(200).send({ list: resp })
  } catch (error) {
    next(error)
  }
}) as RequestHandler)

export default userRoute
