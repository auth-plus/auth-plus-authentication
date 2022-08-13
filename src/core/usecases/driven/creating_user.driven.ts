export interface CreatingUser {
  create: (name: string, email: string, password: string) => Promise<string>
}

export enum CreatingUserErrorsTypes {
  LOW_ENTROPY = 'LOW_ENTROPY',
}

export class CreatingUserErrors extends Error {
  constructor(message: CreatingUserErrorsTypes) {
    super(message)
  }
}
