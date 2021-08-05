import { Strategy } from '../../entities/strategy'

export interface CreatingMFACode {
  creatingCodeForStrategy: (
    userId: string,
    strategy: Strategy
  ) => Promise<{ hash: string; code: string }>
}

export enum CreatingMFACodeErrorsTypes {
  CACHE_DEPENDECY_ERROR = 'CACHE_DEPENDECY_ERROR',
}

export class CreatingMFACodeErrors extends Error {
  constructor(message: CreatingMFACodeErrorsTypes) {
    super(message)
  }
}
