export interface SendingMFACode {
  sendCodeForUser: (userId: string, code: string) => Promise<void>
}

export enum SendingMFACodeErrorsTypes {
  NOT_FOUND = 'NOT_FOUND',
  PROVIDER_ERROR = 'PROVIDER_ERROR',
}

export class SendingMFACodeErrors extends Error {
  constructor(message: SendingMFACodeErrorsTypes) {
    super(message)
  }
}
