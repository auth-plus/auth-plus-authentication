import { Credential } from '../../entities/credentials'

export interface FindMFACode {
  find: (hash: string, code: string) => Promise<Credential>
}
export enum FindMFACodeErrorType {
  NOT_FOUND = 'NOT_FOUND',
  WRONG_INFO = 'WRONG_INFO',
  INFO_NOT_EXIST = 'INFO_NOT_EXIST',
  DEPENDECY_ERROR = 'DEPENDECY_ERROR',
}

export class FindMFACodeError extends Error {
  constructor(message: FindMFACodeErrorType) {
    super(message)
    this.name = 'FindMFACode'
  }
}
