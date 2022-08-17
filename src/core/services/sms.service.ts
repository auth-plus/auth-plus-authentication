import logger from '../../config/logger'

export class SmsService {
  async send(phone: string, content: string): Promise<void> {
    logger.warn(`${phone}: ${content}`)
  }
}
