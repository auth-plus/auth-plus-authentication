import { Strategy } from '../../entities/strategy'
import { User } from '../../entities/user'

export interface CreatingMFA {
  creatingStrategyForUser: (user: User, strategy: Strategy) => Promise<string>
}

export enum CreatingMFAErrorType {
  ALREADY_EXIST = 'ALREADY_EXIST',
  INFO_NOT_EXIST = 'INFO_NOT_EXIST',
  INVALID_TYPE = 'INVALID_TYPE',
  DATABASE_DEPENDECY_ERROR = 'DATABASE_DEPENDECY_ERROR',
}

export class CreatingMFAError extends Error {
  constructor(message: CreatingMFAErrorType) {
    super(message)
    Object.setPrototypeOf(this, CreatingMFAError.prototype)
  }
}
