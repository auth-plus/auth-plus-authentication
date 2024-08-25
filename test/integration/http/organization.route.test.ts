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
import server from '../../../src/presentation/http/server'
import { insertOrgIntoDatabase } from '../../fixtures/organization'
import { setupDB } from '../../fixtures/setup_migration'
import { insertUserIntoDatabase, UserFixture } from '../../fixtures/user'

describe('Organization Route', () => {
  let managerFixture: UserFixture
  let token = ''
  let database: Knex
  let redis: RedisClient
  let pgSqlContainer: StartedPostgreSqlContainer
  let redisContainer: StartedRedisContainer

  beforeAll(async () => {
    pgSqlContainer = await new PostgreSqlContainer().start()
    redisContainer = await new RedisContainer().start()
    database = await setupDB(pgSqlContainer)
    managerFixture = await insertUserIntoDatabase(database)
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
    const response = await request(server).post('/login').send({
      email: managerFixture.input.email,
      password: managerFixture.input.password,
    })
    token = response.body.token
  })

  afterAll(async () => {
    await redis.disconnect()
    await pgSqlContainer.stop()
    await redisContainer.stop()
  })

  beforeEach(async () => {
    await database('organization').del()
    redis.del('*')
  })

  it('should succeed when creating a organization', async () => {
    const orgName = casual.full_name

    const response = await request(server)
      .post('/organization')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: orgName,
        parentId: null,
      })
    expect(response.status).toEqual(200)
    const tuples = await database('organization')
      .select('*')
      .where('id', response.body.id)
    const row = tuples[0]
    expect(row.name).toEqual(orgName)
    expect(row.parent_organization_id).toEqual(null)
    expect(row.is_enable).toEqual(true)
  })

  it('should succeed when updating a organization', async () => {
    const orgFixture = await insertOrgIntoDatabase(database)
    const newName = casual.full_name

    const response = await request(server)
      .patch('/organization')
      .set('Authorization', `Bearer ${token}`)
      .send({
        organizationId: orgFixture.output.id,
        name: newName,
        parentId: null,
      })
    expect(response.status).toEqual(200)
    const tuples = await database('organization')
      .select('*')
      .where('id', orgFixture.output.id)
    const row = tuples[0]
    expect(row.name).toEqual(newName)
  })
})
