import logger from '../../config/logger'

export type KafkaTopic = 'health' | 'organization-create'

export async function app(
  topic: KafkaTopic,
  payload: Record<string, any>
): Promise<void> {
  switch (topic) {
    case 'health':
      logger.info('messaging-user')
      break
    case 'organization-create':
      logger.info('organization-user')
      break
    default:
      throw new Error('Topic Invalid')
  }
}
