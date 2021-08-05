import { expect } from 'chai'
import { mock, instance, when, verify } from 'ts-mockito'

import { UserRepository } from '../../../src/core/providers/user.repository'
import {
  CreatingUser,
  CreatingUserErrors,
  CreatingUserErrorsTypes,
} from '../../../src/core/usecases/driven/creating_user.driven'
import { CreateUserErrorsTypes } from '../../../src/core/usecases/driver/create_user.driver'
import User from '../../../src/core/usecases/user.usecase'

describe('user usecase', function () {
  const id = 'any-id'
  const name = 'any-name'
  const email = 'any-email'
  const password = 'any-password'

  it('should succeed when creating a user', async () => {
    const mockCreatingUser: CreatingUser = mock(UserRepository)
    when(mockCreatingUser.create(name, email, password)).thenResolve(id)
    const creatingUser: CreatingUser = instance(mockCreatingUser)

    const testClass = new User(creatingUser)
    const response = await testClass.create(name, email, password)

    verify(mockCreatingUser.create(name, email, password)).once()
    expect(response).to.eql(id)
  })

  it('should fail when creating a user by having error on database', async () => {
    const mockCreatingUser: CreatingUser = mock(UserRepository)
    when(mockCreatingUser.create(name, email, password)).thenReject(
      new CreatingUserErrors(CreatingUserErrorsTypes.DATABASE_DEPENDECY_ERROR)
    )
    const creatingUser: CreatingUser = instance(mockCreatingUser)

    const testClass = new User(creatingUser)
    try {
      await testClass.create(name, email, password)
    } catch (error) {
      expect(error.message).to.eql(CreateUserErrorsTypes.DEPENDENCY_ERROR)
    }
    verify(mockCreatingUser.create(name, email, password)).once()
  })

  it('should fail when creating a user by a low entropy', async () => {
    const mockCreatingUser: CreatingUser = mock(UserRepository)
    when(mockCreatingUser.create(name, email, password)).thenReject(
      new CreatingUserErrors(CreatingUserErrorsTypes.LOW_ENTROPY)
    )
    const creatingUser: CreatingUser = instance(mockCreatingUser)

    const testClass = new User(creatingUser)
    try {
      await testClass.create(name, email, password)
    } catch (error) {
      expect(error.message).to.eql(CreateUserErrorsTypes.SECURITY_LOW)
    }
    verify(mockCreatingUser.create(name, email, password)).once()
  })

  it('should fail when creating a user by having error not previous mapped', async () => {
    const mockCreatingUser: CreatingUser = mock(UserRepository)
    when(mockCreatingUser.create(name, email, password)).thenReject(
      new Error('error not on plans')
    )
    const creatingUser: CreatingUser = instance(mockCreatingUser)

    const testClass = new User(creatingUser)
    try {
      await testClass.create(name, email, password)
    } catch (error) {
      expect(error.message).to.eql(CreateUserErrorsTypes.DEPENDENCY_ERROR)
    }
    verify(mockCreatingUser.create(name, email, password)).once()
  })
})
