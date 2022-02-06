export interface UpdateUserInput {
  userId: string
  name?: string
  email?: string
  phone?: string
  deviceId?: string
  gaToken?: string
}

export interface UpdateUser {
  update: (input: UpdateUserInput) => Promise<boolean>
}

export enum UpdateUserErrorType {
  NOT_FOUND = 'NOT_FOUND',
  DEPENDENCY_ERROR = 'DEPENDENCY_ERROR',
}

export class UpdateUserError extends Error {
  constructor(message: UpdateUserErrorType) {
    super(message)
  }
}
