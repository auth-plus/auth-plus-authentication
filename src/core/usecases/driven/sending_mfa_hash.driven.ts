import { Strategy } from '../../entities/strategy'

export interface SendingMfaHash {
  sendMfaHashByEmail: (userId: string, hash: string) => Promise<void>
  sendMfaHashByPhone: (userId: string, hash: string) => Promise<void>
  sendMfaHashByStrategy: (
    userId: string,
    hash: string,
    strategy: Strategy
  ) => Promise<void>
}

export enum SendingMfaHashErrorsTypes {
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  USER_PHONE_NOT_FOUND = 'USER_PHONE_NOT_FOUND',
}

export class SendingMfaHashErrors extends Error {
  constructor(message: SendingMfaHashErrorsTypes) {
    super(message)
    this.name = 'SendingMfaCode'
  }
}
