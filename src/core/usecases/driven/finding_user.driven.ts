import { User, ShallowUser } from '../../entities/user'

export interface FindingUser {
  findUserByEmailAndPassword(email: string, password: string): Promise<User>
  findById(userId: string): Promise<User>
  findByEmail(email: string): Promise<User>
  getAll(): Promise<ShallowUser[]>
}

export enum FindingUserErrorsTypes {
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  PASSWORD_WRONG = 'PASSWORD_WRONG',
  MULTIPLE_USERS_FOUND = 'MULTIPLE_USERS_FOUND',
}

export class FindingUserErrors extends Error {
  constructor(message: FindingUserErrorsTypes) {
    super(message)
    this.name = 'FindingUser'
  }
}
