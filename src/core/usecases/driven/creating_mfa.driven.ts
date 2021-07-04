import { Strategy } from '../../entities/strategy'

export interface CreatingMFA {
  creatingStrategyForUser: (
    name: string,
    userId: string,
    strategy: Strategy
  ) => Promise<string>
}

export enum CreatingMFAErrorsTypes {
  ALREADY_EXIST = 'ALREADY_EXIST',
  DATABASE_DEPENDECY_ERROR = 'DATABASE_DEPENDECY_ERROR',
}

export class CreatingMFAErrors extends Error {
  constructor(message: CreatingMFAErrorsTypes) {
    super(message)
  }
}
