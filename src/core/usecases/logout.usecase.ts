import { logger } from '../../config/logger'
import { InvalidatingToken } from './driven/invalidating_token.driven'
import {
  LogoutUser,
  LogoutUserErrors,
  LogoutUserErrorsTypes,
} from './driver/logout_user.driver'

export default class Logout implements LogoutUser {
  constructor(private invalidatingToken: InvalidatingToken) {}

  async logout(token: string): Promise<void> {
    logger.info({ event: 'auth.logout.started' }, 'Logout attempt initiated')
    try {
      await this.invalidatingToken.invalidate(token)
      logger.info({ event: 'auth.logout.success' }, 'Logout completed successfully')
    } catch (error) {
      logger.error(
        { event: 'auth.logout.error', error: (error as Error).message },
        'Logout failed: dependency or internal error'
      )
      throw new LogoutUserErrors(LogoutUserErrorsTypes.DEPENDECY_ERROR)
    }
  }
}
