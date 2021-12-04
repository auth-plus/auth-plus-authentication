import database from '../config/database'
import { EmailService } from '../services/email.service'
import {
  Notification,
  NotificationErrors,
  NotificationErrorsTypes,
} from '../usecases/driven/sending_mfa_code.driven'

export class EmailRepository implements Notification {
  constructor(private emailService: EmailService) {}

  async sendCodeForUser(userId: string, code: string): Promise<void> {
    try {
      const [{ email }] = await database('user')
        .select('email')
        .where('id', userId)
      this.emailService.send(email, code)
    } catch (error) {
      throw new NotificationErrors(NotificationErrorsTypes.PROVIDER_ERROR)
    }
  }
}
