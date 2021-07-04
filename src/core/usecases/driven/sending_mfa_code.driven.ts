export interface SendingMFACode {
  sendCodeForUser: (userId: string, code: string) => Promise<void>
}

export enum CreatingMFACodeErrorsTypes {
  NOT_FOUND = 'NOT FOUND',
  CACHE_DEPENDECY_ERROR = 'CACHE_DEPENDECY_ERROR',
}

export class CreatingMFACodeErrors extends Error {
  constructor(message: CreatingMFACodeErrorsTypes) {
    super(message)
  }
}
