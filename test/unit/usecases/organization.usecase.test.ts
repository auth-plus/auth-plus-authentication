import { expect } from 'chai'
import faker from 'faker'
import { mock, instance, when, verify } from 'ts-mockito'

import { OrganizationRepository } from '../../../src/core/providers/organization.repository'
import { UserRepository } from '../../../src/core/providers/user.repository'
import { AddingUserToOrganization } from '../../../src/core/usecases/driven/adding_user_to_organization.driven'
import {
  CreatingOrganization,
  CreatingOrganizationErrors,
  CreatingOrganizationErrorsTypes,
} from '../../../src/core/usecases/driven/creating_organization.driven'
import { FindingUser } from '../../../src/core/usecases/driven/finding_user.driven'
import { CreateOrganizationErrorsTypes } from '../../../src/core/usecases/driver/create_organization.driver'
import Organization from '../../../src/core/usecases/organization.usecase'

describe('organization usecase', function () {
  const id = faker.datatype.uuid()
  const parent_id = faker.datatype.uuid()
  const name = faker.name.findName()

  it('should succeed when creating a organization without parent', async () => {
    const mockCreatingOrganization: CreatingOrganization = mock(
      OrganizationRepository
    )
    when(mockCreatingOrganization.create(name, null)).thenResolve(id)
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
    const response = await testClass.create(name, null)

    verify(mockCreatingOrganization.create(name, null)).once()
    expect(response).to.eql(id)
  })

  it('should succeed when creating a organization with parent', async () => {
    const mockCreatingOrganization: CreatingOrganization = mock(
      OrganizationRepository
    )
    when(mockCreatingOrganization.create(name, parent_id)).thenResolve(id)
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
    const response = await testClass.create(name, parent_id)

    verify(mockCreatingOrganization.create(name, parent_id)).once()
    expect(response).to.eql(id)
  })
  it('should fail when creating a organization with a inexistent parent', async () => {
    const mockCreatingOrganization: CreatingOrganization = mock(
      OrganizationRepository
    )
    when(mockCreatingOrganization.create(name, parent_id)).thenReject(
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
      await testClass.create(name, parent_id)
    } catch (error) {
      expect((error as Error).message).to.eql(
        CreateOrganizationErrorsTypes.PARENT_NOT_EXIST
      )
    }
    verify(mockCreatingOrganization.create(name, parent_id)).once()
  })
  it('should fail when creating a organization with cyclic relationship', async () => {
    const mockCreatingOrganization: CreatingOrganization = mock(
      OrganizationRepository
    )
    when(mockCreatingOrganization.create(name, parent_id)).thenReject(
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
      await testClass.create(name, parent_id)
    } catch (error) {
      expect((error as Error).message).to.eql(
        CreateOrganizationErrorsTypes.CYCLIC_RELATIONSHIP
      )
    }
    verify(mockCreatingOrganization.create(name, parent_id)).once()
  })
  it('should fail when creating a organization by a unknow error', async () => {
    const mockCreatingOrganization: CreatingOrganization = mock(
      OrganizationRepository
    )
    when(mockCreatingOrganization.create(name, null)).thenReject(
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
      await testClass.create(name, null)
    } catch (error) {
      expect((error as Error).message).to.eql(
        CreateOrganizationErrorsTypes.DEPENDENCY_ERROR
      )
    }
    verify(mockCreatingOrganization.create(name, null)).once()
  })
  xit('should succeed when adding a user to organization')
  xit('should fail when adding a user to inexistent organization')
})
