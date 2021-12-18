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
import { FindingUser } from '../../../src/core/usecases/driven/finding_user.driven'
import { AddUserToOrganizationErrorsTypes } from '../../../src/core/usecases/driver/add_user_to_organization.driver'
import { CreateOrganizationErrorsTypes } from '../../../src/core/usecases/driver/create_organization.driver'
import Organization from '../../../src/core/usecases/organization.usecase'

describe('organization usecase', function () {
  const org_id = faker.datatype.uuid()
  const parent_id = faker.datatype.uuid()
  const org_name = faker.name.findName()
  const user_id = faker.datatype.uuid()
  const user_name = faker.name.findName()
  const user_email = faker.internet.email(user_name.split(' ')[0])

  it('should succeed when creating a organization without parent', async () => {
    const mockCreatingOrganization: CreatingOrganization = mock(
      OrganizationRepository
    )
    when(mockCreatingOrganization.create(org_name, null)).thenResolve(org_id)
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
    const response = await testClass.create(org_name, null)

    verify(mockCreatingOrganization.create(org_name, null)).once()
    expect(response).to.eql(org_id)
  })

  it('should succeed when creating a organization with parent', async () => {
    const mockCreatingOrganization: CreatingOrganization = mock(
      OrganizationRepository
    )
    when(mockCreatingOrganization.create(org_name, parent_id)).thenResolve(
      org_id
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
    const response = await testClass.create(org_name, parent_id)

    verify(mockCreatingOrganization.create(org_name, parent_id)).once()
    expect(response).to.eql(org_id)
  })
  it('should fail when creating a organization with a inexistent parent', async () => {
    const mockCreatingOrganization: CreatingOrganization = mock(
      OrganizationRepository
    )
    when(mockCreatingOrganization.create(org_name, parent_id)).thenReject(
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
      await testClass.create(org_name, parent_id)
    } catch (error) {
      expect((error as Error).message).to.eql(
        CreateOrganizationErrorsTypes.PARENT_NOT_EXIST
      )
    }
    verify(mockCreatingOrganization.create(org_name, parent_id)).once()
  })
  it('should fail when creating a organization with cyclic relationship', async () => {
    const mockCreatingOrganization: CreatingOrganization = mock(
      OrganizationRepository
    )
    when(mockCreatingOrganization.create(org_name, parent_id)).thenReject(
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
      await testClass.create(org_name, parent_id)
    } catch (error) {
      expect((error as Error).message).to.eql(
        CreateOrganizationErrorsTypes.CYCLIC_RELATIONSHIP
      )
    }
    verify(mockCreatingOrganization.create(org_name, parent_id)).once()
  })
  it('should fail when creating a organization by a unknow error', async () => {
    const mockCreatingOrganization: CreatingOrganization = mock(
      OrganizationRepository
    )
    when(mockCreatingOrganization.create(org_name, null)).thenReject(
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
      await testClass.create(org_name, null)
    } catch (error) {
      expect((error as Error).message).to.eql(
        CreateOrganizationErrorsTypes.DEPENDENCY_ERROR
      )
    }
    verify(mockCreatingOrganization.create(org_name, null)).once()
  })
  it('should succeed when adding a user to organization', async () => {
    const user_id = faker.datatype.uuid()
    const user_name = faker.name.findName()
    const user_email = faker.internet.email(user_name.split(' ')[0])
    const relation_id = faker.datatype.uuid()

    const mockCreatingOrganization: CreatingOrganization = mock(
      OrganizationRepository
    )
    const creatingOrganization: CreatingOrganization = instance(
      mockCreatingOrganization
    )

    const mockFindingUser: FindingUser = mock(UserRepository)
    when(mockFindingUser.findById(user_id)).thenResolve({
      id: user_id,
      name: user_name,
      email: user_email,
    } as User)
    const findingUser: FindingUser = instance(mockFindingUser)

    const mockAddingUserToOrganization: AddingUserToOrganization = mock(
      OrganizationRepository
    )
    when(mockAddingUserToOrganization.add(org_id, user_id)).thenResolve(
      relation_id
    )
    const addingUserToOrganization: AddingUserToOrganization = instance(
      mockAddingUserToOrganization
    )
    const testClass = new Organization(
      creatingOrganization,
      findingUser,
      addingUserToOrganization
    )
    const response = await testClass.add(org_id, user_id)

    verify(findingUser.findById(user_id)).once()
    verify(mockAddingUserToOrganization.add(org_id, user_id)).once()
    expect(response).to.eql(relation_id)
  })
  it('should fail when adding a user to an inexistent organization', async () => {
    const mockCreatingOrganization: CreatingOrganization = mock(
      OrganizationRepository
    )
    const creatingOrganization: CreatingOrganization = instance(
      mockCreatingOrganization
    )

    const mockFindingUser: FindingUser = mock(UserRepository)
    when(mockFindingUser.findById(user_id)).thenResolve({
      id: user_id,
      name: user_name,
      email: user_email,
    } as User)
    const findingUser: FindingUser = instance(mockFindingUser)

    const mockAddingUserToOrganization: AddingUserToOrganization = mock(
      OrganizationRepository
    )
    when(mockAddingUserToOrganization.add(org_id, user_id)).thenReject(
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
      await testClass.add(org_id, user_id)
    } catch (error) {
      expect((error as Error).message).to.eql(
        AddUserToOrganizationErrorsTypes.NOT_FOUND
      )
    }

    verify(findingUser.findById(user_id)).once()
    verify(mockAddingUserToOrganization.add(org_id, user_id)).once()
  })
})
