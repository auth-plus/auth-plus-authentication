import casual from 'casual'

import database from '../../src/core/config/database'

const possibleTypes = ['phone', 'ga', 'deviceId']

export async function insertUserInfoIntoDatabase(
  userId: string,
  type: string | null,
  value: string | null
) {
  if (!type) {
    type = casual.random_element(possibleTypes)
  }
  if (!value) {
    if (value === 'phone') {
      value = casual.phone
    } else {
      value = casual.uuid
    }
  }
  const row: Array<{ id: string }> = await database('user_info')
    .insert({
      value,
      type,
      user_id: userId,
    })
    .returning('id')
  return {
    input: {
      userId,
      type,
      value,
    },
    output: {
      id: row[0].id,
    },
  }
}
