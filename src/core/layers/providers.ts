import { UserRepository } from '../providers/user.repository'
import { MFARepository } from '../providers/mfa.repository'
import { MFAChooseRepository } from '../providers/mfa_choose.repository'

import { passwordService, uuidService } from './services'

export const userRepository = new UserRepository(passwordService)
export const mFARepository = new MFARepository()
export const mFAChooseRepository = new MFAChooseRepository(uuidService)
