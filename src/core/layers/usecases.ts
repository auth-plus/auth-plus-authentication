import Login from '../usecases/login/login.usecase'
import Mfa from '../usecases/mfa/mfa.usecase'
import MFAChoose from '../usecases/mfa/mfa_choose.usecase'
import MFACode from '../usecases/mfa/mfa_code.usecase'
import User from '../usecases/user/user.usecase'

import {
  userRepository,
  mFARepository,
  mFAChooseRepository,
  emailRepository,
  mFACodeRepository,
} from './providers'

export const login = new Login(
  userRepository,
  mFARepository,
  mFAChooseRepository
)
export const mfa = new Mfa(mFARepository, mFARepository)
export const mfaChoose = new MFAChoose(
  mFAChooseRepository,
  mFACodeRepository,
  emailRepository
)
export const mFACode = new MFACode(mFACodeRepository)
export const user = new User(userRepository)
