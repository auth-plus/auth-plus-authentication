import { Strategy } from '../../entities/strategy'

export interface MFACreateInput {
  userId: string
  strategy: Strategy
}
export interface CreateMFA {
  create: (content: MFACreateInput) => Promise<string>
}

export enum CreateMFAErrorsTypes {
  WRONG_CREDENTIAL = 'WRONG_CREDENTIAL',
  DEPENDECY_ERROR = 'DEPENDECY_ERROR',
}

export class CreateMFAErrors extends Error {
  constructor(message: CreateMFAErrorsTypes) {
    super(message)
    this.name = 'CreateMFA'
  }
}
