import { expect } from 'chai'
import faker from 'faker'
import { mock, instance, when, verify } from 'ts-mockito'

import { User } from '../../../src/core/entities/user'
import { OrganizationRepository } from '../../../src/core/providers/organization.repository'
import { UserRepository } from '../../../src/core/providers/user.repository'
import {
  AddingUserToOrganization,
  AddingUserToOrganizationErrors,
  AddingUserToOrganizationErrorsTypes,
} from '../../../src/core/usecases/driven/adding_user_to_organization.driven'
import {
  CreatingOrganization,
  CreatingOrganizationErrors,
  CreatingOrganizationErrorsTypes,
} from '../../../src/core/usecases/driven/creating_organization.driven'
import {
  FindingUser,
  FindingUserErrors,
  FindingUserErrorsTypes,
} from '../../../src/core/usecases/driven/finding_user.driven'
import { AddUserToOrganizationErrorsTypes } from '../../../src/core/usecases/driver/add_user_to_organization.driver'
import { CreateOrganizationErrorsTypes } from '../../../src/core/usecases/driver/create_organization.driver'
import Organization from '../../../src/core/usecases/organization.usecase'

describe('organization usecase', function () {
  const orgId = faker.datatype.uuid()
  const parentId = faker.datatype.uuid()
  const orgName = faker.name.findName()
  const userId = faker.datatype.uuid()
  const userName = faker.name.findName()
  const userEmail = faker.internet.email(userName.split(' ')[0])
  const relationId = faker.datatype.uuid()

  it('should succeed when creating a organization without parent', async () => {
    const mockCreatingOrganization: CreatingOrganization = mock(
      OrganizationRepository
    )
    when(mockCreatingOrganization.create(orgName, null)).thenResolve(orgId)
    const creatingOrganization: CreatingOrganization = instance(
      mockCreatingOrganization
    )

    const mockFindingUser: FindingUser = mock(UserRepository)
    const findingUser: FindingUser = instance(mockFindingUser)

    const mockAddingUserToOrganization: AddingUserToOrganization = mock(
      OrganizationRepository
    )
    const addingUserToOrganization: AddingUserToOrganization = instance(
      mockAddingUserToOrganization
    )

    const testClass = new Organization(
      creatingOrganization,
      findingUser,
      addingUserToOrganization
    )
    const response = await testClass.create(orgName, null)

    verify(mockCreatingOrganization.create(orgName, null)).once()
    expect(response).to.eql(orgId)
  })

  it('should succeed when creating a organization with parent', async () => {
    const mockCreatingOrganization: CreatingOrganization = mock(
      OrganizationRepository
    )
    when(mockCreatingOrganization.create(orgName, parentId)).thenResolve(orgId)
    const creatingOrganization: CreatingOrganization = instance(
      mockCreatingOrganization
    )

    const mockFindingUser: FindingUser = mock(UserRepository)
    const findingUser: FindingUser = instance(mockFindingUser)

    const mockAddingUserToOrganization: AddingUserToOrganization = mock(
      OrganizationRepository
    )
    const addingUserToOrganization: AddingUserToOrganization = instance(
      mockAddingUserToOrganization
    )

    const testClass = new Organization(
      creatingOrganization,
      findingUser,
      addingUserToOrganization
    )
    const response = await testClass.create(orgName, parentId)

    verify(mockCreatingOrganization.create(orgName, parentId)).once()
    expect(response).to.eql(orgId)
  })

  it('should fail when creating a organization with a inexistent parent', async () => {
    const mockCreatingOrganization: CreatingOrganization = mock(
      OrganizationRepository
    )
    when(mockCreatingOrganization.create(orgName, parentId)).thenReject(
      new CreatingOrganizationErrors(
        CreatingOrganizationErrorsTypes.PARENT_NOT_EXIST
      )
    )
    const creatingOrganization: CreatingOrganization = instance(
      mockCreatingOrganization
    )

    const mockFindingUser: FindingUser = mock(UserRepository)
    const findingUser: FindingUser = instance(mockFindingUser)

    const mockAddingUserToOrganization: AddingUserToOrganization = mock(
      OrganizationRepository
    )
    const addingUserToOrganization: AddingUserToOrganization = instance(
      mockAddingUserToOrganization
    )
    const testClass = new Organization(
      creatingOrganization,
      findingUser,
      addingUserToOrganization
    )
    try {
      await testClass.create(orgName, parentId)
    } catch (error) {
      expect((error as Error).message).to.eql(
        CreateOrganizationErrorsTypes.PARENT_NOT_EXIST
      )
    }
    verify(mockCreatingOrganization.create(orgName, parentId)).once()
  })

  it('should fail when creating a organization with cyclic relationship', async () => {
    const mockCreatingOrganization: CreatingOrganization = mock(
      OrganizationRepository
    )
    when(mockCreatingOrganization.create(orgName, parentId)).thenReject(
      new CreatingOrganizationErrors(
        CreatingOrganizationErrorsTypes.CYCLIC_RELATIONSHIP
      )
    )
    const creatingOrganization: CreatingOrganization = instance(
      mockCreatingOrganization
    )

    const mockFindingUser: FindingUser = mock(UserRepository)
    const findingUser: FindingUser = instance(mockFindingUser)

    const mockAddingUserToOrganization: AddingUserToOrganization = mock(
      OrganizationRepository
    )
    const addingUserToOrganization: AddingUserToOrganization = instance(
      mockAddingUserToOrganization
    )
    const testClass = new Organization(
      creatingOrganization,
      findingUser,
      addingUserToOrganization
    )
    try {
      await testClass.create(orgName, parentId)
    } catch (error) {
      expect((error as Error).message).to.eql(
        CreateOrganizationErrorsTypes.CYCLIC_RELATIONSHIP
      )
    }
    verify(mockCreatingOrganization.create(orgName, parentId)).once()
  })

  it('should fail when creating a organization by a database dependency error', async () => {
    const mockCreatingOrganization: CreatingOrganization = mock(
      OrganizationRepository
    )
    when(mockCreatingOrganization.create(orgName, parentId)).thenReject(
      new CreatingOrganizationErrors(
        CreatingOrganizationErrorsTypes.DATABASE_DEPENDENCY_ERROR
      )
    )
    const creatingOrganization: CreatingOrganization = instance(
      mockCreatingOrganization
    )

    const mockFindingUser: FindingUser = mock(UserRepository)
    const findingUser: FindingUser = instance(mockFindingUser)

    const mockAddingUserToOrganization: AddingUserToOrganization = mock(
      OrganizationRepository
    )
    const addingUserToOrganization: AddingUserToOrganization = instance(
      mockAddingUserToOrganization
    )
    const testClass = new Organization(
      creatingOrganization,
      findingUser,
      addingUserToOrganization
    )
    try {
      await testClass.create(orgName, parentId)
    } catch (error) {
      expect((error as Error).message).to.eql(
        CreateOrganizationErrorsTypes.DEPENDENCY_ERROR
      )
    }
    verify(mockCreatingOrganization.create(orgName, parentId)).once()
  })

  it('should fail when creating a organization by a unknow error', async () => {
    const mockCreatingOrganization: CreatingOrganization = mock(
      OrganizationRepository
    )
    when(mockCreatingOrganization.create(orgName, null)).thenReject(
      new Error('UKNOW_ERROR')
    )
    const creatingOrganization: CreatingOrganization = instance(
      mockCreatingOrganization
    )

    const mockFindingUser: FindingUser = mock(UserRepository)
    const findingUser: FindingUser = instance(mockFindingUser)

    const mockAddingUserToOrganization: AddingUserToOrganization = mock(
      OrganizationRepository
    )
    const addingUserToOrganization: AddingUserToOrganization = instance(
      mockAddingUserToOrganization
    )
    const testClass = new Organization(
      creatingOrganization,
      findingUser,
      addingUserToOrganization
    )
    try {
      await testClass.create(orgName, null)
    } catch (error) {
      expect((error as Error).message).to.eql(
        CreateOrganizationErrorsTypes.DEPENDENCY_ERROR
      )
    }
    verify(mockCreatingOrganization.create(orgName, null)).once()
  })

  it('should succeed when adding a user to organization', async () => {
    const mockCreatingOrganization: CreatingOrganization = mock(
      OrganizationRepository
    )
    const creatingOrganization: CreatingOrganization = instance(
      mockCreatingOrganization
    )

    const mockFindingUser: FindingUser = mock(UserRepository)
    when(mockFindingUser.findById(userId)).thenResolve({
      id: userId,
      name: userName,
      email: userEmail,
    } as User)
    const findingUser: FindingUser = instance(mockFindingUser)

    const mockAddingUserToOrganization: AddingUserToOrganization = mock(
      OrganizationRepository
    )
    when(mockAddingUserToOrganization.add(orgId, userId)).thenResolve(
      relationId
    )
    const addingUserToOrganization: AddingUserToOrganization = instance(
      mockAddingUserToOrganization
    )
    const testClass = new Organization(
      creatingOrganization,
      findingUser,
      addingUserToOrganization
    )
    const response = await testClass.add(orgId, userId)

    verify(mockFindingUser.findById(userId)).once()
    verify(mockAddingUserToOrganization.add(orgId, userId)).once()
    expect(response).to.eql(relationId)
  })

  it('should fail when adding a user to an inexistent organization', async () => {
    const mockCreatingOrganization: CreatingOrganization = mock(
      OrganizationRepository
    )
    const creatingOrganization: CreatingOrganization = instance(
      mockCreatingOrganization
    )

    const mockFindingUser: FindingUser = mock(UserRepository)
    when(mockFindingUser.findById(userId)).thenResolve({
      id: userId,
      name: userName,
      email: userEmail,
    } as User)
    const findingUser: FindingUser = instance(mockFindingUser)

    const mockAddingUserToOrganization: AddingUserToOrganization = mock(
      OrganizationRepository
    )
    when(mockAddingUserToOrganization.add(orgId, userId)).thenReject(
      new AddingUserToOrganizationErrors(
        AddingUserToOrganizationErrorsTypes.ORGANIZATION_NOT_FOUND
      )
    )
    const addingUserToOrganization: AddingUserToOrganization = instance(
      mockAddingUserToOrganization
    )
    const testClass = new Organization(
      creatingOrganization,
      findingUser,
      addingUserToOrganization
    )
    try {
      await testClass.add(orgId, userId)
    } catch (error) {
      expect((error as Error).message).to.eql(
        AddUserToOrganizationErrorsTypes.NOT_FOUND
      )
    }

    verify(mockFindingUser.findById(userId)).once()
    verify(mockAddingUserToOrganization.add(orgId, userId)).once()
  })

  it('should fail when adding a inexistent user to an organization', async () => {
    const mockCreatingOrganization: CreatingOrganization = mock(
      OrganizationRepository
    )
    const creatingOrganization: CreatingOrganization = instance(
      mockCreatingOrganization
    )

    const mockFindingUser: FindingUser = mock(UserRepository)
    when(mockFindingUser.findById(userId)).thenReject(
      new FindingUserErrors(FindingUserErrorsTypes.NOT_FOUND)
    )
    const findingUser: FindingUser = instance(mockFindingUser)

    const mockAddingUserToOrganization: AddingUserToOrganization = mock(
      OrganizationRepository
    )
    const addingUserToOrganization: AddingUserToOrganization = instance(
      mockAddingUserToOrganization
    )
    const testClass = new Organization(
      creatingOrganization,
      findingUser,
      addingUserToOrganization
    )
    try {
      await testClass.add(orgId, userId)
    } catch (error) {
      expect((error as Error).message).to.eql(
        AddUserToOrganizationErrorsTypes.NOT_FOUND
      )
    }

    verify(mockFindingUser.findById(userId)).once()
    verify(mockAddingUserToOrganization.add(orgId, userId)).never()
  })

  it('should fail to add user to an organization by an unknow error when finding user', async () => {
    const mockCreatingOrganization: CreatingOrganization = mock(
      OrganizationRepository
    )
    const creatingOrganization: CreatingOrganization = instance(
      mockCreatingOrganization
    )

    const mockFindingUser: FindingUser = mock(UserRepository)
    when(mockFindingUser.findById(userId)).thenReject(new Error('UNKNOW_ERROR'))
    const findingUser: FindingUser = instance(mockFindingUser)

    const mockAddingUserToOrganization: AddingUserToOrganization = mock(
      OrganizationRepository
    )
    const addingUserToOrganization: AddingUserToOrganization = instance(
      mockAddingUserToOrganization
    )
    const testClass = new Organization(
      creatingOrganization,
      findingUser,
      addingUserToOrganization
    )
    try {
      await testClass.add(orgId, userId)
    } catch (error) {
      expect((error as Error).message).to.eql(
        AddUserToOrganizationErrorsTypes.DEPENDENCY_ERROR
      )
    }

    verify(mockFindingUser.findById(userId)).once()
    verify(mockAddingUserToOrganization.add(orgId, userId)).never()
  })

  it('should fail to add user to an organization by an unknow error when adding user', async () => {
    const mockCreatingOrganization: CreatingOrganization = mock(
      OrganizationRepository
    )
    const creatingOrganization: CreatingOrganization = instance(
      mockCreatingOrganization
    )

    const mockFindingUser: FindingUser = mock(UserRepository)
    when(mockFindingUser.findById(userId)).thenResolve({
      id: userId,
      name: userName,
      email: userEmail,
    } as User)
    const findingUser: FindingUser = instance(mockFindingUser)

    const mockAddingUserToOrganization: AddingUserToOrganization = mock(
      OrganizationRepository
    )
    when(mockAddingUserToOrganization.add(orgId, userId)).thenReject(
      new Error('UNKNOW_ERROR')
    )
    const addingUserToOrganization: AddingUserToOrganization = instance(
      mockAddingUserToOrganization
    )
    const testClass = new Organization(
      creatingOrganization,
      findingUser,
      addingUserToOrganization
    )
    try {
      await testClass.add(orgId, userId)
    } catch (error) {
      expect((error as Error).message).to.eql(
        AddUserToOrganizationErrorsTypes.DEPENDENCY_ERROR
      )
    }

    verify(mockFindingUser.findById(userId)).once()
    verify(mockAddingUserToOrganization.add(orgId, userId)).once()
  })

  it('should fail to add user to an organization by an database dependency error', async () => {
    const mockCreatingOrganization: CreatingOrganization = mock(
      OrganizationRepository
    )
    const creatingOrganization: CreatingOrganization = instance(
      mockCreatingOrganization
    )

    const mockFindingUser: FindingUser = mock(UserRepository)
    when(mockFindingUser.findById(userId)).thenResolve({
      id: userId,
      name: userName,
      email: userEmail,
    } as User)
    const findingUser: FindingUser = instance(mockFindingUser)

    const mockAddingUserToOrganization: AddingUserToOrganization = mock(
      OrganizationRepository
    )
    when(mockAddingUserToOrganization.add(orgId, userId)).thenReject(
      new AddingUserToOrganizationErrors(
        AddingUserToOrganizationErrorsTypes.DATABASE_DEPENDENCY_ERROR
      )
    )
    const addingUserToOrganization: AddingUserToOrganization = instance(
      mockAddingUserToOrganization
    )
    const testClass = new Organization(
      creatingOrganization,
      findingUser,
      addingUserToOrganization
    )
    try {
      await testClass.add(orgId, userId)
    } catch (error) {
      expect((error as Error).message).to.eql(
        AddUserToOrganizationErrorsTypes.DEPENDENCY_ERROR
      )
    }

    verify(mockFindingUser.findById(userId)).once()
    verify(mockAddingUserToOrganization.add(orgId, userId)).once()
  })

  it('should fail to add user to an organization when the user already is on organization', async () => {
    const mockCreatingOrganization: CreatingOrganization = mock(
      OrganizationRepository
    )
    const creatingOrganization: CreatingOrganization = instance(
      mockCreatingOrganization
    )

    const mockFindingUser: FindingUser = mock(UserRepository)
    when(mockFindingUser.findById(userId)).thenResolve({
      id: userId,
      name: userName,
      email: userEmail,
    } as User)
    const findingUser: FindingUser = instance(mockFindingUser)

    const mockAddingUserToOrganization: AddingUserToOrganization = mock(
      OrganizationRepository
    )
    when(mockAddingUserToOrganization.add(orgId, userId)).thenReject(
      new AddingUserToOrganizationErrors(
        AddingUserToOrganizationErrorsTypes.DUPLICATED_RELATIONSHIP
      )
    )
    const addingUserToOrganization: AddingUserToOrganization = instance(
      mockAddingUserToOrganization
    )
    const testClass = new Organization(
      creatingOrganization,
      findingUser,
      addingUserToOrganization
    )
    try {
      await testClass.add(orgId, userId)
    } catch (error) {
      expect((error as Error).message).to.eql(
        AddUserToOrganizationErrorsTypes.DUPLICATED_RELATIONSHIP
      )
    }

    verify(mockFindingUser.findById(userId)).once()
    verify(mockAddingUserToOrganization.add(orgId, userId)).once()
  })
})
