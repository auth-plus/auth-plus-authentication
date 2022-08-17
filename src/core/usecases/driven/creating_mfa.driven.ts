import { Mfa } from '../../entities/mfa'
import { Strategy } from '../../entities/strategy'
import { User } from '../../entities/user'

export interface CreatingMFA {
  creatingStrategyForUser: (user: User, strategy: Strategy) => Promise<Mfa>
}

export enum CreatingMFAErrorType {
  MFA_ALREADY_EXIST = 'MFA_ALREADY_EXIST',
  MFA_INFO_NOT_EXIST = 'MFA_INFO_NOT_EXIST',
}

export class CreatingMFAError extends Error {
  constructor(message: CreatingMFAErrorType) {
    super(message)
    this.name = 'CreatingMFA'
  }
}
