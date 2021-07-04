import { User } from '../../entities/user'

export interface FindingUser {
  findUserByEmailAndPassword: (email: string, password: string) => Promise<User>
}

export enum FindingUserErrorsTypes {
  NOT_FOUND = 'NOT FOUND',
  PASSWORD_WRONG = 'PASSWORD WRONG',
  DATABASE_DEPENDECY_ERROR = 'DATABASE_DEPENDECY_ERROR',
}

export class FindingUserErrors extends Error {
  constructor(message: FindingUserErrorsTypes) {
    super(message)
    this.name = 'FindingUser'
  }
}
