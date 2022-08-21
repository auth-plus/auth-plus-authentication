import { genSaltSync, hash as hashFunc } from 'bcrypt'
import casual from 'casual'

import database from '../../src/core/config/database'

import { passwordGenerator } from './generators'

export type UserFixture = {
  input: {
    name: string
    email: string
    password: string
  }
  output: {
    id: string
    passwordHash: string
  }
}

export async function insertUserIntoDatabase(
  name = '',
  email = '',
  password = ''
): Promise<UserFixture> {
  if (!name) {
    name = casual.full_name
  }
  if (!email) {
    email = casual.email.toLowerCase()
  }
  if (!password) {
    password = passwordGenerator()
  }
  const salt = genSaltSync(12)
  const hashPw = await hashFunc(password, salt)
  const row: Array<{ id: string }> = await database('user')
    .insert({
      name,
      email,
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
