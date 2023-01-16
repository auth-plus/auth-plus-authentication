import { Strategy } from '../../entities/strategy'

export interface CreateMFA {
  create: (userId: string, strategy: Strategy) => Promise<void>
}

export enum CreateMFAErrorsTypes {
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  ALREADY_EXIST = 'ALREADY_EXIST',
  INFO_NOT_EXIST = 'INFO_NOT_EXIST',
  DEPENDECY_ERROR = 'DEPENDECY_ERROR',
}

export class CreateMFAErrors extends Error {
  constructor(message: CreateMFAErrorsTypes) {
    super(message)
    this.name = 'CreateMFA'
  }
}
