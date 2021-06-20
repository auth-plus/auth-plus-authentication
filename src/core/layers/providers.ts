import { UserRepository } from '../providers/user.repository'
import { MFARepository } from '../providers/mfa.repository'

import { passwordService } from './services'

export const userRepository = new UserRepository(passwordService)
export const mFARepository = new MFARepository()
