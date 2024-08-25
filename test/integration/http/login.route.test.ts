import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql'
import { RedisContainer, StartedRedisContainer } from '@testcontainers/redis'
import casual from 'casual'
import { Knex } from 'knex'
import request from 'supertest'

import * as env from '../../../src/config/enviroment_config'
import { getRedis, RedisClient } from '../../../src/core/config/cache'
import * as kafka from '../../../src/core/config/kafka'
import { Strategy } from '../../../src/core/entities/strategy'
import { CacheCode } from '../../../src/core/providers/mfa_code.repository'
import server from '../../../src/presentation/http/server'
import { insertMfaIntoDatabase } from '../../fixtures/multi_factor_authentication'
import { setupDB } from '../../fixtures/setup_migration'
import { insertUserIntoDatabase, UserFixture } from '../../fixtures/user'
import { insertUserInfoIntoDatabase } from '../../fixtures/user_info'

describe('Login Route', () => {
  let userFixture: UserFixture
  let redis: RedisClient
  let database: Knex
  let pgSqlContainer: StartedPostgreSqlContainer
  let redisContainer: StartedRedisContainer

  beforeAll(async () => {
    pgSqlContainer = await new PostgreSqlContainer().start()
    redisContainer = await new RedisContainer().start()
    database = await setupDB(pgSqlContainer)
    userFixture = await insertUserIntoDatabase(database)
    redis = getRedis(redisContainer.getConnectionUrl())
    if (!redis.isReady) {
      await redis.connect()
    }
    const jwtSecret = casual.uuid
    jest.spyOn(env, 'getEnv').mockImplementation(() => ({
      app: {
        enviroment: 'test',
        jwtSecret,
        name: casual.name,
        port: 5000,
      },
      database: {
        database: pgSqlContainer.getDatabase(),
        host: pgSqlContainer.getHost(),
        password: pgSqlContainer.getPassword(),
        port: pgSqlContainer.getPort(),
        user: pgSqlContainer.getUsername(),
      },
      broker: {
        url: '',
      },
      cache: {
        url: redisContainer.getConnectionUrl(),
      },
      zipkin: {
        url: '',
      },
    }))
    jest.spyOn(kafka, 'getKafka').mockImplementation(() => {
      return {
        producer: jest.fn().mockReturnValue({
          send: jest.fn(),
          connect: jest.fn(),
        }),
        admin: jest.fn(),
        logger: jest.fn(),
        consumer: jest.fn(),
      }
    })
  })

  afterAll(async () => {
    await redis.disconnect()
    await pgSqlContainer.stop()
    await redisContainer.stop()
  })

  beforeEach(async () => {
    await database('multi_factor_authentication').del()
    await database('user_info').del()
    redis.del('*')
  })

  it('should succeed when login when user does NOT have MFA', async function () {
    const response = await request(server).post('/login').send({
      email: userFixture.input.email,
      password: userFixture.input.password,
    })
    expect(response.status).toEqual(200)
    expect(response.body.id).toEqual(userFixture.output.id)
    expect(response.body.name).toEqual(userFixture.input.name)
    expect(response.body.email).toEqual(userFixture.input.email)
    expect(response.body.token).not.toBeNull()
  }, 100000)

  it('should fail when login with worng password', async function () {
    const notPassword = casual.password
    const response = await request(server).post('/login').send({
      email: userFixture.input.email,
      password: notPassword,
    })
    expect(response.status).toEqual(500)
    expect(response.text).toEqual('WRONG_CREDENTIAL')
  })

  it('should succeed when login with MFA=EMAIL', async function () {
    await insertMfaIntoDatabase(database, {
      userId: userFixture.output.id,
      strategy: Strategy.EMAIL,
    })
    const responseGetChoice = await request(server).post('/login').send({
      email: userFixture.input.email,
      password: userFixture.input.password,
    })
    expect(responseGetChoice.status).toEqual(200)
    expect(responseGetChoice.body.hash).not.toBeNull()
    expect(responseGetChoice.body.strategyList).toEqual([Strategy.EMAIL])
    const responseChoose = await request(server).post('/mfa/choose').send({
      hash: responseGetChoice.body.hash,
      strategy: responseGetChoice.body.strategyList[0],
    })
    expect(responseChoose.status).toEqual(200)
    expect(responseChoose.body.hash).not.toBeNull()
    const cacheContent = await redis.get(responseChoose.body.hash)
    if (!cacheContent) {
      throw new Error('Something went wrong when persisting on cache')
    }
    const cacheParsed = JSON.parse(cacheContent) as CacheCode
    const responseCode = await request(server).post('/mfa/code').send({
      hash: responseChoose.body.hash,
      code: cacheParsed.code,
    })
    expect(responseCode.status).toEqual(200)
    expect(responseCode.body.id).toEqual(userFixture.output.id)
    expect(responseCode.body.name).toEqual(userFixture.input.name)
    expect(responseCode.body.email).toEqual(userFixture.input.email)
    expect(responseCode.body.token).not.toBeNull()
  })

  it('should succeed when login with MFA=PHONE', async function () {
    const phone = casual.phone
    await insertMfaIntoDatabase(database, {
      userId: userFixture.output.id,
      strategy: Strategy.PHONE,
    })
    await insertUserInfoIntoDatabase(database, {
      userId: userFixture.output.id,
      type: 'phone',
      value: phone,
    })
    const responseGetChoice = await request(server).post('/login').send({
      email: userFixture.input.email,
      password: userFixture.input.password,
    })
    expect(responseGetChoice.status).toEqual(200)
    expect(responseGetChoice.body.hash).not.toBeNull()
    expect(responseGetChoice.body.strategyList).toEqual([Strategy.PHONE])
    const responseChoose = await request(server).post('/mfa/choose').send({
      hash: responseGetChoice.body.hash,
      strategy: responseGetChoice.body.strategyList[0],
    })
    expect(responseChoose.status).toEqual(200)
    expect(responseChoose.body.hash).not.toBeNull()
    const cacheContent = await redis.get(responseChoose.body.hash)
    if (!cacheContent) {
      throw new Error('Something went wrong when persisting on cache')
    }
    const cacheParsed = JSON.parse(cacheContent) as CacheCode
    const responseCode = await request(server).post('/mfa/code').send({
      hash: responseChoose.body.hash,
      code: cacheParsed.code,
    })
    expect(responseCode.status).toEqual(200)
    expect(responseCode.body.id).toEqual(userFixture.output.id)
    expect(responseCode.body.name).toEqual(userFixture.input.name)
    expect(responseCode.body.email).toEqual(userFixture.input.email)
    expect(responseCode.body.token).not.toBeNull()
  })

  it('should succeed refresh token when user does NOT have MFA', async function () {
    const responseLogin = await request(server).post('/login').send({
      email: userFixture.input.email,
      password: userFixture.input.password,
    })
    expect(responseLogin.status).toEqual(200)
    expect(responseLogin.body.id).toEqual(userFixture.output.id)
    expect(responseLogin.body.name).toEqual(userFixture.input.name)
    expect(responseLogin.body.email).toEqual(userFixture.input.email)
    expect(responseLogin.body.token).not.toBeNull()
    const responseRefresh = await request(server)
      .get(`/login/refresh/${responseLogin.body.token}`)
      .set('Authorization', `Bearer ${responseLogin.body.token}`)
      .send()

    expect(responseRefresh.status).toEqual(200)
    expect(responseRefresh.body.id).toEqual(userFixture.output.id)
    expect(responseRefresh.body.name).toEqual(userFixture.input.name)
    expect(responseRefresh.body.email).toEqual(userFixture.input.email)
    expect(responseRefresh.body.token).not.toBeNull()
    const cacheData = await redis.get(responseLogin.body.token)
    expect(cacheData).not.toBeNull()
  })
})
