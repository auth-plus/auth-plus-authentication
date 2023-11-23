import { Kafka, logLevel, CompressionTypes } from 'kafkajs'

import { getEnv } from './enviroment_config'

const kafka = new Kafka({
  logLevel: logLevel.ERROR,
  clientId: getEnv().app.name,
  connectionTimeout: 5000,
  brokers: [`${getEnv().broker.url}`],
})

type TOPIC =
  | '2FA_EMAIL_CREATED'
  | '2FA_PHONE_CREATED'
  | '2FA_EMAIL_SENT'
  | '2FA_PHONE_SENT'
  | 'USER_CREATED'
  | 'ORGANIZATION_CREATED'
  | 'RESET_PASSWORD'
const TOPIC_LIST: Array<TOPIC> = [
  '2FA_EMAIL_CREATED',
  '2FA_PHONE_CREATED',
  '2FA_EMAIL_SENT',
  '2FA_PHONE_SENT',
  'USER_CREATED',
  'ORGANIZATION_CREATED',
  'RESET_PASSWORD',
]

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

export async function produce<PayloadType>(topic: TOPIC, payload: PayloadType) {
  const producer = kafka.producer()
  await producer.connect()
  await producer.send({
    topic,
    compression: CompressionTypes.GZIP,
    messages: [{ value: JSON.stringify(payload) }],
  })
}
