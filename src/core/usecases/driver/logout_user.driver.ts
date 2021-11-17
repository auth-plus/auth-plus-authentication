export interface LogoutUser {
  logout: (token: string) => Promise<void>
}

export enum LogoutUserErrorsTypes {
  DEPENDECY_ERROR = 'DEPENDECY_ERROR',
}

export class LogoutUserErrors extends Error {
  constructor(message: LogoutUserErrorsTypes) {
    super(message)
    this.name = 'LogoutUser'
  }
}
