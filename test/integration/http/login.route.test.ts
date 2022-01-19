import { expect } from 'chai'
import faker from 'faker'
import request from 'supertest'

import cache from '../../../src/core/config/cache'
import database from '../../../src/core/config/database'
import { Strategy } from '../../../src/core/entities/strategy'
import { CacheCode } from '../../../src/core/providers/mfa_code.repository'
import server from '../../../src/presentation/http/server'

describe('Login Route', () => {
  const name = faker.name.findName()
  const email = faker.internet.email(name.split(' ')[0])
  let id: string

  before(async () => {
    const row: Array<{ id: string }> = await database('user')
      .insert({
        name,
        email,
        password_hash:
          '$2b$12$N5NbVrKwQYjDl6xFdqdYdunBnlbl1oyI32Uo5oIbpkaXoeG6fF1Ji',
      })
      .returning('id')
    id = row[0].id
  })

  after(async () => {
    await database('user').where('id', id).del()
  })

  it('should succeed when login when user does NOT have MFA', async function () {
    const response = await request(server).post('/login').send({
      email,
      password: '7061651770d7b3ad8fa96e7a8bc61447',
    })
    expect(response.status).to.be.equal(200)
    expect(response.body.id).to.be.equal(id)
    expect(response.body.name).to.be.equal(name)
    expect(response.body.email).to.be.equal(email)
    expect(response.body.token).to.be.not.null
  })

  it('should succeed when login when user does have MFA', async function () {
    const rowM: Array<{ id: string }> = await database(
      'multi_factor_authentication'
    )
      .insert({
        value: email,
        user_id: id,
        strategy: Strategy.EMAIL,
        is_enable: true,
      })
      .returning('id')
    const mfaid = rowM[0].id
    const responseGetChoice = await request(server).post('/login').send({
      email,
      password: '7061651770d7b3ad8fa96e7a8bc61447',
    })
    expect(responseGetChoice.status).to.be.equal(200)
    expect(responseGetChoice.body.hash).to.not.be.null
    expect(responseGetChoice.body.strategyList).to.be.deep.equal([
      Strategy.EMAIL,
    ])
    const responseChoose = await request(server).post('/mfa/choose').send({
      hash: responseGetChoice.body.hash,
      strategy: responseGetChoice.body.strategyList[0],
    })
    expect(responseChoose.status).to.be.equal(200)
    expect(responseChoose.body.hash).to.not.be.null
    const cacheContent = await cache.get(responseChoose.body.hash)
    if (!cacheContent) {
      throw new Error('Something went wrong when persisting on cache')
    }
    const cacheParsed = JSON.parse(cacheContent) as CacheCode
    const responseCode = await request(server).post('/mfa/code').send({
      hash: responseChoose.body.hash,
      code: cacheParsed.code,
    })
    expect(responseCode.status).to.be.equal(200)
    expect(responseCode.body.id).to.be.equal(id)
    expect(responseCode.body.name).to.be.equal(name)
    expect(responseCode.body.email).to.be.equal(email)
    expect(responseCode.body.token).to.be.not.null
    await database('multi_factor_authentication').where('id', mfaid).del()
  })
})
