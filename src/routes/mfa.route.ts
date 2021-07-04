import express, { Request, Response, NextFunction } from 'express'

import { Strategy } from '../core/entities/strategy'
import Core from '../core/layers'

const route = express.Router()

route.post(
  '/validate',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const mfaId: string = req.body.id
      console.warn(mfaId)
      const resp = await Core.mfa.validate(mfaId)
      res.status(200).send({ resp })
    } catch (error) {
      next(error)
    }
  }
)
interface LoginMFAChooseInput {
  hash: string
  strategy: Strategy
}

route.post(
  '/choose',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { hash, strategy }: LoginMFAChooseInput = req.body
      const resp = await Core.mfaChoose.choose(hash, strategy)
      res.status(200).send(resp)
    } catch (error) {
      next(error)
    }
  }
)

// interface LoginMFACodeInput {
//   hash: string
//   code: Strategy
// }

// route.post('/', async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const { hash, code }: LoginMFACodeInput = req.body
//     const mfaId = await Core.mFACode.login(hash, code)
//     res.status(200).send({ mfaId })
//   } catch (error) {
//     next(error)
//   }
// })

export default route
