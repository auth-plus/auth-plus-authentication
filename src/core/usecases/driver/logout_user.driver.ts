export interface LogoutUser {
  logout: (
    jwtPayload: Record<string, any>,
    token: string,
    allSession?: boolean
  ) => Promise<void>
}

export enum LogoutUserErrorsTypes {
  WRONG_CREDENTIAL = 'WRONG_CREDENTIAL',
  DEPENDECY_ERROR = 'DEPENDECY_ERROR',
}

export class LogoutUserErrors extends Error {
  constructor(message: LogoutUserErrorsTypes) {
    super(message)
    this.name = 'LogoutUser'
  }
}
