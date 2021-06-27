import {
  CreatingMFA,
  CreatingMFAErrors,
  CreatingMFAErrorsTypes,
} from '../usecases/mfa/driven/creating_mfa.driven'
import database from '../config/knex'
import {
  FindingMFA,
  FindingMFAErrors,
  FindingMFAErrorsTypes,
} from '../usecases/login/driven/finding_mfa.driven'
import { Strategy } from '../entities/strategy'

interface MFARow {
  id: string
  name: string
  user_id: string
  strategy: Strategy
}

export class MFARepository implements CreatingMFA, FindingMFA {
  async creatingStrategyForUser(
    name: string,
    userId: string,
    strategy: Strategy
  ): Promise<void> {
    try {
      const isnertLine: Partial<MFARow> = { name, user_id: userId, strategy }
      await database('mfa').insert(isnertLine)
    } catch (error) {
      throw new CreatingMFAErrors(
        CreatingMFAErrorsTypes.DATABASE_DEPENDECY_ERROR
      )
    }
  }

  async findMFAByUserId(userId: string): Promise<Array<Strategy>> {
    try {
      const tuples = await database<MFARow>('mfa')
        .select('*')
        .where('user_id', userId)
      return tuples.map((_) => _.strategy)
    } catch (error) {
      throw new FindingMFAErrors(FindingMFAErrorsTypes.DATABASE_DEPENDECY_ERROR)
    }
  }
}
