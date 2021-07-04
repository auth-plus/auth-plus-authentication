import { UserRepository } from '../providers/user.repository'
import { MFARepository } from '../providers/mfa.repository'
import { MFAChooseRepository } from '../providers/mfa_choose.repository'
import { EmailRepository } from '../providers/email.repository'
import { MFACodeRepository } from '../providers/mfa_code.repository'

import {
  passwordService,
  uuidService,
  emailService,
  codeService,
} from './services'

export const userRepository = new UserRepository(passwordService)
export const mFARepository = new MFARepository()
export const mFAChooseRepository = new MFAChooseRepository(uuidService)
export const mFACodeRepository = new MFACodeRepository(uuidService, codeService)
export const emailRepository = new EmailRepository(emailService)
