import { Kafka, logLevel } from 'kafkajs'

import env from '../../config/enviroment_config'
import logger from '../../config/logger'
import { metric } from '../../config/metric'

import { app } from './app'

const kafka = new Kafka({
  logLevel: logLevel.INFO,
  clientId: env.app.name,
  brokers: [`${env.broker.host}:${env.broker.port}`],
})
const consumer = kafka.consumer({ groupId: env.app.name })
const topicList = ['health']

const run = async () => {
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

      switch (topic) {
        case 'health':
          logger.info('Ok')
          break
        case 'metrics':
          logger.info(await metric.getMetrics())
          break
        default: {
          if (!message.value) {
            throw new Error('no payload')
          }
          const content = JSON.parse(message.value?.toString())
          await app(topic, content as Record<string, any>)
        }
      }
    },
  })
}

run().catch((e) => logger.error(`[${env.app.name}/consumer] ${e.message}`, e))
