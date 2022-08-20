import { genSaltSync, hash } from 'bcrypt'
import { expect } from 'chai'
import faker from 'faker'
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
import { insertUserIntoDatabase } from '../../fixtures/user'
import { insertUserInfoIntoDatabase } from '../../fixtures/user_info'

describe('user repository', async () => {
  const mockName = faker.name.findName()
  const mockEmail = faker.internet.email(mockName.split(' ')[0])
  const mockPassword = faker.internet.password(16)
  const mockHash = await hash(mockPassword, genSaltSync(12))

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
    expect(result.email).to.be.eql(mockEmail)
    expect(result.name).to.be.eql(mockName)
    expect(result.id).to.be.eql(userId)
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
      expect((error as Error).message).to.eql(
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
    await insertUserInfoIntoDatabase(userId, 'phone', faker.phone.phoneNumber())
    await insertUserInfoIntoDatabase(userId, 'deviceId', faker.datatype.uuid())
    await insertUserInfoIntoDatabase(userId, 'ga', faker.datatype.uuid())

    const mockPasswordService: PasswordService = mock(PasswordService)
    when(
      mockPasswordService.compare(mockPassword, userFixture.output.passwordHash)
    ).thenResolve()
    const emailService: PasswordService = instance(mockPasswordService)

    const userRepository = new UserRepository(emailService)
    const result = await userRepository.findById(userId)
    expect(result.email).to.be.eql(mockEmail)
    expect(result.name).to.be.eql(mockName)
    expect(result.id).to.be.eql(userId)
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
      await userRepository.findById(faker.datatype.uuid())
    } catch (error) {
      expect((error as Error).message).to.eql(
        FindingUserErrorsTypes.USER_NOT_FOUND
      )
      verify(mockPasswordService.compare(mockPassword, anything())).never()
    }
  })
  it('should succeed when creating a user', async () => {
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
    expect(result).to.be.a('string')
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
      expect((error as Error).message).to.be.equal(
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
    const userFixture = await insertUserIntoDatabase(null, null, null)
    const newName = faker.name.findName()

    const mockPasswordService: PasswordService = mock(PasswordService)
    const passwordService: PasswordService = instance(mockPasswordService)

    const userRepository = new UserRepository(passwordService)
    const result = await userRepository.updateName(
      userFixture.output.id,
      newName
    )

    expect(result).to.be.true
    const response = await database<UserRow>('user')
      .select('*')
      .where('id', userFixture.output.id)
    expect(response[0].name).to.be.equal(newName)
    await database('user').where('id', userFixture.output.id).del()
  })
  it('should succeed when updating a user email', async () => {
    const userFixture = await insertUserIntoDatabase(null, null, null)
    const newEmail = faker.internet.email()

    const mockPasswordService: PasswordService = mock(PasswordService)
    const passwordService: PasswordService = instance(mockPasswordService)

    const userRepository = new UserRepository(passwordService)
    const result = await userRepository.updateEmail(
      userFixture.output.id,
      newEmail
    )

    expect(result).to.be.true
    const response = await database<UserRow>('user')
      .select('*')
      .where('id', userFixture.output.id)
    expect(response[0].email).to.be.equal(newEmail)
    await database('user').where('id', userFixture.output.id).del()
  })
  it('should succeed when updating a user phone when exist', async () => {
    const userFixture = await insertUserIntoDatabase(null, null, null)
    const userInfoFixture = await insertUserInfoIntoDatabase(
      userFixture.output.id,
      'phone',
      faker.phone.phoneNumber()
    )
    const newPhone = faker.phone.phoneNumber()

    const mockPasswordService: PasswordService = mock(PasswordService)
    const passwordService: PasswordService = instance(mockPasswordService)

    const userRepository = new UserRepository(passwordService)
    const result = await userRepository.updatePhone(
      userFixture.output.id,
      newPhone
    )

    expect(result).to.be.true
    const response = await database<UserInfoRow>('user_info')
      .select('*')
      .where('id', userInfoFixture.output.id)
    expect(response[0].value).to.be.equal(newPhone)
    await database('user_info').where('id', userInfoFixture.output.id).del()
    await database('user').where('id', userFixture.output.id).del()
  })
  it('should succeed when updating a user phone when not exist', async () => {
    const userFixture = await insertUserIntoDatabase(null, null, null)
    const newPhone = faker.phone.phoneNumber()

    const mockPasswordService: PasswordService = mock(PasswordService)
    const passwordService: PasswordService = instance(mockPasswordService)

    const userRepository = new UserRepository(passwordService)
    const result = await userRepository.updatePhone(
      userFixture.output.id,
      newPhone
    )

    expect(result).to.be.true
    const response = await database<UserInfoRow>('user_info')
      .select('*')
      .where('user_id', userFixture.output.id)
    expect(response[0].value).to.be.equal(newPhone)
    await database('user_info').where('user_id', userFixture.output.id).del()
    await database('user').where('id', userFixture.output.id).del()
  })
  it('should succeed when updating a user device when exist', async () => {
    const userFixture = await insertUserIntoDatabase(null, null, null)
    const userInfoFixture = await insertUserInfoIntoDatabase(
      userFixture.output.id,
      'deviceId',
      faker.datatype.uuid()
    )
    const newDeviceId = faker.datatype.uuid()

    const mockPasswordService: PasswordService = mock(PasswordService)
    const passwordService: PasswordService = instance(mockPasswordService)

    const userRepository = new UserRepository(passwordService)
    const result = await userRepository.updateDevice(
      userFixture.output.id,
      newDeviceId
    )

    expect(result).to.be.true
    const response = await database<UserInfoRow>('user_info')
      .select('*')
      .where('id', userInfoFixture.output.id)
    expect(response[0].value).to.be.equal(newDeviceId)
    await database('user_info').where('id', userInfoFixture.output.id).del()
    await database('user').where('id', userFixture.output.id).del()
  })
  it('should succeed when updating a user device when not exist', async () => {
    const userFixture = await insertUserIntoDatabase(null, null, null)
    const newDeviceId = faker.datatype.uuid()

    const mockPasswordService: PasswordService = mock(PasswordService)
    const passwordService: PasswordService = instance(mockPasswordService)

    const userRepository = new UserRepository(passwordService)
    const result = await userRepository.updateDevice(
      userFixture.output.id,
      newDeviceId
    )

    expect(result).to.be.true
    const response = await database<UserInfoRow>('user_info')
      .select('*')
      .where('type', 'deviceId')
      .andWhere('value', newDeviceId)
    expect(response[0].value).to.be.equal(newDeviceId)
    await database('user_info').where('id', response[0].id).del()
    await database('user').where('id', userFixture.output.id).del()
  })
  it('should succeed when updating a user GA when exist', async () => {
    const userFixture = await insertUserIntoDatabase(null, null, null)
    const userInfoFixture = await insertUserInfoIntoDatabase(
      userFixture.output.id,
      'ga',
      faker.datatype.uuid()
    )
    const newGA = faker.datatype.uuid()

    const mockPasswordService: PasswordService = mock(PasswordService)
    const passwordService: PasswordService = instance(mockPasswordService)

    const userRepository = new UserRepository(passwordService)
    const result = await userRepository.updateGA(userFixture.output.id, newGA)

    expect(result).to.be.true
    const response = await database<UserInfoRow>('user_info')
      .select('*')
      .where('id', userInfoFixture.output.id)
    expect(response[0].value).to.be.equal(newGA)
    await database('user_info').where('id', userInfoFixture.output.id).del()
    await database('user').where('id', userFixture.output.id).del()
  })
  it('should succeed when updating a user GA when not exist', async () => {
    const userFixture = await insertUserIntoDatabase(null, null, null)
    const newGA = faker.datatype.uuid()

    const mockPasswordService: PasswordService = mock(PasswordService)
    const passwordService: PasswordService = instance(mockPasswordService)

    const userRepository = new UserRepository(passwordService)
    const result = await userRepository.updateGA(userFixture.output.id, newGA)

    expect(result).to.be.true
    const response = await database<UserInfoRow>('user_info')
      .select('*')
      .where('user_id', userFixture.output.id)
    expect(response[0].value).to.be.equal(newGA)
    await database('user_info').where('user_id', userFixture.output.id).del()
    await database('user').where('id', userFixture.output.id).del()
  })
})
