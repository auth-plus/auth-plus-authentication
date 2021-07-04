import { Strategy } from '../../entities/strategy'

export interface FindingMFAChoose {
  findByHash: (
    hash: string
  ) => Promise<{ userId: string; strategyList: Strategy[] }>
}

export enum FindingMFAChooseErrorsTypes {
  NOT_FOUND = 'NOT_FOUND',
  CACHE_DEPENDECY_ERROR = 'CACHE_DEPENDECY_ERROR',
}

export class FindingMFAChooseErrors extends Error {
  constructor(message: FindingMFAChooseErrorsTypes) {
    super(message)
  }
}
