import {
  CreatingMFA,
  CreatingMFAErrors,
  CreatingMFAErrorsTypes,
} from '../usecases/driven/creating_mfa.driven'
import database from '../config/database'
import {
  FindingMFA,
  FindingMFAErrors,
  FindingMFAErrorsTypes,
} from '../usecases/driven/finding_mfa.driven'
import { Strategy } from '../entities/strategy'
import { ValidatingMFA } from '../usecases/driven/validating_mfa.driven'

interface MFARow {
  id: string
  name: string
  user_id: string
  strategy: Strategy
}

export class MFARepository implements CreatingMFA, FindingMFA, ValidatingMFA {
  private tableName = 'multi_factor_authentication'

  async creatingStrategyForUser(
    name: string,
    userId: string,
    strategy: Strategy
  ): Promise<string> {
    try {
      const tuples = await database<MFARow>(this.tableName)
        .select('*')
        .where('user_id', userId)
      if (tuples.length > 0) {
        throw new CreatingMFAErrors(CreatingMFAErrorsTypes.ALREADY_EXIST)
      }
      const isnertLine: Partial<MFARow> = { name, user_id: userId, strategy }
      const resp: string[] = await database(this.tableName)
        .insert(isnertLine)
        .returning('id')
      return resp[0]
    } catch (error) {
      throw new CreatingMFAErrors(
        CreatingMFAErrorsTypes.DATABASE_DEPENDECY_ERROR
      )
    }
  }

  async findMFAByUserId(userId: string): Promise<Array<Strategy>> {
    try {
      const tuples = await database<MFARow>(this.tableName)
        .select('*')
        .where('user_id', userId)
        .andWhere('is_enable', true)
      return tuples.map((_) => _.strategy)
    } catch (error) {
      throw new FindingMFAErrors(FindingMFAErrorsTypes.DATABASE_DEPENDECY_ERROR)
    }
  }

  async validate(mfaId: string): Promise<boolean> {
    const updateRows = await database<MFARow>(this.tableName)
      .update('is_enable', true)
      .where('id', mfaId)
    return updateRows === 1
  }
}
