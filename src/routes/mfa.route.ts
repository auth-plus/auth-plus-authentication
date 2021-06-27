import express, { Request, Response, NextFunction } from 'express'

import Core from '../core/layers'
import { MFACreateInput } from '../core/usecases/mfa/driver/create_mfa.driver'

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

route.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const mfaId = await Core.mfa.create(req.body as MFACreateInput)
    res.status(200).send({ mfaId })
  } catch (error) {
    next(error)
  }
})

export default route
