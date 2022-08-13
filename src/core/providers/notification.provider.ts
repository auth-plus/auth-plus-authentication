import database from '../config/database'
import { EmailService } from '../services/email.service'
import {
  SendingMfaCode,
  SendingMfaCodeErrors,
  SendingMfaCodeErrorsTypes,
} from '../usecases/driven/sending_mfa_code.driven'

export class NotificationProvider implements SendingMfaCode {
  constructor(private emailService: EmailService) {}

  async sendByEmail(userId: string, code: string): Promise<void> {
    const tuples: { email: string }[] = await database('user')
      .select('email')
      .where('id', userId)
      .limit(1)
    if (tuples.length === 0) {
      throw new SendingMfaCodeErrors(SendingMfaCodeErrorsTypes.USER_NOT_FOUND)
    }
    this.emailService.send(tuples[0].email, code)
  }

  async sendBySms(userId: string, code: string): Promise<void> {
    const tuples: { email: string }[] = await database('user')
      .innerJoin('user_info', 'user.id', '=', 'user_info.user_id')
      .select('user_info.value')
      .where('user_info.type', 'phone')
      .andWhere('user.id', userId)
      .limit(1)
    if (tuples.length === 0) {
      throw new SendingMfaCodeErrors(SendingMfaCodeErrorsTypes.USER_NOT_FOUND)
    }
    this.emailService.send(tuples[0].email, code)
  }
}
