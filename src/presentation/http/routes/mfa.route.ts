import { Router, Request, Response, NextFunction } from 'express'
import * as Joi from 'joi'

import { Strategy } from '../../../core/entities/strategy'
import Core from '../../../core/layers'

// eslint-disable-next-line import/namespace
const { object, string } = Joi.types()

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
const schema = object.keys({
  hash: string.required(),
  strategy: string
    .valid(Strategy.EMAIL, Strategy.GA, Strategy.PHONE)
    .required(),
})

mfaRoute.post(
  '/choose',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { hash, strategy }: LoginMFAChooseInput =
        await schema.validateAsync(req.body)
      const resp = await Core.mfaChoose().choose(hash, strategy)
      res.body = resp
      res.status(200).send({ hash: resp })
    } catch (error) {
      next(error)
    }
  }
)

interface LoginMFACodeInput {
  hash: string
  code: string
}
const schema2 = object.keys({
  hash: string.required(),
  code: string.length(6).required(),
})

mfaRoute.post(
  '/code',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { hash, code }: LoginMFACodeInput = await schema2.validateAsync(
        req.body
      )
      const credential = await Core.mFACode().find(hash, code)
      res.body = credential
      res.status(200).send(credential)
    } catch (error) {
      next(error)
    }
  }
)
interface MFACreateInput {
  userId: string
  strategy: Strategy
}
const schema3 = object.keys({
  userId: string.required(),
  strategy: string
    .valid(Strategy.EMAIL, Strategy.GA, Strategy.PHONE)
    .required(),
})

mfaRoute.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, strategy }: MFACreateInput = await schema3.validateAsync(
      req.body
    )
    const mfaId = await Core.mfa().create(userId, strategy)
    res.body = mfaId
    res.status(200).send({ mfaId })
  } catch (error) {
    next(error)
  }
})

export default mfaRoute
