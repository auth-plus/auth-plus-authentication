import express, { Request, Response, NextFunction } from 'express'

import Core from '../core/layers'
import { MFACreateInput } from '../core/usecases/mfa/driver/create_mfa.driver'

const route = express.Router()

route.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const resp = await Core.mfa.create(req.body as MFACreateInput)
    res.status(200).send({ resp })
  } catch (error) {
    next(error)
  }
})

// route.post(
//   '/choose',
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const { strategy, password }: LoginInput = req.body
//       const resp = await Core.login.chooseMFA(strategy, password)
//       res.status(200).send(resp)
//     } catch (error) {
//       next(error)
//     }
//   }
// )

export default route
