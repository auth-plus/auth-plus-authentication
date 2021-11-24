import { authenticator } from 'otplib'

import env from '../../config/enviroment_config'

import database from '../config/database'
import { Strategy } from '../entities/strategy'
import { User } from '../entities/user'
import {
  CreatingMFA,
  CreatingMFAErrors,
  CreatingMFAErrorsTypes,
} from '../usecases/driven/creating_mfa.driven'
import {
  FindingMFA,
  FindingMFAErrors,
  FindingMFAErrorsTypes,
} from '../usecases/driven/finding_mfa.driven'
import { ValidatingMFA } from '../usecases/driven/validating_mfa.driven'

interface MFARow {
  id: string
  value: string
  user_id: string
  strategy: Strategy
}

export class MFARepository implements CreatingMFA, FindingMFA, ValidatingMFA {
  private tableName = 'multi_factor_authentication'

  async creatingStrategyForUser(
    user: User,
    strategy: Strategy
  ): Promise<string> {
    try {
      const tuples = await database<MFARow>(this.tableName)
        .select('*')
        .where('user_id', user.id)
        .andWhere('strategy', strategy)
      if (tuples.length > 0) {
        throw new CreatingMFAErrors(CreatingMFAErrorsTypes.ALREADY_EXIST)
      }
      let insertLine: Partial<MFARow>
      let otpauth: string
      switch (strategy) {
        case Strategy.EMAIL:
          return this.createEmailMFA(user, strategy)
        case Strategy.GA: {
          return this.createGaMfa(user, strategy)
        }
        case Strategy.PHONE:
          return this.createPhoneMFA(user, strategy)
        default:
          throw new CreatingMFAErrors(CreatingMFAErrorsTypes.INVALID_TYPE)
      }
    } catch (error) {
      throw new CreatingMFAErrors(
        CreatingMFAErrorsTypes.DATABASE_DEPENDECY_ERROR
      )
    }
  }

  async findMFAListByUserId(
    userId: string
  ): Promise<Array<{ id: string; strategy: Strategy }>> {
    try {
      const tuples = await database<MFARow>(this.tableName)
        .select('*')
        .where('user_id', userId)
        .andWhere('is_enable', true)
      return tuples.map((_) => ({ id: _.id, strategy: _.strategy }))
    } catch (error) {
      throw new FindingMFAErrors(FindingMFAErrorsTypes.DATABASE_DEPENDECY_ERROR)
    }
  }

  async findMFAByUserIdAndStrategy(
    userId: string,
    strategy: Strategy
  ): Promise<{
    id: string
    userId: string
    strategy: Strategy
    value: string
  }> {
    try {
      const tuples = await database<MFARow>(this.tableName)
        .select('*')
        .where('user_id', userId)
        .andWhere('strategy', strategy)
        .andWhere('is_enable', true)
      if (tuples.length === 0) {
        throw new FindingMFAErrors(FindingMFAErrorsTypes.NOT_FOUND)
      }
      return {
        id: tuples[0].id,
        userId: tuples[0].user_id,
        strategy: tuples[0].strategy,
        value: tuples[0].value,
      }
    } catch (error) {
      throw new FindingMFAErrors(FindingMFAErrorsTypes.DATABASE_DEPENDECY_ERROR)
    }
  }

  async validate(mfaId: string): Promise<boolean> {
    const updateRows = await database<MFARow>(this.tableName)
      .update('is_enable', true) //is created with default False
      .where('id', mfaId)
    return updateRows === 1
  }

  private async createEmailMFA(
    user: User,
    strategy: Strategy
  ): Promise<string> {
    const insertLine = { value: user.email, user_id: user.id, strategy }
    const resp: string[] = await database(this.tableName)
      .insert(insertLine)
      .returning('id')
    return resp[0]
  }

  private async createPhoneMFA(
    user: User,
    strategy: Strategy
  ): Promise<string> {
    const insertLine = { value: user.phone, user_id: user.id, strategy }
    const resp: string[] = await database(this.tableName)
      .insert(insertLine)
      .returning('id')
    return resp[0]
  }

  private async createGaMfa(user: User, strategy: Strategy): Promise<string> {
    const secret = authenticator.generateSecret()
    const insertLine = {
      value: secret,
      user_id: user.id,
      strategy,
      is_enable: true,
    }
    await database(this.tableName).insert(insertLine).returning('id')
    return authenticator.keyuri(user.email, env.app.name, secret)
  }
}
