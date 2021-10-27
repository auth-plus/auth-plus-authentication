import {
  InvalidatingToken,
  InvalidatingTokenErrorsTypes,
} from './driven/invalidating_token.driven'
import {
  LogoutUser,
  LogoutUserErrors,
  LogoutUserErrorsTypes,
} from './driver/logout_user.driver'

export default class Logout implements LogoutUser {
  constructor(private invalidatingToken: InvalidatingToken) {}

  async logout(
    jwtPayload: Record<string, any>,
    token: string,
    allSession = false
  ): Promise<void> {
    try {
      if (allSession) {
        this.invalidatingToken.invalidate(token, jwtPayload.userId)
      } else {
        this.invalidatingToken.invalidate(token)
      }
    } catch (error) {
      throw this.handleError(error as Error)
    }
  }

  private handleError(error: Error) {
    switch (error.message) {
      case InvalidatingTokenErrorsTypes.NOT_FOUND:
        return new LogoutUserErrors(LogoutUserErrorsTypes.DEPENDECY_ERROR)
      case InvalidatingTokenErrorsTypes.PROVIDER_ERROR:
        return new LogoutUserErrors(LogoutUserErrorsTypes.WRONG_CREDENTIAL)
      default:
        return new LogoutUserErrors(LogoutUserErrorsTypes.DEPENDECY_ERROR)
    }
  }
}
