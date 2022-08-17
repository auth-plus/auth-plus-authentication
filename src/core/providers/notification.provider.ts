import database from '../config/database'
import { EmailService } from '../services/email.service'
import { SmsService } from '../services/sms.service'
import {
  SendingMfaCode,
  SendingMfaCodeErrors,
  SendingMfaCodeErrorsTypes,
} from '../usecases/driven/sending_mfa_code.driven'

export class NotificationProvider implements SendingMfaCode {
  constructor(
    private emailService: EmailService,
    private smsService: SmsService
  ) {}

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
    try {
      const tuples: { value: string }[] = await database('user')
        .innerJoin('user_info', 'user.id', '=', 'user_info.user_id')
        .select('user_info.value')
        .where('user_info.type', 'phone')
        .andWhere('user.id', userId)
        .limit(1)
      this.smsService.send(tuples[0].value, code)
    } catch (error) {
      throw new SendingMfaCodeErrors(
        SendingMfaCodeErrorsTypes.USER_PHONE_NOT_FOUND
      )
    }
  }
}
