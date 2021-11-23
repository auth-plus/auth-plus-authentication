import { Request, Response, NextFunction, Router } from 'express'

import { produce } from '../../../config/kafka'

const brokerRoute = Router()

interface BrokerInput {
  topic: string
  payload: Record<string, any>
}

brokerRoute.post(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { topic, payload }: BrokerInput = req.body
      await produce(topic, payload)
      res.status(200).send('Ok')
    } catch (error) {
      next(error)
    }
  }
)

export default brokerRoute
