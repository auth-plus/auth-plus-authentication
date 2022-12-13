import Login from '../usecases/login.usecase'
import Logout from '../usecases/logout.usecase'
import Mfa from '../usecases/mfa.usecase'
import MFAChoose from '../usecases/mfa_choose.usecase'
import MFACode from '../usecases/mfa_code.usecase'
import OrganizationUseCase from '../usecases/organization.usecase'
import UserUsecase from '../usecases/user.usecase'

import {
  userRepository,
  mFARepository,
  mFAChooseRepository,
  emailRepository,
  mFACodeRepository,
  tokenRepository,
  organizationRepository,
} from './providers'

export const login = (): Login =>
  new Login(
    userRepository(),
    mFARepository(),
    mFAChooseRepository(),
    tokenRepository()
  )
export const logout = (): Logout => new Logout(tokenRepository())

export const mfaChoose = (): MFAChoose =>
  new MFAChoose(mFAChooseRepository(), mFACodeRepository(), emailRepository())
export const mFACode = (): MFACode =>
  new MFACode(
    mFACodeRepository(),
    mFACodeRepository(),
    userRepository(),
    tokenRepository(),
    mFACodeRepository(),
    mFARepository()
  )
export const mfa = (): Mfa =>
  new Mfa(userRepository(), mFARepository(), mFARepository(), mFARepository())
export const user = (): UserUsecase =>
  new UserUsecase(userRepository(), userRepository(), userRepository())
export const organization = (): OrganizationUseCase =>
  new OrganizationUseCase(
    organizationRepository(),
    userRepository(),
    organizationRepository(),
    organizationRepository(),
    organizationRepository()
  )
