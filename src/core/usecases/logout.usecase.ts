import { FindingUser } from './driven/finding_user.driven'
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
  constructor(
    private invalidatingToken: InvalidatingToken,
    private findingUser: FindingUser
  ) {}

  async logout(
    jwtPayload: Record<string, any>,
    token: string,
    allSession = false
  ): Promise<void> {
    try {
      if (allSession) {
        const user = await this.findingUser.findById(jwtPayload.userId)
        this.invalidatingToken.invalidate(token, user)
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
