import { User } from 'src/core/entities/user'

export interface InvalidatingToken {
  invalidate: (token: string, user?: User) => Promise<void>
}

export enum InvalidatingTokenErrorsTypes {
  NOT_FOUND = 'NOT_FOUND',
  PROVIDER_ERROR = 'PROVIDER_ERROR',
}

export class InvalidatingTokenErrors extends Error {
  constructor(message: InvalidatingTokenErrorsTypes) {
    super(message)
  }
}
