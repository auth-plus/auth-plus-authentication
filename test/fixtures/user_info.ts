import faker from 'faker'

import database from '../../src/core/config/database'

const possibleTypes = ['phone', 'ga', 'deviceId']

export async function insertUserInfoIntoDatabase(
  userId: string,
  type: string | null,
  value: string | null
) {
  if (!type) {
    type = possibleTypes[Math.floor(Math.random() * possibleTypes.length)]
  }
  if (!value) {
    value = faker.lorem.sentence()
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
