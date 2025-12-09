import { genSaltSync, hash as hashFunc } from 'bcrypt'
import casual from 'casual'
import { Knex } from 'knex'

import { passwordGenerator } from './generators'

interface UserInput {
  name?: string
  email?: string
  password?: string
}

export interface UserFixture {
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
  database: Knex,
  input?: UserInput
): Promise<UserFixture> {
  const name = input?.name ?? casual.full_name,
    email = input?.email ?? casual.email.toLowerCase(),
    password = input?.password ?? passwordGenerator(),
    salt = genSaltSync(12),
    hashPw = await hashFunc(password, salt),
    row: { id: string }[] = await database('user')
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
