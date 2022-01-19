export interface UpdateUser {
  update: (
    userId: string,
    name?: string,
    email?: string,
    phone?: string,
    deviceId?: string,
    gaToken?: string
  ) => Promise<boolean>
}

export enum UpdateUserErrorsTypes {
  NOT_FOUND = 'NOT_FOUND',
  DEPENDENCY_ERROR = 'DEPENDENCY_ERROR',
}

export class UpdateUserErrors extends Error {
  constructor(message: UpdateUserErrorsTypes) {
    super(message)
  }
}
