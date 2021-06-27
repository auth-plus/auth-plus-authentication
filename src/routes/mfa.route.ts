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

route.get(
  '/validate/:mfaId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const mfaId: string = req.params.mfaId
      const resp = await Core.mfa.validate(mfaId)
      res.status(200).send(resp)
    } catch (error) {
      next(error)
    }
  }
)

export default route
