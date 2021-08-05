import database from '../config/database'
import { EmailService } from '../services/email.service'
import {
  SendingMFACode,
  SendingMFACodeErrors,
  SendingMFACodeErrorsTypes,
} from '../usecases/driven/sending_mfa_code.driven'

export class EmailRepository implements SendingMFACode {
  constructor(private emailService: EmailService) {}

  async sendCodeForUser(userId: string, code: string): Promise<void> {
    try {
      const [{ email }] = await database('user')
        .select('email')
        .where('id', userId)
      if (!email) {
        throw new SendingMFACodeErrors(SendingMFACodeErrorsTypes.NOT_FOUND)
      }
      this.emailService.send(email, code)
    } catch (error) {
      throw new SendingMFACodeErrors(SendingMFACodeErrorsTypes.PROVIDER_ERROR)
    }
  }
}
