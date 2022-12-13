import { MFARepository } from '../providers/mfa.repository'
import { MFAChooseRepository } from '../providers/mfa_choose.repository'
import { MFACodeRepository } from '../providers/mfa_code.repository'
import { NotificationProvider } from '../providers/notification.provider'
import { OrganizationRepository } from '../providers/organization.repository'
import { TokenRepository } from '../providers/token.repository'
import { UserRepository } from '../providers/user.repository'

import {
  passwordService,
  uuidService,
  emailService,
  codeService,
  smsService,
} from './services'

export const organizationRepository = (): OrganizationRepository =>
  new OrganizationRepository()
export const userRepository = (): UserRepository =>
  new UserRepository(passwordService())
export const mFAChooseRepository = (): MFAChooseRepository =>
  new MFAChooseRepository(uuidService())
export const mFACodeRepository = (): MFACodeRepository =>
  new MFACodeRepository(uuidService(), codeService())
export const mFARepository = (): MFARepository =>
  new MFARepository(userRepository())
export const tokenRepository = (): TokenRepository => new TokenRepository()
export const emailRepository = (): NotificationProvider =>
  new NotificationProvider(emailService(), smsService())
