import { CacheCode } from '../../providers/mfa_code.repository'

export interface FindingMFACode {
  findByHash: (hash: string) => Promise<CacheCode>
}

export enum FindingMFACodeErrorsTypes {
  MFA_CODE_HASH_NOT_FOUND = 'MFA_CODE_HASH_NOT_FOUND',
}

export class FindingMFACodeErrors extends Error {
  constructor(message: FindingMFACodeErrorsTypes) {
    super(message)
    this.name = 'FindingMFACode'
  }
}
