import { Strategy } from 'src/core/entities/strategy'

export interface ListMFA {
  list: (userId: string) => Promise<Strategy[]>
}

export enum ListMFAErrorsTypes {
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  DEPENDECY_ERROR = 'DEPENDECY_ERROR',
}

export class ListMFAErrors extends Error {
  constructor(message: ListMFAErrorsTypes) {
    super(message)
    this.name = 'ListMFA'
  }
}
