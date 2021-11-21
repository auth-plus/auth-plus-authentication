import logger from '../../config/logger'

export async function app(
  topic: string,
  payload: Record<string, any>
): Promise<void> {
  switch (topic) {
    case 'user':
      logger.info('messaging-user')
      break
    case 'organization':
      logger.info('organization-user')
      break
    default:
      throw new Error('Topic Invalid')
  }
}
