import { Kafka } from 'kafkajs'

import logger from '../../config/logger'

const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['kafka1:9092', 'kafka2:9092'],
})
const consumer = kafka.consumer({ groupId: 'test-group' })

consumer.connect()
consumer.subscribe({ topic: 'test-topic', fromBeginning: true })
consumer.run({
  eachMessage: async ({ topic, partition, message }) => {
    logger.info({
      topic,
      partition,
      key: message.key?.toString(),
      value: message.value?.toString(),
      headers: message.headers,
    })
  },
})
