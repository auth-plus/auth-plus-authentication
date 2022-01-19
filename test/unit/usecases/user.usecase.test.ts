import { expect } from 'chai'
import faker from 'faker'
import { mock, instance, when, verify } from 'ts-mockito'

import { UserRepository } from '../../../src/core/providers/user.repository'
import {
  CreatingUser,
  CreatingUserErrors,
  CreatingUserErrorsTypes,
} from '../../../src/core/usecases/driven/creating_user.driven'
import { FindingUser } from '../../../src/core/usecases/driven/finding_user.driven'
import { UpdatingUser } from '../../../src/core/usecases/driven/updating_user.driven'
import { CreateUserErrorsTypes } from '../../../src/core/usecases/driver/create_user.driver'
import User from '../../../src/core/usecases/user.usecase'

describe('user usecase', function () {
  const id = faker.datatype.uuid()
  const name = faker.name.findName()
  const email = faker.internet.email(name.split(' ')[0])
  const password = faker.internet.password()

  it('should succeed when creating a user', async () => {
    const mockFindingUser: FindingUser = mock(UserRepository)
    const findingUser: FindingUser = instance(mockFindingUser)

    const mockCreatingUser: CreatingUser = mock(UserRepository)
    when(mockCreatingUser.create(name, email, password)).thenResolve(id)
    const creatingUser: CreatingUser = instance(mockCreatingUser)

    const mockUpdatingUser: UpdatingUser = mock(UserRepository)
    const updatingUser: UpdatingUser = instance(mockUpdatingUser)

    const testClass = new User(findingUser, creatingUser, updatingUser)
    const response = await testClass.create(name, email, password)

    verify(mockCreatingUser.create(name, email, password)).once()
    expect(response).to.eql(id)
  })

  it('should fail when creating a user by having error on database', async () => {
    const mockFindingUser: FindingUser = mock(UserRepository)
    const findingUser: FindingUser = instance(mockFindingUser)

    const mockCreatingUser: CreatingUser = mock(UserRepository)
    when(mockCreatingUser.create(name, email, password)).thenReject(
      new CreatingUserErrors(CreatingUserErrorsTypes.DATABASE_DEPENDECY_ERROR)
    )
    const creatingUser: CreatingUser = instance(mockCreatingUser)

    const mockUpdatingUser: UpdatingUser = mock(UserRepository)
    const updatingUser: UpdatingUser = instance(mockUpdatingUser)

    const testClass = new User(findingUser, creatingUser, updatingUser)
    try {
      await testClass.create(name, email, password)
    } catch (error) {
      expect((error as Error).message).to.eql(
        CreateUserErrorsTypes.DEPENDENCY_ERROR
      )
    }
    verify(mockCreatingUser.create(name, email, password)).once()
  })

  it('should fail when creating a user by a low entropy', async () => {
    const mockFindingUser: FindingUser = mock(UserRepository)
    const findingUser: FindingUser = instance(mockFindingUser)

    const mockCreatingUser: CreatingUser = mock(UserRepository)
    when(mockCreatingUser.create(name, email, password)).thenReject(
      new CreatingUserErrors(CreatingUserErrorsTypes.LOW_ENTROPY)
    )
    const creatingUser: CreatingUser = instance(mockCreatingUser)

    const mockUpdatingUser: UpdatingUser = mock(UserRepository)
    const updatingUser: UpdatingUser = instance(mockUpdatingUser)

    const testClass = new User(findingUser, creatingUser, updatingUser)
    try {
      await testClass.create(name, email, password)
    } catch (error) {
      expect((error as Error).message).to.eql(
        CreateUserErrorsTypes.SECURITY_LOW
      )
    }
    verify(mockCreatingUser.create(name, email, password)).once()
  })

  it('should fail when creating a user by having error not previous mapped', async () => {
    const mockFindingUser: FindingUser = mock(UserRepository)
    const findingUser: FindingUser = instance(mockFindingUser)

    const mockCreatingUser: CreatingUser = mock(UserRepository)
    when(mockCreatingUser.create(name, email, password)).thenReject(
      new Error('error not on plans')
    )
    const creatingUser: CreatingUser = instance(mockCreatingUser)

    const mockUpdatingUser: UpdatingUser = mock(UserRepository)
    const updatingUser: UpdatingUser = instance(mockUpdatingUser)

    const testClass = new User(findingUser, creatingUser, updatingUser)
    try {
      await testClass.create(name, email, password)
    } catch (error) {
      expect((error as Error).message).to.eql(
        CreateUserErrorsTypes.DEPENDENCY_ERROR
      )
    }
    verify(mockCreatingUser.create(name, email, password)).once()
  })
})
