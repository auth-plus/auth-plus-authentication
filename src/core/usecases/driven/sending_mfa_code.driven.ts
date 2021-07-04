export interface SendingMFACode {
  sendCodeForUser: (userId: string, code: string) => Promise<void>
}

export enum SendingMFACodeErrorsTypes {
  NOT_FOUND = 'NOT FOUND',
  DATABASE_DEPENDECY_ERROR = 'DATABASE_DEPENDECY_ERROR',
}

export class SendingMFACodeErrors extends Error {
  constructor(message: SendingMFACodeErrorsTypes) {
    super(message)
  }
}
