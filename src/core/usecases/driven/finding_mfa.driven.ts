import { Strategy } from '../../entities/strategy'

export interface FindingMFA {
  findMFAListByUserId: (
    userId: string
  ) => Promise<Array<{ id: string; strategy: Strategy }>>
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
  NOT_FOUND = 'NOT FOUND',
  DATABASE_DEPENDECY_ERROR = 'DATABASE_DEPENDECY_ERROR',
}

export class FindingMFAErrors extends Error {
  constructor(message: FindingMFAErrorsTypes) {
    super(message)
  }
}
