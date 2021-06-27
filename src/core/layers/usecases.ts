import Login from '../usecases/login/login.usecase'
import Mfa from '../usecases/mfa/mfa.usecase'
import User from '../usecases/user/user.usecase'
import { CreateUser } from '../usecases/user/driver/create_user.driver'
import { CreateMFA } from '../usecases/mfa/driver/create_mfa.driver'
import { LoginUser } from '../usecases/login/driver/login_user.driver'

import { userRepository, mFARepository, mFAChooseRepository } from './providers'

export const login: LoginUser = new Login(
  userRepository,
  mFARepository,
  mFAChooseRepository
)
export const mfa: CreateMFA = new Mfa()
export const user: CreateUser = new User(userRepository)
