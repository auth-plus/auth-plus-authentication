import { Strategy } from '../../entities/strategy'

export interface FindingMFA {
  findMFAByUserId: (userId: string) => Promise<Array<Strategy>>
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
