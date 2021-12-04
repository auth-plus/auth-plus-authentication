import { Strategy } from '../../entities/strategy'
import { User } from '../../entities/user'

export interface CreatingMFA {
  creatingStrategyForUser: (user: User, strategy: Strategy) => Promise<string>
}

export enum CreatingMFAErrorsTypes {
  ALREADY_EXIST = 'ALREADY_EXIST',
  INVALID_TYPE = 'INVALID_TYPE',
  DATABASE_DEPENDECY_ERROR = 'DATABASE_DEPENDECY_ERROR',
}

export class CreatingMFAErrors extends Error {
  constructor(message: CreatingMFAErrorsTypes) {
    super(message)
  }
}
