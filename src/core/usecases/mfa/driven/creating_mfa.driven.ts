import { Strategy } from '../../../entities/strategy'

export interface CreatingMFA {
  creatingStrategyForUser: (
    name: string,
    userId: string,
    strategy: Strategy
  ) => Promise<void>
}

export enum CreatingMFAErrorsTypes {
  NOT_FOUND = 'NOT FOUND',
  DATABASE_DEPENDECY_ERROR = 'DATABASE_DEPENDECY_ERROR',
}

export class CreatingMFAErrors extends Error {
  constructor(message: CreatingMFAErrorsTypes) {
    super(message)
  }
}
