import { Request, Response, NextFunction, Router } from 'express'

import Core from '../../../core/layers'

const userRoute = Router()

interface UserInput {
  name: string
  email: string
  password: string
}

interface UserInfoInput {
  userId: string
  name?: string
  email?: string
  phone?: string
  deviceId?: string
  gaToken?: string
}

userRoute.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password }: UserInput = req.body
    const id = await Core.user().create(name, email, password)
    res.body = { id }
    res.status(200).send({ id })
  } catch (error) {
    next(error)
  }
})

userRoute.patch(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId, name, email, phone, deviceId, gaToken }: UserInfoInput =
        req.body
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
