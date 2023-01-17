export interface RecoverPassword {
  recover(newPassword: string, hash: string): Promise<void>
}

export enum RecoverPasswordErrorsTypes {
  DEPENDECY_ERROR = 'DEPENDECY_ERROR',
}

export class RecoverPasswordErrors extends Error {
  constructor(message: RecoverPasswordErrorsTypes) {
    super(message)
    this.name = 'RecoverPassword'
  }
}
