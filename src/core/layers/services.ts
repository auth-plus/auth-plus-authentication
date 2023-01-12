import { CodeService } from '../services/code.service'
import { PasswordService } from '../services/password.service'
import { UuidService } from '../services/uuid.service'

export const passwordService = (): PasswordService => new PasswordService()
export const uuidService = (): UuidService => new UuidService()
export const codeService = (): CodeService => new CodeService()
