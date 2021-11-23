import { User } from 'src/core/entities/user'

export interface CreatingToken {
  create: (user: User) => string
}

export enum CreatingTokenErrorsTypes {
  PROVIDER_ERROR = 'PROVIDER_ERROR',
}

export class CreatingTokenErrors extends Error {
  constructor(message: CreatingTokenErrorsTypes) {
    super(message)
  }
}
