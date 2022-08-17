import { genSaltSync, hash as hashFunc } from 'bcrypt'
import faker from 'faker'

import database from '../../src/core/config/database'

export async function insertUserIntoDatabase(
  name: string | null,
  email: string | null,
  password: string | null
) {
  if (!name) {
    name = faker.name.findName()
  }
  if (!email) {
    email = faker.internet.email(name.split(' ')[0])
  }
  if (!password) {
    password = faker.lorem.sentence()
  }
  const salt = genSaltSync(12)
  const hashPw = hashFunc(password, salt)
  const row: Array<{ id: string }> = await database('user')
    .insert({
      name: '',
      email: email,
      password_hash: hashPw,
    })
    .returning('id')
  return {
    input: {
      name,
      email,
      password,
    },
    output: {
      id: row[0].id,
      passwordHash: hashPw,
    },
  }
}
