import { Strategy } from '../../entities/strategy'

export interface FindingMFAChoose {
  findByHash: (
    hash: string
  ) => Promise<{ userId: string; strategyList: Strategy[] }>
}

export enum FindingMFAChooseErrorsTypes {
  MFA_CHOOSE_HASH_NOT_FOUND = 'MFA_CHOOSE_HASH_NOT_FOUND',
}

export class FindingMFAChooseErrors extends Error {
  constructor(message: FindingMFAChooseErrorsTypes) {
    super(message)
    this.name = 'FindingMFAChoose'
  }
}
