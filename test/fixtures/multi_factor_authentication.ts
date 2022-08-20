import database from '../../src/core/config/database'
import { Strategy } from '../../src/core/entities/strategy'

export async function insertMfaIntoDatabase(
  userId: string,
  strategy: Strategy,
  isEnable = true
) {
  const row: Array<{ id: string }> = await database(
    'multi_factor_authentication'
  )
    .insert({
      user_id: userId,
      strategy: strategy,
      is_enable: isEnable,
    })
    .returning('id')
  return {
    input: {
      userId,
      strategy,
      isEnable,
    },
    output: {
      id: row[0].id,
    },
  }
}
