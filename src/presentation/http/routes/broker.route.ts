import { Request, Response, NextFunction, Router } from 'express'
import * as Joi from 'joi'

// eslint-disable-next-line import/namespace
const { object, string, any } = Joi.types()

import { produce } from '../../../config/kafka'

const brokerRoute = Router()

interface BrokerInput {
  topic: string
  payload: Record<string, any>
}
const schema = object.keys({
  topic: string.required(),
  payload: any.required(),
})

brokerRoute.post(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { topic, payload }: BrokerInput = await schema.validateAsync(
        req.body
      )
      await produce(topic, payload)
      res.status(200).send('Ok')
    } catch (error) {
      next(error)
    }
  }
)

export default brokerRoute
