export interface CreatingUser {
  create: (name: string, email: string, password: string) => Promise<string>
}

export enum CreatingUserErrorsTypes {
  PASSWORD_LOW_ENTROPY = 'PASSWORD_LOW_ENTROPY',
}

export class CreatingUserErrors extends Error {
  constructor(message: CreatingUserErrorsTypes) {
    super(message)
    this.name = 'CreatingUser'
  }
}
