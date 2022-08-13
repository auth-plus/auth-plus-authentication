import { authenticator } from 'otplib'

import database from '../config/database'
import { Mfa } from '../entities/mfa'
import { Strategy } from '../entities/strategy'
import { User } from '../entities/user'
import {
  CreatingMFA,
  CreatingMFAError,
  CreatingMFAErrorType,
} from '../usecases/driven/creating_mfa.driven'
import {
  FindingMFA,
  FindingMFAErrors,
  FindingMFAErrorsTypes,
} from '../usecases/driven/finding_mfa.driven'
import { UpdatingUser } from '../usecases/driven/updating_user.driven'
import { ValidatingMFA } from '../usecases/driven/validating_mfa.driven'

interface MFARow {
  id: string
  user_id: string
  strategy: Strategy
}

export class MFARepository implements CreatingMFA, FindingMFA, ValidatingMFA {
  constructor(private updatingUser: UpdatingUser) {}
  private tableName = 'multi_factor_authentication'

  async creatingStrategyForUser(user: User, strategy: Strategy): Promise<Mfa> {
    const tuples = await database<MFARow>(this.tableName)
      .select('*')
      .where('user_id', user.id)
      .andWhere('strategy', strategy)
      .andWhere('is_enable', true)
    if (tuples.length > 0) {
      throw new CreatingMFAError(CreatingMFAErrorType.MFA_ALREADY_EXIST)
    }
    if (strategy === Strategy.PHONE && user.info.phone == null) {
      throw new CreatingMFAError(CreatingMFAErrorType.MFA_INFO_NOT_EXIST)
    }
    const insertLine = { user_id: user.id, strategy }
    const resp: Array<{ id: string }> = await database(this.tableName)
      .insert(insertLine)
      .returning('id')
    if (strategy === Strategy.GA) {
      const secret = authenticator.generateSecret()
      await this.updatingUser.updateGA(user.id, secret)
    }
    return { id: resp[0].id, userId: user.id, strategy }
  }

  async findMfaListByUserId(
    userId: string
  ): Promise<{ id: string; strategy: Strategy }[]> {
    const tuples = await database<MFARow>(this.tableName)
      .select('*')
      .where('user_id', userId)
      .andWhere('is_enable', true)
    return tuples.map((_) => ({ id: _.id, strategy: _.strategy }))
  }

  async checkMfaExist(userId: string, strategy: Strategy): Promise<void> {
    const tuples = await database<MFARow>(this.tableName)
      .select('*')
      .where('user_id', userId)
      .andWhere('strategy', strategy)
      .andWhere('is_enable', true)
    if (tuples.length > 0) {
      throw new FindingMFAErrors(FindingMFAErrorsTypes.MFA_ALREADY_EXIST)
    }
  }

  async findMFAByUserIdAndStrategy(
    userId: string,
    strategy: Strategy
  ): Promise<{
    id: string
    userId: string
    strategy: Strategy
  }> {
    const tuples = await database<MFARow>(this.tableName)
      .select('*')
      .where('user_id', userId)
      .andWhere('strategy', strategy)
      .andWhere('is_enable', true)
    if (tuples.length === 0) {
      throw new FindingMFAErrors(FindingMFAErrorsTypes.MFA_NOT_FOUND)
    }
    return {
      id: tuples[0].id,
      userId: tuples[0].user_id,
      strategy: tuples[0].strategy,
    }
  }

  async validate(mfaId: string): Promise<boolean> {
    const updateRows = await database<MFARow>(this.tableName)
      .update('is_enable', true) //is created with default False
      .where('id', mfaId)
    return updateRows === 1
  }
}
