import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql'
import casual from 'casual'
import { Kafka } from 'kafkajs'
import { Knex } from 'knex'

import * as kafka from '../../../src/core/config/kafka'
import { Strategy } from '../../../src/core/entities/strategy'
import { NotificationProvider } from '../../../src/core/providers/notification.provider'
import { SendingMfaCodeErrorsTypes } from '../../../src/core/usecases/driven/sending_mfa_code.driven'
import { SendingMfaHashErrorsTypes } from '../../../src/core/usecases/driven/sending_mfa_hash.driven'
import { setupDB } from '../../fixtures/setup_migration'
import { insertUserIntoDatabase } from '../../fixtures/user'
import { insertUserInfoIntoDatabase } from '../../fixtures/user_info'

describe('notification provider', () => {
  let client: Kafka, database: Knex, pgSqlContainer: StartedPostgreSqlContainer

  beforeAll(async () => {
    pgSqlContainer = await new PostgreSqlContainer('postgres:15.1').start()
    database = await setupDB(pgSqlContainer)
    jest.spyOn(kafka, 'getKafka').mockImplementation(() => ({
      producer: jest.fn().mockReturnValue({
        send: jest.fn(),
        connect: jest.fn(),
      }),
      admin: jest.fn(),
      logger: jest.fn(),
      consumer: jest.fn(),
    }))
    client = {
      producer: jest.fn().mockReturnValue({
        send: jest.fn(),
        connect: jest.fn(),
      }),
      admin: jest.fn(),
      logger: jest.fn(),
      consumer: jest.fn(),
    }
  })

  afterAll(async () => {
    await pgSqlContainer.stop()
  })

  beforeEach(async () => {
    await database('user_info').del()
    await database('user').del()
  })

  it('should succeed when sending email', async () => {
    const userResult = await insertUserIntoDatabase(database),
      mockCode = casual.array_of_digits(6).join(''),
      notificationProvider = new NotificationProvider(database, client),
      result = await notificationProvider.sendCodeByEmail(
        userResult.output.id,
        mockCode
      )
    expect(result).toBeUndefined()
  })

  it('should fail when not finding a user', async () => {
    const mockCode = casual.array_of_digits(6).join(''),
      notificationProvider = new NotificationProvider(database, client)
    await expect(
      notificationProvider.sendCodeByEmail(casual.uuid, mockCode)
    ).rejects.toThrow(SendingMfaCodeErrorsTypes.USER_EMAIL_NOT_FOUND)
  })

  it('should succeed when sending sms', async () => {
    const mockPhone = casual.phone,
      mockCode = casual.array_of_digits(6).join(''),
      userResult = await insertUserIntoDatabase(database)
    await insertUserInfoIntoDatabase(database, {
      userId: userResult.output.id,
      type: 'phone',
      value: mockPhone,
    })

    const notificationProvider = new NotificationProvider(database, client),
      result = await notificationProvider.sendCodeByPhone(
        userResult.output.id,
        mockCode
      )
    expect(result).toBeUndefined()
  })

  it('should fail when sending sms but not finding a user phone', async () => {
    const userResult = await insertUserIntoDatabase(database),
      mockCode = casual.array_of_digits(6).join(''),
      notificationProvider = new NotificationProvider(database, client)
    await expect(
      notificationProvider.sendCodeByPhone(userResult.output.id, mockCode)
    ).rejects.toThrow(SendingMfaCodeErrorsTypes.USER_PHONE_NOT_FOUND)
  })

  it('should fail when send code by GA', async () => {
    const mockCode = casual.array_of_digits(6).join(''),
      notificationProvider = new NotificationProvider(database, client)
    await expect(
      notificationProvider.sendCodeByStrategy(
        casual.uuid,
        mockCode,
        Strategy.GA
      )
    ).rejects.toThrow(SendingMfaCodeErrorsTypes.GA_SENT_CODE)
  })

  it('should fail when send hash by email but user not found', async () => {
    const mockCode = casual.array_of_digits(6).join(''),
      notificationProvider = new NotificationProvider(database, client)
    await expect(
      notificationProvider.sendMfaHashByEmail(casual.uuid, mockCode)
    ).rejects.toThrow(SendingMfaHashErrorsTypes.USER_EMAIL_HASH_NOT_FOUND)
  })

  it('should fail when send hash by Phone', async () => {
    const mockCode = casual.array_of_digits(6).join(''),
      notificationProvider = new NotificationProvider(database, client)
    await expect(
      notificationProvider.sendMfaHashByPhone(casual.uuid, mockCode)
    ).rejects.toThrow(SendingMfaHashErrorsTypes.USER_PHONE_HASH_NOT_FOUND)
  })
})
