export interface ForgetPassword {
  forget(email: string): Promise<void>
}

export enum ForgetPasswordErrorsTypes {
  DEPENDECY_ERROR = 'DEPENDECY_ERROR',
}

export class ForgetPasswordErrors extends Error {
  constructor(message: ForgetPasswordErrorsTypes) {
    super(message)
    this.name = 'LoginUser'
  }
}
