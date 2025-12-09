import { Knex } from 'knex'

import { Strategy } from '../../src/core/entities/strategy'

interface MfaInput {
  userId: string
  strategy: Strategy
  isEnable?: boolean
}

export async function insertMfaIntoDatabase(database: Knex, input: MfaInput) {
  const row: { id: string }[] = await database('multi_factor_authentication')
    .insert({
      user_id: input?.userId,
      strategy: input?.strategy,
      is_enable: input?.isEnable ?? true,
    })
    .returning('id')
  return {
    input: {
      userId: input?.userId,
      strategy: input?.strategy,
      isEnable: input?.isEnable ?? true,
    },
    output: {
      id: row[0].id,
    },
  }
}
