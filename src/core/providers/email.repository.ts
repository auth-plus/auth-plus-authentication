import database from '../config/knex'
import { EmailService } from '../services/email.service'
import {
  SendingMFACode,
  CreatingMFACodeErrors,
  CreatingMFACodeErrorsTypes,
} from '../usecases/driven/sending_mfa_code.driven'

export class EmailRepository implements SendingMFACode {
  constructor(private emailService: EmailService) {}

  async sendCodeForUser(userId: string, code: string): Promise<void> {
    try {
      const [email] = await database<string>('user')
        .select('email')
        .where('user_id', userId)
        .limit(1)
      this.emailService.send(email, code)
    } catch (error) {
      throw new CreatingMFACodeErrors(
        CreatingMFACodeErrorsTypes.CACHE_DEPENDECY_ERROR
      )
    }
  }
}
