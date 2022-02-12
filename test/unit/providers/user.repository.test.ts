import { genSaltSync, hash } from 'bcrypt'
import { expect } from 'chai'
import faker from 'faker'
import { mock, instance, when, verify, deepEqual } from 'ts-mockito'

import database from '../../../src/core/config/database'
import {
  UserInfoRow,
  UserRepository,
  UserRow,
} from '../../../src/core/providers/user.repository'
import { PasswordService } from '../../../src/core/services/password.service'
import { CreatingUserErrorsTypes } from '../../../src/core/usecases/driven/creating_user.driven'
import { FindingUserErrorsTypes } from '../../../src/core/usecases/driven/finding_user.driven'

describe('user repository', async () => {
  const mockName = faker.name.findName()
  const mockEmail = faker.internet.email(mockName.split(' ')[0])
  const mockPassword = faker.internet.password(16)
  const salt = genSaltSync(12)
  const mockHash = await hash(mockPassword, salt)

  it('should succeed when finding a user by email and password', async () => {
    const row: Array<{ id: string }> = await database('user')
      .insert({
        name: mockName,
        email: mockEmail,
        password_hash: mockHash,
      })
      .returning('id')
    const userId = row[0].id
    const mockPasswordService: PasswordService = mock(PasswordService)
    when(mockPasswordService.compare(mockPassword, mockHash)).thenResolve(true)
    const emailService: PasswordService = instance(mockPasswordService)

    const userRepository = new UserRepository(emailService)
    const result = await userRepository.findUserByEmailAndPassword(
      mockEmail,
      mockPassword
    )
    expect(result.email).to.be.eql(mockEmail)
    expect(result.name).to.be.eql(mockName)
    expect(result.id).to.be.eql(userId)
    verify(mockPasswordService.compare(mockPassword, mockHash)).once()
    await database('user').where('id', userId).del()
  })
  it('should fail when finding a user by email and password', async () => {
    const mockPasswordService: PasswordService = mock(PasswordService)
    when(mockPasswordService.compare(mockPassword, mockHash)).thenResolve(false)
    const emailService: PasswordService = instance(mockPasswordService)

    const userRepository = new UserRepository(emailService)
    try {
      await userRepository.findUserByEmailAndPassword(mockEmail, mockPassword)
    } catch (error) {
      expect((error as Error).message).to.eql(
        FindingUserErrorsTypes.DATABASE_DEPENDECY_ERROR
      )
      verify(mockPasswordService.compare(mockPassword, mockHash)).never()
    }
  })
  it('should succeed when finding a user by id', async () => {
    const row: Array<{ id: string }> = await database('user')
      .insert({
        name: mockName,
        email: mockEmail,
        password_hash: mockHash,
      })
      .returning('id')
    const userId = row[0].id

    const mockPasswordService: PasswordService = mock(PasswordService)
    when(mockPasswordService.compare(mockPassword, mockHash)).thenResolve()
    const emailService: PasswordService = instance(mockPasswordService)

    const userRepository = new UserRepository(emailService)
    const result = await userRepository.findById(userId)
    expect(result.email).to.be.eql(mockEmail)
    expect(result.name).to.be.eql(mockName)
    expect(result.id).to.be.eql(userId)
    verify(mockPasswordService.compare(mockPassword, mockHash)).never()
    await database('user').where('id', userId).del()
  })
  it('should fail when finding a user by id', async () => {
    const mockPasswordService: PasswordService = mock(PasswordService)
    when(mockPasswordService.compare(mockPassword, mockHash)).thenReject()
    const emailService: PasswordService = instance(mockPasswordService)

    const userRepository = new UserRepository(emailService)
    try {
      await userRepository.findById(faker.datatype.uuid())
    } catch (error) {
      expect((error as Error).message).to.eql(
        FindingUserErrorsTypes.DATABASE_DEPENDECY_ERROR
      )
      verify(mockPasswordService.compare(mockPassword, mockHash)).never()
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
  it('should fail when creating a user', async () => {
    const mockPasswordService: PasswordService = mock(PasswordService)
    when(
      mockPasswordService.checkEntropy(
        mockPassword,
        deepEqual([mockName, mockEmail])
      )
    ).thenReturn(false)
    const emailService: PasswordService = instance(mockPasswordService)

    const userRepository = new UserRepository(emailService)
    try {
      await userRepository.create(mockName, mockEmail, mockPassword)
    } catch (error) {
      expect((error as Error).message).to.eql(
        CreatingUserErrorsTypes.DATABASE_DEPENDECY_ERROR
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
    const row: Array<{ id: string }> = await database('user')
      .insert({
        name: faker.name.findName(),
        email: faker.internet.email(),
        password_hash: faker.datatype.uuid(),
      })
      .returning('id')
    const newName = faker.name.findName()

    const mockPasswordService: PasswordService = mock(PasswordService)
    const passwordService: PasswordService = instance(mockPasswordService)

    const userRepository = new UserRepository(passwordService)
    const result = await userRepository.updateName(row[0].id, newName)

    expect(result).to.be.true
    const response = await database<UserRow>('user')
      .select('*')
      .where('id', row[0].id)
    expect(response[0].name).to.be.equal(newName)
    await database('user').where('id', row[0].id).del()
  })
  it('should succeed when updating a user email', async () => {
    const row: Array<{ id: string }> = await database('user')
      .insert({
        name: faker.name.findName(),
        email: faker.internet.email(),
        password_hash: faker.datatype.uuid(),
      })
      .returning('id')
    const newEmail = faker.internet.email()

    const mockPasswordService: PasswordService = mock(PasswordService)
    const passwordService: PasswordService = instance(mockPasswordService)

    const userRepository = new UserRepository(passwordService)
    const result = await userRepository.updateEmail(row[0].id, newEmail)

    expect(result).to.be.true
    const response = await database<UserRow>('user')
      .select('*')
      .where('id', row[0].id)
    expect(response[0].email).to.be.equal(newEmail)
    await database('user').where('id', row[0].id).del()
  })
  it('should succeed when updating a user phone when exist', async () => {
    const rowUser: Array<{ id: string }> = await database('user')
      .insert({
        name: faker.name.findName(),
        email: faker.internet.email(),
        password_hash: faker.datatype.uuid(),
      })
      .returning('id')
    const rowUserInfo: Array<{ id: string }> = await database<UserInfoRow>(
      'user_info'
    )
      .insert({
        user_id: rowUser[0].id,
        type: 'phone',
        value: faker.phone.phoneNumber(),
      })
      .returning('id')
    const newPhone = faker.phone.phoneNumber()

    const mockPasswordService: PasswordService = mock(PasswordService)
    const passwordService: PasswordService = instance(mockPasswordService)

    const userRepository = new UserRepository(passwordService)
    const result = await userRepository.updatePhone(rowUser[0].id, newPhone)

    expect(result).to.be.true
    const response = await database<UserInfoRow>('user_info')
      .select('*')
      .where('id', rowUserInfo[0].id)
    expect(response[0].value).to.be.equal(newPhone)
    await database('user_info').where('id', rowUserInfo[0].id).del()
    await database('user').where('id', rowUser[0].id).del()
  })
  it('should succeed when updating a user phone when not exist', async () => {
    const rowUser: Array<{ id: string }> = await database('user')
      .insert({
        name: faker.name.findName(),
        email: faker.internet.email(),
        password_hash: faker.datatype.uuid(),
      })
      .returning('id')
    const newPhone = faker.phone.phoneNumber()

    const mockPasswordService: PasswordService = mock(PasswordService)
    const passwordService: PasswordService = instance(mockPasswordService)

    const userRepository = new UserRepository(passwordService)
    const result = await userRepository.updatePhone(rowUser[0].id, newPhone)

    expect(result).to.be.true
    const response = await database<UserInfoRow>('user_info')
      .select('*')
      .where('user_id', rowUser[0].id)
    expect(response[0].value).to.be.equal(newPhone)
    await database('user_info').where('user_id', rowUser[0].id).del()
    await database('user').where('id', rowUser[0].id).del()
  })
  it('should succeed when updating a user device when exist', async () => {
    const rowUser: Array<{ id: string }> = await database('user')
      .insert({
        name: faker.name.findName(),
        email: faker.internet.email(),
        password_hash: faker.datatype.uuid(),
      })
      .returning('id')
    const rowUserInfo: Array<{ id: string }> = await database<UserInfoRow>(
      'user_info'
    )
      .insert({
        user_id: rowUser[0].id,
        type: 'deviceId',
        value: faker.datatype.uuid(),
      })
      .returning('id')
    const newDeviceId = faker.datatype.uuid()

    const mockPasswordService: PasswordService = mock(PasswordService)
    const passwordService: PasswordService = instance(mockPasswordService)

    const userRepository = new UserRepository(passwordService)
    const result = await userRepository.updateDevice(rowUser[0].id, newDeviceId)

    expect(result).to.be.true
    const response = await database<UserInfoRow>('user_info')
      .select('*')
      .where('id', rowUserInfo[0].id)
    expect(response[0].value).to.be.equal(newDeviceId)
    await database('user_info').where('id', rowUserInfo[0].id).del()
    await database('user').where('id', rowUser[0].id).del()
  })
  it('should succeed when updating a user device when not exist', async () => {
    const rowUser: Array<{ id: string }> = await database('user')
      .insert({
        name: faker.name.findName(),
        email: faker.internet.email(),
        password_hash: faker.datatype.uuid(),
      })
      .returning('id')
    const newDeviceId = faker.datatype.uuid()

    const mockPasswordService: PasswordService = mock(PasswordService)
    const passwordService: PasswordService = instance(mockPasswordService)

    const userRepository = new UserRepository(passwordService)
    const result = await userRepository.updatePhone(rowUser[0].id, newDeviceId)

    expect(result).to.be.true
    const response = await database<UserInfoRow>('user_info')
      .select('*')
      .where('user_id', rowUser[0].id)
    expect(response[0].value).to.be.equal(newDeviceId)
    await database('user_info').where('user_id', rowUser[0].id).del()
    await database('user').where('id', rowUser[0].id).del()
  })
  it('should succeed when updating a user GA when exist', async () => {
    const rowUser: Array<{ id: string }> = await database('user')
      .insert({
        name: faker.name.findName(),
        email: faker.internet.email(),
        password_hash: faker.datatype.uuid(),
      })
      .returning('id')
    const rowUserInfo: Array<{ id: string }> = await database<UserInfoRow>(
      'user_info'
    )
      .insert({
        user_id: rowUser[0].id,
        type: 'ga',
        value: faker.datatype.uuid(),
      })
      .returning('id')
    const newGA = faker.datatype.uuid()

    const mockPasswordService: PasswordService = mock(PasswordService)
    const passwordService: PasswordService = instance(mockPasswordService)

    const userRepository = new UserRepository(passwordService)
    const result = await userRepository.updateGA(rowUser[0].id, newGA)

    expect(result).to.be.true
    const response = await database<UserInfoRow>('user_info')
      .select('*')
      .where('id', rowUserInfo[0].id)
    expect(response[0].value).to.be.equal(newGA)
    await database('user_info').where('id', rowUserInfo[0].id).del()
    await database('user').where('id', rowUser[0].id).del()
  })
  it('should succeed when updating a user GA when not exist', async () => {
    const rowUser: Array<{ id: string }> = await database('user')
      .insert({
        name: faker.name.findName(),
        email: faker.internet.email(),
        password_hash: faker.datatype.uuid(),
      })
      .returning('id')
    const newGA = faker.datatype.uuid()

    const mockPasswordService: PasswordService = mock(PasswordService)
    const passwordService: PasswordService = instance(mockPasswordService)

    const userRepository = new UserRepository(passwordService)
    const result = await userRepository.updatePhone(rowUser[0].id, newGA)

    expect(result).to.be.true
    const response = await database<UserInfoRow>('user_info')
      .select('*')
      .where('user_id', rowUser[0].id)
    expect(response[0].value).to.be.equal(newGA)
    await database('user_info').where('user_id', rowUser[0].id).del()
    await database('user').where('id', rowUser[0].id).del()
  })
})
