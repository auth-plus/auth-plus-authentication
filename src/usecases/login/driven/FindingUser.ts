export interface FindingUser {
  findUserByEmailAndPassword: (email: string, password: string) => Promise<User>
}

export interface User {
  name: string
  email: string
}

export enum FindingUserErrorsTypes {
  NOT_FOUND = 'NOT FOUND',
}

export class FindingUserErrors extends Error {
  constructor(message: FindingUserErrorsTypes) {
    super(message)
  }
}
