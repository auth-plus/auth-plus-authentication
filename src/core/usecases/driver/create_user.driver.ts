export interface CreateUser {
  create: (name: string, email: string, password: string) => Promise<string>
}

export enum CreateUserErrorsTypes {
  SECURITY_LOW = 'SECURITY_LOW',
  DEPENDENCY_ERROR = 'DEPENDENCY_ERROR',
}

export class CreateUserErrors extends Error {
  constructor(message: CreateUserErrorsTypes) {
    super(message)
    this.name = 'CreateUser'
  }
}
