import { CacheCode } from 'src/core/providers/mfa_code.repository'

export interface FindingMFACode {
  findByHash: (hash: string) => Promise<CacheCode>
}

export enum FindingMFACodeErrorsTypes {
  NOT_FOUND = 'NOT_FOUND',
}

export class FindingMFACodeErrors extends Error {
  constructor(message: FindingMFACodeErrorsTypes) {
    super(message)
  }
}
