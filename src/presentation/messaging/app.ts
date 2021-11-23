import logger from '../../config/logger'

export async function app(
  topic: string,
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
