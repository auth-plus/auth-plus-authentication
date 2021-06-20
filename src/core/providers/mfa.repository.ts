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
  user_id: string
  strategy: Strategy
}

export class MFARepository implements CreatingMFA, FindingMFA {
  async creatingStrategyForUser(
    userId: string,
    strategy: string
  ): Promise<void> {
    try {
      await database('mfa').insert({ userId, strategy })
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
