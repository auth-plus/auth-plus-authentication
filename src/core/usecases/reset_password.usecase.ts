import { logger } from '../../config/logger'
import { CreatingResetPassword } from '../driven/creating_reset_password.driven'
import { FindingResetPassword } from '../driven/finding_reset_password.driven'
import { FindingUser } from '../driven/finding_user.driven'
import { SendingResetEmail } from '../driven/sending_reset_email.driven'
import { UpdatingUser } from '../driven/updating_user.driven'
import {
  ForgetPassword,
  ForgetPasswordErrors,
  ForgetPasswordErrorsTypes,
} from '../driver/forget_password.driver'
import {
  RecoverPassword,
  RecoverPasswordErrors,
  RecoverPasswordErrorsTypes,
} from '../driver/recover_password.driver'

export default class ResetPasswordUseCase
  implements ForgetPassword, RecoverPassword
{
  constructor(
    private creatingResetPassword: CreatingResetPassword,
    private sendingResetEmail: SendingResetEmail,
    private findingResetPassword: FindingResetPassword,
    private findingUser: FindingUser,
    private updatingUser: UpdatingUser
  ) {}

  async forget(email: string): Promise<void> {
    logger.info(
      { event: 'auth.password.forget.started', email },
      'Password reset request initiated'
    )
    try {
      const hash = await this.creatingResetPassword.create(email)
      await this.sendingResetEmail.sendEmail(email, hash)
      logger.info(
        { event: 'auth.password.forget.success', email },
        'Password reset token generated and email sent'
      )
    } catch (error) {
      logger.error(
        {
          event: 'auth.password.forget.error',
          email,
          error: (error as Error).message,
        },
        'Password reset request failed: dependency or internal error'
      )
      throw new ForgetPasswordErrors(ForgetPasswordErrorsTypes.DEPENDECY_ERROR)
    }
  }

  async recover(newPassword: string, hash: string): Promise<void> {
    logger.info(
      { event: 'auth.password.recover.started' },
      'Password recovery execution initiated'
    )
    let resolvedEmail = ''
    try {
      const email = await this.findingResetPassword.findByHash(hash)
      resolvedEmail = email
      const user = await this.findingUser.findByEmail(email)
      await this.updatingUser.updatePassword(user, newPassword)
      logger.info(
        { event: 'auth.password.recover.success', email: resolvedEmail },
        'Password updated successfully'
      )
    } catch (error) {
      logger.error(
        {
          event: 'auth.password.recover.error',
          email: resolvedEmail || undefined,
          error: (error as Error).message,
        },
        'Password recovery failed: dependency or internal error'
      )
      throw new RecoverPasswordErrors(
        RecoverPasswordErrorsTypes.DEPENDECY_ERROR
      )
    }
  }
}
