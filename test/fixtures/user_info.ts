import casual from 'casual'
import { Knex } from 'knex'

const possibleTypes = ['phone', 'ga', 'deviceId']

interface UserInfoInput {
  userId: string
  type?: string
  value?: string
}

export async function insertUserInfoIntoDatabase(
  database: Knex,
  input?: UserInfoInput
) {
  const type = input?.type ?? casual.random_element(possibleTypes),
    value = (input?.value ?? type === 'phone') ? casual.phone : casual.uuid,
    row: { id: string }[] = await database('user_info')
      .insert({
        value,
        type,
        user_id: input?.userId,
      })
      .returning('id')
  return {
    input: {
      userId: input?.userId,
      type,
      value,
    },
    output: {
      id: row[0].id,
    },
  }
}
