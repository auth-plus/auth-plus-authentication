import { Kafka, logLevel, CompressionTypes } from 'kafkajs'

import { KafkaTopic } from '../presentation/messaging/app'

import env from './enviroment_config'
import logger from './logger'
import { metric } from './metric'

const kafka = new Kafka({
  logLevel: logLevel.ERROR,
  clientId: env.app.name,
  connectionTimeout: 3000,
  brokers: [`${env.broker.host}:${env.broker.port}`],
})

const TOPIC_LIST = ['health', 'organization-create']
const consumer = kafka.consumer({ groupId: env.app.name })

export async function configKafka() {
  const admin = kafka.admin()
  await admin.connect()
  const currentTopic = await admin.listTopics()
  const toBeCreatedTopic = TOPIC_LIST.filter((t) => !currentTopic.includes(t))
  await admin.createTopics({
    waitForLeaders: true,
    topics: toBeCreatedTopic.map((t) => ({ topic: t })),
  })
  await admin.disconnect()
}

export const consume = async (
  callback: (topic: KafkaTopic, content: Record<string, any>) => Promise<void>
) => {
  await consumer.connect()
  const promiseList = TOPIC_LIST.map((tpc) => {
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
      await callback(topic as KafkaTopic, content as Record<string, any>)
    },
  })
}

export const produce = async (topic: string, payload: Record<string, any>) => {
  const producer = kafka.producer()
  await producer.connect()
  await producer.send({
    topic,
    compression: CompressionTypes.GZIP,
    messages: [{ value: JSON.stringify(payload) }],
  })
}
