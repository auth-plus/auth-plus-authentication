import { Strategy } from '../../entities/strategy'

export interface SendingMfaCode {
  sendCodeByEmail: (userId: string, code: string) => Promise<void>
  sendCodeByPhone: (userId: string, code: string) => Promise<void>
  sendCodeByStrategy: (
    userId: string,
    code: string,
    strategy: Strategy
  ) => Promise<void>
}

export enum SendingMfaCodeErrorsTypes {
  USER_EMAIL_NOT_FOUND = 'USER_EMAIL_NOT_FOUND',
  USER_PHONE_NOT_FOUND = 'USER_PHONE_NOT_FOUND',
}

export class SendingMfaCodeErrors extends Error {
  constructor(message: SendingMfaCodeErrorsTypes) {
    super(message)
    this.name = 'SendingMfaCode'
  }
}
