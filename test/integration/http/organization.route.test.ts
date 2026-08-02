import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals'
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql'
import { ValkeyContainer, StartedValkeyContainer } from '@testcontainers/valkey'
import casual from 'casual'
import { Admin, Consumer, Kafka, Logger, Producer } from 'kafkajs'
import { Knex } from 'knex'
import request from 'supertest'

import * as env from '../../../src/config/enviroment_config'
import { CacheService } from '../../../src/config/cache'
import * as kafka from '../../../src/config/kafka'
import server from '../../../src/adapters/inbound/http/server'
import { insertOrgIntoDatabase } from '../../fixtures/organization'
import { setupDB } from '../../fixtures/setup_migration'
import { insertUserIntoDatabase, UserFixture } from '../../fixtures/user'

describe('Organization Route', () => {
  let database: Knex
  let managerFixture: UserFixture
  let pgSqlContainer: StartedPostgreSqlContainer
  let valkey: CacheService
  let valkeyContainer: StartedValkeyContainer
  let token = ''

  beforeAll(async () => {
    pgSqlContainer = await new PostgreSqlContainer('postgres:17.6').start()
    valkeyContainer = await new ValkeyContainer('valkey/valkey:8.0').start()
    database = await setupDB(pgSqlContainer)
    managerFixture = await insertUserIntoDatabase(database)
    valkey = CacheService.getInstance()
    await valkey.initialize(valkeyContainer.getConnectionUrl())
    const jwtSecret = casual.uuid
    jest.spyOn(env, 'getEnv').mockImplementation(() => ({
      app: {
        enviroment: 'test',
        jwtSecret,
        name: casual.name,
        port: 5000,
        logLevel: 'error',
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
        url: valkeyContainer.getConnectionUrl(),
      },
      zipkin: {
        url: '',
      },
      opentelemetry: {
        url: '',
      },
    }))
    jest.spyOn(kafka, 'getKafka').mockImplementation(
      () =>
        ({
          producer: jest.fn().mockReturnValue({
            send: jest.fn(),
            connect: jest.fn(),
          }) as unknown as Producer,
          admin: jest.fn() as unknown as Admin,
          logger: jest.fn() as unknown as Logger,
          consumer: jest.fn() as unknown as Consumer,
        }) as unknown as Kafka
    )
    const response = await request(server).post('/login').send({
      email: managerFixture.input.email,
      password: managerFixture.input.password,
    })
    token = response.body.token
  })

  afterAll(async () => {
    valkey.destroy()
    await pgSqlContainer.stop()
    await valkeyContainer.stop()
  })

  beforeEach(async () => {
    await database('organization').del()
    await valkey.flush()
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
    expect(row.parent_organization_id).toBeNull()
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
