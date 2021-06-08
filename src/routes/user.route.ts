import express, { Request, Response, NextFunction } from 'express'

import Core from '../core/layers'

const route = express.Router()

interface UserInput {
  name: string
  email: string
  password: string
}

route.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password }: UserInput = req.body
    await Core.user.create(name, email, password)
    res.status(200).send('user created')
  } catch (error) {
    next(error)
  }
})

export default route
