import { CodeService } from '../services/code.service'
import { EmailService } from '../services/email.service'
import { PasswordService } from '../services/password.service'
import { UuidService } from '../services/uuid.service'

export const passwordService = new PasswordService()
export const uuidService = new UuidService()
export const emailService = new EmailService()
export const codeService = new CodeService()
