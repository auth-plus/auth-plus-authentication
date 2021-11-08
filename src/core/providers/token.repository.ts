import database from '../config/database'
import { User } from '../entities/user'
import { EmailService } from '../services/email.service'
import {
  InvalidatingToken,
  InvalidatingTokenErrors,
  InvalidatingTokenErrorsTypes,
} from '../usecases/driven/invalidating_token.driven'

export class TokenRepository implements InvalidatingToken {
  constructor(private emailService: EmailService) {}

  async invalidate(token: string, user?: User): Promise<void> {
    try {
      let query = database('token')
        .update({ is_enable: false })
        .where('value', token)
      if (user) {
        query = query.andWhere('user_id', user.id)
      }
      const rowsUpdated = await query
      if (rowsUpdated === 0) {
        throw new InvalidatingTokenErrors(
          InvalidatingTokenErrorsTypes.NOT_FOUND
        )
      }
      if (user) {
        this.emailService.send(
          user.email,
          'Voce foi deslogado de todas as sessions'
        )
      }
    } catch (error) {
      throw new InvalidatingTokenErrors(
        InvalidatingTokenErrorsTypes.PROVIDER_ERROR
      )
    }
  }
}
