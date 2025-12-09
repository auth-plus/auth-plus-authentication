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
import server from '../../../src/presentation/http/server'
import { insertMfaIntoDatabase } from '../../fixtures/multi_factor_authentication'
import { setupDB } from '../../fixtures/setup_migration'
import { insertUserIntoDatabase } from '../../fixtures/user'

describe('MFA Route', () => {
  let database: Knex,
    pgSqlContainer: StartedPostgreSqlContainer,
    redis: RedisClient,
    redisContainer: StartedRedisContainer,
    userId: string

  beforeAll(async () => {
    pgSqlContainer = await new PostgreSqlContainer('postgres:15.1').start()
    redisContainer = await new RedisContainer('redis:7.0.5').start()
    database = await setupDB(pgSqlContainer)
    const userFixture = await insertUserIntoDatabase(database)
    redis = await getRedis(redisContainer.getConnectionUrl())
    if (!redis.isReady) {
      await redis.connect()
    }
    userId = userFixture.output.id
    jest.spyOn(env, 'getEnv').mockImplementation(() => ({
      app: {
        enviroment: 'test',
        jwtSecret: casual.uuid,
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
    jest.spyOn(kafka, 'getKafka').mockImplementation(() => ({
      producer: jest.fn().mockReturnValue({
        send: jest.fn(),
        connect: jest.fn(),
      }),
      admin: jest.fn(),
      logger: jest.fn(),
      consumer: jest.fn(),
    }))
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

  it('should succeed when creating', async () => {
    const response = await request(server).post('/mfa').send({
        userId,
        strategy: Strategy.EMAIL,
      }),
      result = await database('multi_factor_authentication')
        .select('*')
        .where('user_id', userId)
    expect(response.status).toEqual(200)
    expect(result[0].is_enable).toEqual(false)
  })

  it('should succeed when validate', async () => {
    const mfaFixture = await insertMfaIntoDatabase(database, {
        userId,
        strategy: Strategy.EMAIL,
      }),
      mfaId = mfaFixture.output.id,
      response = await request(server)
        .post('/mfa/validate')
        .send({ id: mfaId }),
      result = await database('multi_factor_authentication')
        .select('*')
        .where('id', mfaId)
    expect(response.status).toEqual(200)
    expect(response.body.resp).toEqual(true)
    expect(result[0].is_enable).toEqual(true)
  })

  it('should succeed when list', async () => {
    await insertMfaIntoDatabase(database, {
      userId,
      strategy: Strategy.EMAIL,
    })
    await insertMfaIntoDatabase(database, {
      userId,
      strategy: Strategy.PHONE,
    })
    const response = await request(server).get(`/mfa/${userId}`).send()
    expect(response.status).toEqual(200)
    expect(response.body.resp).toEqual([Strategy.EMAIL, Strategy.PHONE])
  })
})
