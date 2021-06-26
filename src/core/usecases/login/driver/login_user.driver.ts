import { Credential } from '../../../entities/credentials'
import { MFAChoose } from '../../../value_objects/mfa_choose'

export interface LoginUser {
  login: (email: string, password: string) => Promise<Credential | MFAChoose>
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
