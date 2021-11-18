import { Request, Response, NextFunction, Router } from 'express'
import { Kafka, logLevel, CompressionTypes } from 'kafkajs'

import env from '../../../config/enviroment_config'

const brokerRoute = Router()

const kafka = new Kafka({
  logLevel: logLevel.INFO,
  clientId: env.app.name,
  brokers: [`${env.broker.host}:${env.broker.port}`],
})

const producer = kafka.producer()

interface BrokerInput {
  topic: string
  payload: Record<string, any>
}

brokerRoute.post(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { topic, payload }: BrokerInput = req.body
      await producer.connect()
      await producer.send({
        topic,
        compression: CompressionTypes.GZIP,
        messages: [{ value: JSON.stringify(payload) }],
      })
      res.status(200).send('Ok')
    } catch (error) {
      next(error)
    }
  }
)

export default brokerRoute
