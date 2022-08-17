import { CodeService } from '../services/code.service'
import { EmailService } from '../services/email.service'
import { PasswordService } from '../services/password.service'
import { SmsService } from '../services/sms.service'
import { UuidService } from '../services/uuid.service'

export const passwordService = (): PasswordService => new PasswordService()
export const uuidService = (): UuidService => new UuidService()
export const emailService = (): EmailService => new EmailService()
export const smsService = (): SmsService => new SmsService()
export const codeService = (): CodeService => new CodeService()
