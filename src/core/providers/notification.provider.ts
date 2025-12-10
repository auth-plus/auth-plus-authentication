import { Kafka } from 'kafkajs'
import { Knex } from 'knex'

import { produce } from '../config/kafka'
import { Strategy } from '../entities/strategy'
import { CreatingSystemUser } from '../usecases/driven/creating_system_user.driven'
import {
  SendingMfaCode,
  SendingMfaCodeErrors,
  SendingMfaCodeErrorsTypes,
} from '../usecases/driven/sending_mfa_code.driven'
import {
  SendingMfaHash,
  SendingMfaHashErrors,
  SendingMfaHashErrorsTypes,
} from '../usecases/driven/sending_mfa_hash.driven'
import { SendingResetEmail } from '../usecases/driven/sending_reset_email.driven'

export class NotificationProvider
  implements
    SendingMfaCode,
    SendingMfaHash,
    SendingResetEmail,
    CreatingSystemUser
{
  constructor(
    private database: Knex,
    private kafkaClient: Kafka
  ) {}

  async sendCodeByEmail(userId: string, code: string): Promise<void> {
    const tuples: { email: string }[] = await this.database('user')
      .select('email')
      .where('id', userId)
      .limit(1)
    if (tuples.length === 0) {
      throw new SendingMfaCodeErrors(
        SendingMfaCodeErrorsTypes.USER_EMAIL_NOT_FOUND
      )
    }
    await produce(
      '2FA_EMAIL_SENT',
      {
        email: tuples[0].email,
        content: code,
      },
      this.kafkaClient
    )
  }

  async sendCodeByPhone(userId: string, code: string): Promise<void> {
    const tuples: { value: string }[] = await this.database('user')
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
    await produce(
      '2FA_PHONE_SENT',
      {
        email: tuples[0].value,
        content: code,
      },
      this.kafkaClient
    )
  }

  async sendCodeByStrategy(
    userId: string,
    code: string,
    strategy: Strategy
  ): Promise<void> {
    switch (strategy) {
      case Strategy.EMAIL:
        await this.sendCodeByEmail(userId, code)
        break
      case Strategy.PHONE:
        await this.sendCodeByPhone(userId, code)
        break
      default:
        throw new SendingMfaCodeErrors(SendingMfaCodeErrorsTypes.GA_SENT_CODE)
    }
  }

  async sendMfaHashByEmail(userId: string, hash: string): Promise<void> {
    const tuples: { email: string }[] = await this.database('user')
      .select('email')
      .where('id', userId)
      .limit(1)
    if (tuples.length === 0) {
      throw new SendingMfaHashErrors(
        SendingMfaHashErrorsTypes.USER_EMAIL_HASH_NOT_FOUND
      )
    }
    await produce(
      '2FA_EMAIL_CREATED',
      {
        email: tuples[0].email,
        content: hash,
      },
      this.kafkaClient
    )
  }

  async sendMfaHashByPhone(userId: string, hash: string): Promise<void> {
    const tuples: { value: string }[] = await this.database('user')
      .innerJoin('user_info', 'user.id', '=', 'user_info.user_id')
      .select('user_info.value')
      .where('user_info.type', 'phone')
      .andWhere('user.id', userId)
      .limit(1)
    if (tuples.length === 0) {
      throw new SendingMfaHashErrors(
        SendingMfaHashErrorsTypes.USER_PHONE_HASH_NOT_FOUND
      )
    }
    await produce(
      '2FA_PHONE_CREATED',
      {
        email: tuples[0].value,
        content: hash,
      },
      this.kafkaClient
    )
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

  async sendEmail(email: string, hash: string): Promise<void> {
    await produce(
      'RESET_PASSWORD',
      {
        email,
        hash,
      },
      this.kafkaClient
    )
  }

  async create(userId: string): Promise<void> {
    await produce(
      'USER_CREATED',
      {
        external_id: userId,
      },
      this.kafkaClient
    )
  }
}
