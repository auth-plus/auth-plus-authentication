import { Strategy } from '../../entities/strategy'

export interface CreateMFACode {
  create: (userId: string, strategy: Strategy) => Promise<string>
}

export enum CreateMFACodeErrorsTypes {
  NO_STRATEGY = 'NO_STRATEGY',
  MULTIPLE_STRATEGY = 'MULTIPLE_STRATEGY',
  DEPENDECY_ERROR = 'DEPENDECY_ERROR',
}

export class CreateMFACodeErrors extends Error {
  constructor(message: CreateMFACodeErrorsTypes) {
    super(message)
    this.name = 'CreateMFACode'
  }
}
