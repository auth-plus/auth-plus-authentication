import { Strategy } from '../common/strategy'

export interface CreatingMFACode {
  creatingCodeForStrategy: (
    userId: string,
    code: string,
    strategy: Strategy
  ) => Promise<void>
}

export interface MFA {
  userId: string
  code: string
  strategy: Strategy
}

export enum CreatingMFACodeErrorsTypes {
  NOT_FOUND = 'NOT FOUND',
  CACHE_DEPENDECY_ERROR = 'CACHE_DEPENDECY_ERROR',
}

export class CreatingMFACodeErrors extends Error {
  constructor(message: CreatingMFACodeErrorsTypes) {
    super(message)
  }
}