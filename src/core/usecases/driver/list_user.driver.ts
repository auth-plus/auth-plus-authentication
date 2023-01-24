import { ShallowUser } from '../../entities/user'

export interface ListUser {
  list: () => Promise<ShallowUser[]>
}

export enum ListUserErrorsTypes {
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  DEPENDECY_ERROR = 'DEPENDECY_ERROR',
}

export class ListUserErrors extends Error {
  constructor(message: ListUserErrorsTypes) {
    super(message)
    this.name = 'ListMFA'
  }
}
