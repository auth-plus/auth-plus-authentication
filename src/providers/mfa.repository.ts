import {
  CreatingMFA,
  CreatingMFAErrors,
  CreatingMFAErrorsTypes,
} from '../usecases/mfa/driven/creating_mfa.driven'
import database from '../config/knex'

export class MFARepository implements CreatingMFA {
  async creatingStrategyForUser(
    userId: string,
    strategy: string
  ): Promise<void> {
    try {
      await database('mfa').insert({ userId, strategy }).then()
    } catch (error) {
      throw new CreatingMFAErrors(CreatingMFAErrorsTypes.NOT_FOUND)
    }
  }
}
