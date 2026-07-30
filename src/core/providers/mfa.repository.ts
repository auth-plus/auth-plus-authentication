import { Knex } from 'knex'

import { Mfa } from '../entities/mfa'
import { Strategy } from '../entities/strategy'
import { User } from '../entities/user'
import { TotpService } from '../services/totp.service'
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
import { logger } from '../../config/logger'

interface MFARow {
  id: string
  user_id: string
  strategy: Strategy
}

export class MFARepository implements CreatingMFA, FindingMFA, ValidatingMFA {
  constructor(
    private database: Knex,
    private updatingUser: UpdatingUser,
    private totpService: TotpService
  ) {}
  private tableName = 'multi_factor_authentication'

  async creatingStrategyForUser(user: User, strategy: Strategy): Promise<Mfa> {
    logger.debug({ table: this.tableName, action: 'creatingStrategyForUser', userId: user.id, strategy }, 'Database query: insert MFA strategy')
    const tuples = await this.database<MFARow>(this.tableName)
      .select('*')
      .where('user_id', user.id)
      .andWhere('strategy', strategy)

      .andWhere('is_enable', true)
    if (tuples.length > 0) {
      throw new CreatingMFAError(CreatingMFAErrorType.MFA_ALREADY_EXIST)
    }
    if (strategy === Strategy.GA && user.info.phone == null) {
      // Note: check user info here if applicable, but original code was using user.info.phone for Strategy.PHONE:
    }
    if (strategy === Strategy.PHONE && user.info.phone == null) {
      throw new CreatingMFAError(CreatingMFAErrorType.MFA_INFO_NOT_EXIST)
    }
    const insertLine = {
      user_id: user.id,
      strategy,
      //If GA, is_enable must be true. No way to validate the authenticity
      is_enable: strategy === Strategy.GA,
    }
    const resp: { id: string }[] = await this.database(this.tableName)
      .insert(insertLine)
      .returning('id')
    if (strategy === Strategy.GA) {
      const secret = this.totpService.secretGenerate()
      await this.updatingUser.updateGA(user.id, secret)
      return { id: resp[0].id, userId: user.id, strategy, secret }
    }
    return { id: resp[0].id, userId: user.id, strategy }
  }

  async findMfaListByUserId(
    userId: string
  ): Promise<{ id: string; strategy: Strategy }[]> {
    logger.debug({ table: this.tableName, action: 'findMfaListByUserId', userId }, 'Database query: select active MFA strategies')
    const tuples = await this.database<MFARow>(this.tableName)
      .select('*')
      .where('user_id', userId)
      .andWhere('is_enable', true)
    return tuples.map((_) => ({ id: _.id, strategy: _.strategy }))
  }

  async checkMfaExist(userId: string, strategy: Strategy): Promise<void> {
    const tuples = await this.database<MFARow>(this.tableName)
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
    logger.debug({ table: this.tableName, action: 'findMFAByUserIdAndStrategy', userId, strategy }, 'Database query: select MFA strategy by user and strategy')
    const tuples = await this.database<MFARow>(this.tableName)
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
    logger.debug({ table: this.tableName, action: 'validate', mfaId }, 'Database query: update MFA enable status')
    const updateRows = await this.database<MFARow>(this.tableName)
      .update('is_enable', true) // Is created with default False
      .where('id', mfaId)
    return updateRows === 1
  }
}
