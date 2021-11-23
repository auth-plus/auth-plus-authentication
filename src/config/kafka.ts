import { Kafka, logLevel, CompressionTypes } from 'kafkajs'

import env from './enviroment_config'
import logger from './logger'
import { metric } from './metric'

const kafka = new Kafka({
  logLevel: logLevel.INFO,
  clientId: env.app.name,
  connectionTimeout: 3000,
  brokers: [`${env.broker.host}:${env.broker.port}`],
})

const consumer = kafka.consumer({ groupId: env.app.name })
const topicList = ['health']

export const consume = async (
  callback: (topic: string, content: Record<string, any>) => Promise<void>
) => {
  await consumer.connect()
  const promiseList = topicList.map((tpc) => {
    return consumer.subscribe({ topic: tpc, fromBeginning: true })
  })
  await Promise.all(promiseList)
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      //metrics
      const hour = new Date().getHours()
      metric.histogramObserve('histogram_request', hour)

      //tracer
      const prefix = `${topic}[${partition} | ${message.offset}] / ${message.timestamp}`
      logger.info(`- ${prefix} ${message.key}#${message.value}`)

      if (!message.value) {
        throw new Error('no payload')
      }
      const content = JSON.parse(message.value?.toString())
      await callback(topic, content as Record<string, any>)
    },
  })
}

const producer = kafka.producer()
export const produce = async (topic: string, payload: Record<string, any>) => {
  await producer.connect()
  await producer.send({
    topic,
    compression: CompressionTypes.GZIP,
    messages: [{ value: JSON.stringify(payload) }],
  })
}
