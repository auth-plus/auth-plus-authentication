import { User } from 'src/core/entities/user'

export interface ListingToken {
  create: (user: User) => string
}

export enum ListingTokenErrorsTypes {
  NOT_FOUND = 'NOT_FOUND',
  PROVIDER_ERROR = 'PROVIDER_ERROR',
}

export class ListingTokenErrors extends Error {
  constructor(message: ListingTokenErrorsTypes) {
    super(message)
  }
}
