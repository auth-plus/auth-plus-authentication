import Login from '../usecases/login/login.usecase'
import Mfa from '../usecases/mfa/mfa.usecase'
import User from '../usecases/user/user.usecase'

import { userRepository, mFARepository, mFAChooseRepository } from './providers'

export const login = new Login(
  userRepository,
  mFARepository,
  mFAChooseRepository
)
export const mfa = new Mfa(mFARepository, mFARepository)
export const user = new User(userRepository)
