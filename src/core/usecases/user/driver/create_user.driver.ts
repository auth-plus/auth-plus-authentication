export interface CreateUser {
  create: (name: string, email: string, password: string) => Promise<void>
}

export enum FindingUserErrorsTypes {
  NOT_FOUND = 'NOT FOUND',
}

export class FindingUserErrors extends Error {
  constructor(message: FindingUserErrorsTypes) {
    super(message)
  }
}
