import { PasswordService } from '../services/password.service'
import { UserRepository } from '../providers/user.repository'
import Login from '../usecases/login/login.usecase'
import { MFARepository } from '../providers/mfa.repository'
import Mfa from '../usecases/mfa/mfa.usecase'
import User from '../usecases/user/user.usecase'

//Services Layes
const passwordService = new PasswordService()

//Providers Layers
const findingUser = new UserRepository(passwordService)
const findingMFA = new MFARepository()
const creatingMFA = new UserRepository(passwordService)

//Usecase Layers
const login = new Login(findingUser, findingMFA)
const mfa = new Mfa()
const user = new User(creatingMFA)
const Core = {
  login,
  mfa,
  user,
}

export default Core
