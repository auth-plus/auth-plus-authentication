import { CacheCode } from 'src/core/providers/mfa_code.repository'

export interface FindingMFACode {
  findByHash: (hash: string) => Promise<CacheCode>
}

export enum FindingMFACodeErrorsTypes {
  NOT_FOUND = 'NOT_FOUND',
  CACHE_DEPENDECY_ERROR = 'CACHE_DEPENDECY_ERROR',
}

export class FindingMFACodeErrors extends Error {
  constructor(message: FindingMFACodeErrorsTypes) {
    super(message)
  }
}
