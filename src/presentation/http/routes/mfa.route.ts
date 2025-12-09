import {
  NextFunction,
  Request,
  RequestHandler,
  Response,
  Router,
} from 'express'
import * as Joi from 'joi'

import { getCore } from '../../../core'
import { Strategy } from '../../../core/entities/strategy'

const { object, string } = Joi.types(),
  mfaRoute = Router()

mfaRoute.get('/:id', (async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId: string = req.params.id,
      core = await getCore(),
      resp = await core.mfa.list(userId)
    res.status(200).send({ resp })
  } catch (error) {
    next(error)
  }
}) as RequestHandler)

mfaRoute.post('/validate', (async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const mfaId: string = req.body.id,
      core = await getCore(),
      resp = await core.mfa.validate(mfaId)
    res.status(200).send({ resp })
  } catch (error) {
    next(error)
  }
}) as RequestHandler)

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

mfaRoute.post('/choose', (async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { hash, strategy }: LoginMFAChooseInput = await schema.validateAsync(
        req.body
      ),
      core = await getCore(),
      resp = await core.mfaChoose.choose(hash, strategy)
    res.status(200).send({ hash: resp })
  } catch (error) {
    next(error)
  }
}) as RequestHandler)

interface LoginMFACodeInput {
  hash: string
  code: string
}
const schema2 = object.keys({
  hash: string.required(),
  code: string.length(6).required(),
})

mfaRoute.post('/code', (async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { hash, code }: LoginMFACodeInput = await schema2.validateAsync(
        req.body
      ),
      core = await getCore(),
      credential = await core.mFACode.find(hash, code)
    res.status(200).send(credential)
  } catch (error) {
    next(error)
  }
}) as RequestHandler)

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

mfaRoute.post('/', (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, strategy }: MFACreateInput = await schema3.validateAsync(
        req.body
      ),
      core = await getCore(),
      mfaId = await core.mfa.create(userId, strategy)
    res.status(200).send({ mfaId })
  } catch (error) {
    next(error)
  }
}) as RequestHandler)

export default mfaRoute
