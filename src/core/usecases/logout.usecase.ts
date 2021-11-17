import { InvalidatingToken } from './driven/invalidating_token.driven'
import {
  LogoutUser,
  LogoutUserErrors,
  LogoutUserErrorsTypes,
} from './driver/logout_user.driver'

export default class Logout implements LogoutUser {
  constructor(private invalidatingToken: InvalidatingToken) {}

  async logout(token: string): Promise<void> {
    try {
      await this.invalidatingToken.invalidate(token)
    } catch (error) {
      throw this.handleError()
    }
  }

  private handleError() {
    return new LogoutUserErrors(LogoutUserErrorsTypes.DEPENDECY_ERROR)
  }
}
