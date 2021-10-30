import Login from '../usecases/login.usecase'
import Mfa from '../usecases/mfa.usecase'
import MFAChoose from '../usecases/mfa_choose.usecase'
import MFACode from '../usecases/mfa_code.usecase'
import User from '../usecases/user.usecase'

import {
  userRepository,
  mFARepository,
  mFAChooseRepository,
  emailRepository,
  mFACodeRepository,
} from './providers'

export const login = (): Login =>
  new Login(userRepository(), mFARepository(), mFAChooseRepository())
export const mfa = (): Mfa => new Mfa(mFARepository(), mFARepository())
export const mfaChoose = (): MFAChoose =>
  new MFAChoose(mFAChooseRepository(), mFACodeRepository(), emailRepository())
export const mFACode = (): MFACode =>
  new MFACode(mFACodeRepository(), mFACodeRepository(), userRepository())
export const user = (): User => new User(userRepository())
