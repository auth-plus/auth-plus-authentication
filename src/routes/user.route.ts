import { Request, Response, NextFunction, Router } from 'express'

import Core from '@core/layers'

const userRoute = Router()

interface UserInput {
  name: string
  email: string
  password: string
}

userRoute.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password }: UserInput = req.body
    await Core.user.create(name, email, password)
    res.status(200).send('user created')
  } catch (error) {
    next(error)
  }
})

export default userRoute
