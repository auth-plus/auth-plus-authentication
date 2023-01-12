import logger from '../../config/logger'

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
      logger.error(error)
      throw new LogoutUserErrors(LogoutUserErrorsTypes.DEPENDECY_ERROR)
    }
  }
}
