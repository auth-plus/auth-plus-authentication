import logger from '../config/logger'

export class EmailService {
  async send(email: string, content: string): Promise<void> {
    logger.warn(email, content)
  }
}
