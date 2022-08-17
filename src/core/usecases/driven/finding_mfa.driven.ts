import { Strategy } from '../../entities/strategy'

export interface FindingMFA {
  findMfaListByUserId: (
    userId: string
  ) => Promise<{ id: string; strategy: Strategy }[]>
  checkMfaExist: (userId: string, strategy: Strategy) => Promise<void>
  findMFAByUserIdAndStrategy: (
    userId: string,
    strategy: Strategy
  ) => Promise<{
    id: string
    userId: string
    strategy: Strategy
  }>
}

export enum FindingMFAErrorsTypes {
  MFA_NOT_FOUND = 'MFA_NOT_FOUND',
  MFA_ALREADY_EXIST = 'MFA_ALREADY_EXIST',
}

export class FindingMFAErrors extends Error {
  constructor(message: FindingMFAErrorsTypes) {
    super(message)
    this.name = 'FindingMFA'
  }
}
