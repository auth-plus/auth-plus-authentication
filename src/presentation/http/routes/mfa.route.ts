import { Router, Request, Response, NextFunction } from 'express'

import { Strategy } from '../../../core/entities/strategy'
import Core from '../../../core/layers'
import { MFACreateInput } from '../../../core/usecases/driver/create_mfa.driver'

const mfaRoute = Router()

mfaRoute.post(
  '/validate',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const mfaId: string = req.body.id
      const resp = await Core.mfa().validate(mfaId)
      res.body = resp
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

mfaRoute.post(
  '/choose',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { hash, strategy }: LoginMFAChooseInput = req.body
      const resp = await Core.mfaChoose().choose(hash, strategy)
      res.body = resp
      res.status(200).send(resp)
    } catch (error) {
      next(error)
    }
  }
)

interface LoginMFACodeInput {
  hash: string
  code: Strategy
}

mfaRoute.post(
  '/code',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { hash, code }: LoginMFACodeInput = req.body
      const credential = await Core.mFACode().find(hash, code)
      res.body = credential
      res.status(200).send(credential)
    } catch (error) {
      next(error)
    }
  }
)

mfaRoute.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const mfaId = await Core.mfa().create(req.body as MFACreateInput)
    res.body = mfaId
    res.status(200).send({ mfaId })
  } catch (error) {
    next(error)
  }
})

export default mfaRoute
