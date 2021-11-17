import { EmailRepository } from '../providers/email.repository'
import { MFARepository } from '../providers/mfa.repository'
import { MFAChooseRepository } from '../providers/mfa_choose.repository'
import { MFACodeRepository } from '../providers/mfa_code.repository'
import { TokenRepository } from '../providers/token.repository'
import { UserRepository } from '../providers/user.repository'

import {
  passwordService,
  uuidService,
  emailService,
  codeService,
} from './services'

export const userRepository = (): UserRepository =>
  new UserRepository(passwordService())
export const mFAChooseRepository = (): MFAChooseRepository =>
  new MFAChooseRepository(uuidService())
export const mFACodeRepository = (): MFACodeRepository =>
  new MFACodeRepository(uuidService(), codeService())
export const mFARepository = (): MFARepository => new MFARepository()
export const tokenRepository = (): TokenRepository => new TokenRepository()
export const emailRepository = (): EmailRepository =>
  new EmailRepository(emailService())
