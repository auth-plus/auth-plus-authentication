import { Strategy } from '../../../entities/strategy'

export interface CreatingMFAChoose {
  create: (userId: string, strategyList: Strategy[]) => Promise<string>
}

export enum CreatingMFAChooseErrorsTypes {
  CACHE_DEPENDECY_ERROR = 'DATABASE_DEPENDECY_ERROR',
}

export class CreatingMFAChooseErrors extends Error {
  constructor(message: CreatingMFAChooseErrorsTypes) {
    super(message)
  }
}
