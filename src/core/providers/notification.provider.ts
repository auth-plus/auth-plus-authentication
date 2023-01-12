import { produce } from '../../config/kafka'
import database from '../config/database'
import { Strategy } from '../entities/strategy'
import {
  SendingMfaCode,
  SendingMfaCodeErrors,
  SendingMfaCodeErrorsTypes,
} from '../usecases/driven/sending_mfa_code.driven'
import { SendingMfaHash } from '../usecases/driven/sending_mfa_hash.driven'

export class NotificationProvider implements SendingMfaCode, SendingMfaHash {
  async sendCodeByEmail(userId: string, code: string): Promise<void> {
    const tuples: { email: string }[] = await database('user')
      .select('email')
      .where('id', userId)
      .limit(1)
    if (tuples.length === 0) {
      throw new SendingMfaCodeErrors(SendingMfaCodeErrorsTypes.USER_NOT_FOUND)
    }
    await produce('2FA_EMAIL_SENT', {
      email: tuples[0].email,
      content: code,
    })
  }

  async sendCodeByPhone(userId: string, code: string): Promise<void> {
    const tuples: { value: string }[] = await database('user')
      .innerJoin('user_info', 'user.id', '=', 'user_info.user_id')
      .select('user_info.value')
      .where('user_info.type', 'phone')
      .andWhere('user.id', userId)
      .limit(1)
    if (tuples.length === 0) {
      throw new SendingMfaCodeErrors(
        SendingMfaCodeErrorsTypes.USER_PHONE_NOT_FOUND
      )
    }
    await produce('2FA_PHONE_SENT', {
      email: tuples[0].value,
      content: code,
    })
  }

  async sendCodeByStrategy(
    userId: string,
    code: string,
    strategy: Strategy
  ): Promise<void> {
    switch (strategy) {
      case Strategy.EMAIL:
        this.sendCodeByEmail(userId, code)
        break
      case Strategy.PHONE:
        this.sendCodeByPhone(userId, code)
        break
      default:
        break
    }
  }

  async sendMfaHashByEmail(userId: string, hash: string): Promise<void> {
    const tuples: { email: string }[] = await database('user')
      .select('email')
      .where('id', userId)
      .limit(1)
    if (tuples.length === 0) {
      throw new SendingMfaCodeErrors(SendingMfaCodeErrorsTypes.USER_NOT_FOUND)
    }
    await produce('2FA_EMAIL_CREATED', {
      email: tuples[0].email,
      content: hash,
    })
  }

  async sendMfaHashByPhone(userId: string, hash: string): Promise<void> {
    const tuples: { value: string }[] = await database('user')
      .innerJoin('user_info', 'user.id', '=', 'user_info.user_id')
      .select('user_info.value')
      .where('user_info.type', 'phone')
      .andWhere('user.id', userId)
      .limit(1)
    if (tuples.length === 0) {
      throw new SendingMfaCodeErrors(
        SendingMfaCodeErrorsTypes.USER_PHONE_NOT_FOUND
      )
    }
    await produce('2FA_PHONE_CREATED', {
      email: tuples[0].value,
      content: hash,
    })
  }

  async sendMfaHashByStrategy(
    userId: string,
    hash: string,
    strategy: Strategy
  ): Promise<void> {
    switch (strategy) {
      case Strategy.EMAIL:
        this.sendMfaHashByEmail(userId, hash)
        break
      case Strategy.PHONE:
        this.sendMfaHashByPhone(userId, hash)
        break
      default:
        break
    }
  }
}
