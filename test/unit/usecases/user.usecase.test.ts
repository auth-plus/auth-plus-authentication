import casual from 'casual'
import { expect } from 'chai'
import { mock, instance, when, verify } from 'ts-mockito'

import { ShallowUser, User } from '../../../src/core/entities/user'
import { NotificationProvider } from '../../../src/core/providers/notification.provider'
import { UserRepository } from '../../../src/core/providers/user.repository'
import { CreatingSystemUser } from '../../../src/core/usecases/driven/creating_system_user.driven'
import {
  CreatingUser,
  CreatingUserErrors,
  CreatingUserErrorsTypes,
} from '../../../src/core/usecases/driven/creating_user.driven'
import { FindingUser } from '../../../src/core/usecases/driven/finding_user.driven'
import {
  UpdatingUser,
  UpdatingUserErrors,
  UpdatingUserErrorsTypes,
} from '../../../src/core/usecases/driven/updating_user.driven'
import { CreateUserErrorsTypes } from '../../../src/core/usecases/driver/create_user.driver'
import {
  UpdateUserErrorType,
  UpdateUserInput,
} from '../../../src/core/usecases/driver/update_user.driver'
import UserUsecase from '../../../src/core/usecases/user.usecase'
import {
  deviceIdGenerator,
  gaGenerator,
  passwordGenerator,
} from '../../fixtures/generators'

describe('user usecase', function () {
  const id = casual.uuid
  const name = casual.full_name
  const email = casual.email.toLowerCase()
  const password = passwordGenerator()

  const user: User = {
    id,
    name,
    email,
    info: {
      deviceId: null,
      googleAuth: null,
      phone: null,
    },
  }

  it('should succeed when creating a user', async () => {
    const mockFindingUser: FindingUser = mock(UserRepository)
    const findingUser: FindingUser = instance(mockFindingUser)

    const mockCreatingUser: CreatingUser = mock(UserRepository)
    when(mockCreatingUser.create(name, email, password)).thenResolve(id)
    const creatingUser: CreatingUser = instance(mockCreatingUser)

    const mockUpdatingUser: UpdatingUser = mock(UserRepository)
    const updatingUser: UpdatingUser = instance(mockUpdatingUser)

    const mockCreatingSystemUser: CreatingSystemUser =
      mock(NotificationProvider)
    when(mockCreatingSystemUser.create(id)).thenResolve()
    const creatingSystemUser: CreatingSystemUser = instance(
      mockCreatingSystemUser
    )

    const testClass = new UserUsecase(
      findingUser,
      creatingUser,
      updatingUser,
      creatingSystemUser
    )
    const response = await testClass.create(name, email, password)

    verify(mockCreatingUser.create(name, email, password)).once()
    expect(response).to.eql(id)
  })

  it('should fail when creating a user by a low entropy', async () => {
    const mockFindingUser: FindingUser = mock(UserRepository)
    const findingUser: FindingUser = instance(mockFindingUser)

    const mockCreatingUser: CreatingUser = mock(UserRepository)
    when(mockCreatingUser.create(name, email, password)).thenReject(
      new CreatingUserErrors(CreatingUserErrorsTypes.PASSWORD_LOW_ENTROPY)
    )
    const creatingUser: CreatingUser = instance(mockCreatingUser)

    const mockUpdatingUser: UpdatingUser = mock(UserRepository)
    const updatingUser: UpdatingUser = instance(mockUpdatingUser)

    const mockCreatingSystemUser: CreatingSystemUser =
      mock(NotificationProvider)
    const creatingSystemUser: CreatingSystemUser = instance(
      mockCreatingSystemUser
    )

    const testClass = new UserUsecase(
      findingUser,
      creatingUser,
      updatingUser,
      creatingSystemUser
    )
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

    const mockCreatingSystemUser: CreatingSystemUser =
      mock(NotificationProvider)
    const creatingSystemUser: CreatingSystemUser = instance(
      mockCreatingSystemUser
    )

    const testClass = new UserUsecase(
      findingUser,
      creatingUser,
      updatingUser,
      creatingSystemUser
    )
    try {
      await testClass.create(name, email, password)
    } catch (error) {
      expect((error as Error).message).to.eql(
        CreateUserErrorsTypes.DEPENDENCY_ERROR
      )
    }
    verify(mockCreatingUser.create(name, email, password)).once()
  })

  it('should succeed when updating a user', async () => {
    const newName = casual.full_name
    const deviceId = deviceIdGenerator()
    const gaToken = gaGenerator()
    const phone = casual.phone
    const newEmail = casual.email.toLowerCase()

    const mockFindingUser: FindingUser = mock(UserRepository)
    when(mockFindingUser.findById(id)).thenResolve(user)
    const findingUser: FindingUser = instance(mockFindingUser)

    const mockCreatingUser: CreatingUser = mock(UserRepository)
    const creatingUser: CreatingUser = instance(mockCreatingUser)

    const mockUpdatingUser: UpdatingUser = mock(UserRepository)
    when(mockUpdatingUser.updateName(id, newName)).thenResolve(true)
    when(mockUpdatingUser.updateEmail(id, newEmail)).thenResolve(true)
    when(mockUpdatingUser.updatePhone(id, phone)).thenResolve(true)
    when(mockUpdatingUser.updateDevice(id, deviceId)).thenResolve(true)
    when(mockUpdatingUser.updateGA(id, deviceId)).thenResolve(true)
    const updatingUser: UpdatingUser = instance(mockUpdatingUser)

    const mockCreatingSystemUser: CreatingSystemUser =
      mock(NotificationProvider)
    const creatingSystemUser: CreatingSystemUser = instance(
      mockCreatingSystemUser
    )

    const input: UpdateUserInput = {
      userId: id,
      name: newName,
      email,
      phone,
      deviceId,
      gaToken,
    }
    const testClass = new UserUsecase(
      findingUser,
      creatingUser,
      updatingUser,
      creatingSystemUser
    )
    const result = await testClass.update(input)

    expect(result).to.be.true
    verify(mockFindingUser.findById(id)).once()
  })

  it('should fail when updating a user', async () => {
    const newName = casual.full_name
    const deviceId = deviceIdGenerator()
    const gaToken = gaGenerator()
    const phone = casual.phone
    const newEmail = casual.email.toLowerCase()

    const mockFindingUser: FindingUser = mock(UserRepository)
    when(mockFindingUser.findById(id)).thenResolve(user)
    const findingUser: FindingUser = instance(mockFindingUser)

    const mockCreatingUser: CreatingUser = mock(UserRepository)
    const creatingUser: CreatingUser = instance(mockCreatingUser)

    const mockUpdatingUser: UpdatingUser = mock(UserRepository)
    when(mockUpdatingUser.updateName(id, newName)).thenResolve(true)
    when(mockUpdatingUser.updateEmail(id, newEmail)).thenResolve(true)
    when(mockUpdatingUser.updatePhone(id, phone)).thenResolve(true)
    when(mockUpdatingUser.updateDevice(id, deviceId)).thenResolve(true)
    when(mockUpdatingUser.updateGA(id, deviceId)).thenReject(
      new UpdatingUserErrors(UpdatingUserErrorsTypes.PASSWORD_WITH_LOW_ENTROPY)
    )
    const updatingUser: UpdatingUser = instance(mockUpdatingUser)

    const mockCreatingSystemUser: CreatingSystemUser =
      mock(NotificationProvider)
    const creatingSystemUser: CreatingSystemUser = instance(
      mockCreatingSystemUser
    )

    const input: UpdateUserInput = {
      userId: id,
      name: newName,
      phone,
      deviceId,
      gaToken,
    }
    const testClass = new UserUsecase(
      findingUser,
      creatingUser,
      updatingUser,
      creatingSystemUser
    )
    try {
      await testClass.update(input)
    } catch (error) {
      expect((error as Error).message).to.eql(
        UpdateUserErrorType.DEPENDENCY_ERROR
      )
    }

    verify(mockFindingUser.findById(id)).once()
  })

  it('should succeed when listing a user', async () => {
    const shallow: ShallowUser = {
      id: user.id,
      email: user.email,
      name: user.name,
    }
    const mockFindingUser: FindingUser = mock(UserRepository)
    when(mockFindingUser.getAll()).thenResolve([shallow])
    const findingUser: FindingUser = instance(mockFindingUser)

    const mockCreatingUser: CreatingUser = mock(UserRepository)
    const creatingUser: CreatingUser = instance(mockCreatingUser)

    const mockUpdatingUser: UpdatingUser = mock(UserRepository)
    const updatingUser: UpdatingUser = instance(mockUpdatingUser)

    const mockCreatingSystemUser: CreatingSystemUser =
      mock(NotificationProvider)
    const creatingSystemUser: CreatingSystemUser = instance(
      mockCreatingSystemUser
    )
    const testClass = new UserUsecase(
      findingUser,
      creatingUser,
      updatingUser,
      creatingSystemUser
    )

    const list = await testClass.list()
    expect(list.length).to.be.eq(1)
    expect(list[0]).to.be.deep.eq(shallow)
    verify(mockFindingUser.getAll()).once()
  })
})
