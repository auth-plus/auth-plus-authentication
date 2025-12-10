import { Credential } from '../../entities/credentials'

export interface RefreshToken {
  refresh: (token: string) => Promise<Credential>
}

export enum RefreshTokenErrorsTypes {
  DEPENDECY_ERROR = 'DEPENDECY_ERROR',
}

export class RefreshTokenErrors extends Error {
  constructor(message: RefreshTokenErrorsTypes) {
    super(message)
    this.name = 'RefreshToken'
  }
}
