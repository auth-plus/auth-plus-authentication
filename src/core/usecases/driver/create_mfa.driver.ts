import { Strategy } from '../../entities/strategy'

export interface MFACreateInput {
  userId: string
  strategy: Strategy
}
export interface CreateMFA {
  create: (content: MFACreateInput) => Promise<string>
}

export enum CreateMFAErrorsTypes {
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
