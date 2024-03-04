import { genSaltSync, hash } from 'bcrypt'
import casual from 'casual'
import { mock, instance, when, verify, deepEqual, anything } from 'ts-mockito'

import database from '../../../src/core/config/database'
import {
  UserInfoRow,
  UserRepository,
  UserRow,
} from '../../../src/core/providers/user.repository'
import { PasswordService } from '../../../src/core/services/password.service'
import { CreatingUserErrorsTypes } from '../../../src/core/usecases/driven/creating_user.driven'
import { FindingUserErrorsTypes } from '../../../src/core/usecases/driven/finding_user.driven'
import { deviceIdGenerator, passwordGenerator } from '../../fixtures/generators'
import { insertUserIntoDatabase } from '../../fixtures/user'
import { insertUserInfoIntoDatabase } from '../../fixtures/user_info'

describe('user repository', () => {
  const mockName = casual.full_name
  const mockEmail = casual.email.toLowerCase()
  const mockPassword = passwordGenerator()

  it('should succeed when finding a user by email and password', async () => {
    const userFixture = await insertUserIntoDatabase(
      mockName,
      mockEmail,
      mockPassword
    )
    const userId = userFixture.output.id
    const mockPasswordService: PasswordService = mock(PasswordService)
    when(
      mockPasswordService.compare(mockPassword, userFixture.output.passwordHash)
    ).thenResolve(true)
    const emailService: PasswordService = instance(mockPasswordService)

    const userRepository = new UserRepository(emailService)
    const result = await userRepository.findUserByEmailAndPassword(
      mockEmail,
      mockPassword
    )
    expect(result.email).toEqual(mockEmail)
    expect(result.name).toEqual(mockName)
    expect(result.id).toEqual(userId)
    verify(
      mockPasswordService.compare(mockPassword, userFixture.output.passwordHash)
    ).once()
    await database('user').where('id', userId).del()
  })
  it('should fail when finding a user by email and password', async () => {
    const mockPasswordService: PasswordService = mock(PasswordService)
    when(mockPasswordService.compare(mockPassword, anything())).thenResolve(
      false
    )
    const emailService: PasswordService = instance(mockPasswordService)

    const userRepository = new UserRepository(emailService)
    try {
      await userRepository.findUserByEmailAndPassword(mockEmail, mockPassword)
    } catch (error) {
      expect((error as Error).message).toEqual(
        FindingUserErrorsTypes.USER_NOT_FOUND
      )
      verify(mockPasswordService.compare(mockPassword, anything())).never()
    }
  })
  it('should succeed when finding a user by id', async () => {
    const userFixture = await insertUserIntoDatabase(
      mockName,
      mockEmail,
      mockPassword
    )
    const userId = userFixture.output.id
    await insertUserInfoIntoDatabase(userId, 'phone', casual.phone)
    await insertUserInfoIntoDatabase(userId, 'deviceId', casual.uuid)
    await insertUserInfoIntoDatabase(userId, 'ga', casual.uuid)

    const mockPasswordService: PasswordService = mock(PasswordService)
    when(
      mockPasswordService.compare(mockPassword, userFixture.output.passwordHash)
    ).thenResolve()
    const emailService: PasswordService = instance(mockPasswordService)

    const userRepository = new UserRepository(emailService)
    const result = await userRepository.findById(userId)
    expect(result.email).toEqual(mockEmail)
    expect(result.name).toEqual(mockName)
    expect(result.id).toEqual(userId)
    verify(
      mockPasswordService.compare(mockPassword, userFixture.output.passwordHash)
    ).never()
    await database('user_info').where('user_id', userId).del()
    await database('user').where('id', userId).del()
  })
  it('should fail when finding a user by id', async () => {
    const mockPasswordService: PasswordService = mock(PasswordService)
    when(mockPasswordService.compare(mockPassword, anything())).thenReject()
    const emailService: PasswordService = instance(mockPasswordService)

    const userRepository = new UserRepository(emailService)
    try {
      await userRepository.findById(casual.uuid)
    } catch (error) {
      expect((error as Error).message).toEqual(
        FindingUserErrorsTypes.USER_NOT_FOUND
      )
      verify(mockPasswordService.compare(mockPassword, anything())).never()
    }
  })
  it('should succeed when creating a user', async () => {
    const mockHash = await hash(mockPassword, genSaltSync(12))
    const mockPasswordService: PasswordService = mock(PasswordService)
    when(
      mockPasswordService.checkEntropy(
        mockPassword,
        deepEqual([mockName, mockEmail])
      )
    ).thenReturn(true)
    when(mockPasswordService.generateHash(mockPassword)).thenResolve(mockHash)
    const emailService: PasswordService = instance(mockPasswordService)

    const userRepository = new UserRepository(emailService)
    const result = await userRepository.create(
      mockName,
      mockEmail,
      mockPassword
    )
    expect(typeof result).toBe('string')
    verify(
      mockPasswordService.checkEntropy(
        mockPassword,
        deepEqual([mockName, mockEmail])
      )
    ).once()
    verify(mockPasswordService.generateHash(mockPassword)).once()
    await database('user').where('id', result).del()
  })
  it('should fail when creating a user with weak password', async () => {
    const mockHash = await hash(mockPassword, genSaltSync(12))
    const mockPasswordService: PasswordService = mock(PasswordService)
    when(
      mockPasswordService.checkEntropy(
        mockPassword,
        deepEqual([mockName, mockEmail])
      )
    ).thenReturn(false)
    when(mockPasswordService.generateHash(mockPassword)).thenResolve(mockHash)
    const emailService: PasswordService = instance(mockPasswordService)

    const userRepository = new UserRepository(emailService)
    try {
      await userRepository.create(mockName, mockEmail, mockPassword)
    } catch (error) {
      expect((error as Error).message).toEqual(
        CreatingUserErrorsTypes.PASSWORD_LOW_ENTROPY
      )
      verify(
        mockPasswordService.checkEntropy(
          mockPassword,
          deepEqual([mockName, mockEmail])
        )
      ).once()
      verify(mockPasswordService.generateHash(mockPassword)).never()
    }
  })
  it('should succeed when updating a user name', async () => {
    const userFixture = await insertUserIntoDatabase()
    const newName = casual.full_name

    const mockPasswordService: PasswordService = mock(PasswordService)
    const passwordService: PasswordService = instance(mockPasswordService)

    const userRepository = new UserRepository(passwordService)
    const result = await userRepository.updateName(
      userFixture.output.id,
      newName
    )

    expect(result).toEqual(true)
    const response = await database<UserRow>('user')
      .select('*')
      .where('id', userFixture.output.id)
    expect(response[0].name).toEqual(newName)
    await database('user').where('id', userFixture.output.id).del()
  })
  it('should succeed when updating a user email', async () => {
    const userFixture = await insertUserIntoDatabase()
    const newEmail = casual.email.toLowerCase()

    const mockPasswordService: PasswordService = mock(PasswordService)
    const passwordService: PasswordService = instance(mockPasswordService)

    const userRepository = new UserRepository(passwordService)
    const result = await userRepository.updateEmail(
      userFixture.output.id,
      newEmail
    )

    expect(result).toEqual(true)
    const response = await database<UserRow>('user')
      .select('*')
      .where('id', userFixture.output.id)
    expect(response[0].email).toEqual(newEmail)
    await database('user').where('id', userFixture.output.id).del()
  })
  it('should succeed when updating a user phone when exist', async () => {
    const userFixture = await insertUserIntoDatabase()
    const userInfoFixture = await insertUserInfoIntoDatabase(
      userFixture.output.id,
      'phone',
      casual.phone
    )
    const newPhone = casual.phone

    const mockPasswordService: PasswordService = mock(PasswordService)
    const passwordService: PasswordService = instance(mockPasswordService)

    const userRepository = new UserRepository(passwordService)
    const result = await userRepository.updatePhone(
      userFixture.output.id,
      newPhone
    )

    expect(result).toEqual(true)
    const response = await database<UserInfoRow>('user_info')
      .select('*')
      .where('id', userInfoFixture.output.id)
    expect(response[0].value).toEqual(newPhone)
    await database('user_info').where('id', userInfoFixture.output.id).del()
    await database('user').where('id', userFixture.output.id).del()
  })
  it('should succeed when updating a user phone when not exist', async () => {
    const userFixture = await insertUserIntoDatabase()
    const newPhone = casual.phone

    const mockPasswordService: PasswordService = mock(PasswordService)
    const passwordService: PasswordService = instance(mockPasswordService)

    const userRepository = new UserRepository(passwordService)
    const result = await userRepository.updatePhone(
      userFixture.output.id,
      newPhone
    )

    expect(result).toEqual(true)
    const response = await database<UserInfoRow>('user_info')
      .select('*')
      .where('user_id', userFixture.output.id)
    expect(response[0].value).toEqual(newPhone)
    await database('user_info').where('user_id', userFixture.output.id).del()
    await database('user').where('id', userFixture.output.id).del()
  })
  it('should succeed when updating a user device when exist', async () => {
    const userFixture = await insertUserIntoDatabase()
    const userInfoFixture = await insertUserInfoIntoDatabase(
      userFixture.output.id,
      'deviceId',
      casual.uuid
    )
    const newDeviceId = deviceIdGenerator()

    const mockPasswordService: PasswordService = mock(PasswordService)
    const passwordService: PasswordService = instance(mockPasswordService)

    const userRepository = new UserRepository(passwordService)
    const result = await userRepository.updateDevice(
      userFixture.output.id,
      newDeviceId
    )

    expect(result).toEqual(true)
    const response = await database<UserInfoRow>('user_info')
      .select('*')
      .where('id', userInfoFixture.output.id)
    expect(response[0].value).toEqual(newDeviceId)
    await database('user_info').where('id', userInfoFixture.output.id).del()
    await database('user').where('id', userFixture.output.id).del()
  })
  it('should succeed when updating a user device when not exist', async () => {
    const userFixture = await insertUserIntoDatabase()
    const newDeviceId = deviceIdGenerator()

    const mockPasswordService: PasswordService = mock(PasswordService)
    const passwordService: PasswordService = instance(mockPasswordService)

    const userRepository = new UserRepository(passwordService)
    const result = await userRepository.updateDevice(
      userFixture.output.id,
      newDeviceId
    )

    expect(result).toEqual(true)
    const response = await database<UserInfoRow>('user_info')
      .select('*')
      .where('type', 'deviceId')
      .andWhere('value', newDeviceId)
    expect(response[0].value).toEqual(newDeviceId)
    await database('user_info').where('id', response[0].id).del()
    await database('user').where('id', userFixture.output.id).del()
  })
  it('should succeed when updating a user GA when exist', async () => {
    const userFixture = await insertUserIntoDatabase()
    const userInfoFixture = await insertUserInfoIntoDatabase(
      userFixture.output.id,
      'ga',
      casual.uuid
    )
    const newGA = casual.uuid

    const mockPasswordService: PasswordService = mock(PasswordService)
    const passwordService: PasswordService = instance(mockPasswordService)

    const userRepository = new UserRepository(passwordService)
    const result = await userRepository.updateGA(userFixture.output.id, newGA)

    expect(result).toEqual(true)
    const response = await database<UserInfoRow>('user_info')
      .select('*')
      .where('id', userInfoFixture.output.id)
    expect(response[0].value).toEqual(newGA)
    await database('user_info').where('id', userInfoFixture.output.id).del()
    await database('user').where('id', userFixture.output.id).del()
  })
  it('should succeed when updating a user GA when not exist', async () => {
    const userFixture = await insertUserIntoDatabase()
    const newGA = casual.uuid

    const mockPasswordService: PasswordService = mock(PasswordService)
    const passwordService: PasswordService = instance(mockPasswordService)

    const userRepository = new UserRepository(passwordService)
    const result = await userRepository.updateGA(userFixture.output.id, newGA)

    expect(result).toEqual(true)
    const response = await database<UserInfoRow>('user_info')
      .select('*')
      .where('user_id', userFixture.output.id)
    expect(response[0].value).toEqual(newGA)
    await database('user_info').where('user_id', userFixture.output.id).del()
    await database('user').where('id', userFixture.output.id).del()
  })

  it('should succeed when listing all users', async () => {
    const userFixture = await insertUserIntoDatabase()

    const mockPasswordService: PasswordService = mock(PasswordService)
    const passwordService: PasswordService = instance(mockPasswordService)

    const userRepository = new UserRepository(passwordService)
    const result = await userRepository.getAll()

    expect(result.length).toEqual(2)
    expect(result[0].id).toEqual(userFixture.output.id)
    await database('user_info').where('user_id', userFixture.output.id).del()
    await database('user').where('id', userFixture.output.id).del()
  })
})
