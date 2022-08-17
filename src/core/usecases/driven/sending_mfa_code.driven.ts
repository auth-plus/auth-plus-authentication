export interface SendingMfaCode {
  sendByEmail: (userId: string, code: string) => Promise<void>
  sendBySms: (userId: string, code: string) => Promise<void>
}
export enum SendingMfaCodeErrorsTypes {
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  USER_PHONE_NOT_FOUND = 'USER_PHONE_NOT_FOUND',
}

export class SendingMfaCodeErrors extends Error {
  constructor(message: SendingMfaCodeErrorsTypes) {
    super(message)
    this.name = 'SendingMfaCode'
  }
}
