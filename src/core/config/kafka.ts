import { Kafka, CompressionTypes, logLevel } from 'kafkajs'

import { Enviroment } from '../../config/enviroment_config'

type TOPIC =
  | '2FA_EMAIL_CREATED'
  | '2FA_PHONE_CREATED'
  | '2FA_EMAIL_SENT'
  | '2FA_PHONE_SENT'
  | 'USER_CREATED'
  | 'ORGANIZATION_CREATED'
  | 'RESET_PASSWORD'

let client: Kafka
export function getKafka(env: Enviroment) {
  if (client != undefined) {
    return client
  }
  client = new Kafka({
    logLevel: logLevel.ERROR,
    clientId: env.app.name,
    connectionTimeout: 5000,
    brokers: [`${env.broker.url}`],
  })
  return client
}

export async function produce<PayloadType>(
  topic: TOPIC,
  payload: PayloadType,
  kafka: Kafka
) {
  const producer = kafka.producer()
  await producer.connect()
  await producer.send({
    topic,
    compression: CompressionTypes.GZIP,
    messages: [{ value: JSON.stringify(payload) }],
  })
}
