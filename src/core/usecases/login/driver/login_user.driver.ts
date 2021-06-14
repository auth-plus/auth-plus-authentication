import { Strategy } from '../../mfa/common/strategy'
import { Credential } from '../../../entities/credentials'

export interface LoginUser {
  login: (
    email: string,
    password: string
  ) => Promise<Credential | Array<Strategy>>
}

export enum LoginUserErrorsTypes {
  WRONG_CREDENTIAL = 'WRONG_CREDENTIAL',
  DEPENDECY_ERROR = 'DEPENDECY_ERROR',
}

export class LoginUserErrors extends Error {
  constructor(message: LoginUserErrorsTypes) {
    super(message)
    this.name = 'LoginUser'
  }
}
