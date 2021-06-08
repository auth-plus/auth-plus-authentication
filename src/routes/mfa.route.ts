import express, { Request, Response, NextFunction } from 'express'

import Core from '../core/layers'
import { Strategy } from '../core/usecases/mfa/common/strategy'

const route = express.Router()

interface LoginInput {
  userId: string
  strategy: Strategy
}

route.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, strategy }: LoginInput = req.body
    const resp = await Core.mfa.create(userId, strategy)
    res.status(200).send({ resp })
  } catch (error) {
    next(error)
  }
})

export default route
