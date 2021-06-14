import { PasswordService } from '../services/password.service'
import { UserRepository } from '../providers/user.repository'
import Login from '../usecases/login/login.usecase'
import { MFARepository } from '../providers/mfa.repository'
import Mfa from '../usecases/mfa/mfa.usecase'
import User from '../usecases/user/user.usecase'
import { CreateUser } from '../usecases/user/driver/create_user.driver'
import { CreateMFA } from '../usecases/mfa/driver/create_mfa.driver'
import { LoginUser } from '../usecases/login/driver/login_user.driver'

//Services Layes
const passwordService = new PasswordService()

//Providers Layers
const userRepository = new UserRepository(passwordService)
const mFARepository = new MFARepository()

//Usecase Layers
const login: LoginUser = new Login(userRepository, mFARepository)
const mfa: CreateMFA = new Mfa()
const user: CreateUser = new User(userRepository)

//Final Layer
const Core = {
  login,
  mfa,
  user,
}

export default Core
