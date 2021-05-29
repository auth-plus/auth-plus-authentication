import express, { Request, Response, NextFunction } from 'express'

import { Strategy } from '../usecases/mfa/common/strategy'
import Mfa from '../usecases/mfa/mfa.usecase'

const route = express.Router()

interface LoginInput {
  userId: string
  strategy: Strategy
}

const mfa = new Mfa()

route.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, strategy }: LoginInput = req.body
    const resp = await mfa.create(userId, strategy)
    res.status(200).send({ resp })
  } catch (error) {
    next(error)
  }
})

export default route
