import casual from 'casual'
import { mock, instance, when, verify } from 'ts-mockito'

import { Organization } from '../../../src/core/entities/organization'
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
  FindingOrganization,
  FindingOrganizationErrors,
  FindingOrganizationErrorsTypes,
} from '../../../src/core/usecases/driven/finding_organization.driven'
import {
  FindingUser,
  FindingUserErrors,
  FindingUserErrorsTypes,
} from '../../../src/core/usecases/driven/finding_user.driven'
import {
  UpdatingOrganization,
  UpdatingOrganizationErrorsTypes,
} from '../../../src/core/usecases/driven/updating_organization.driven'
import { AddUserToOrganizationErrorsTypes } from '../../../src/core/usecases/driver/add_user_to_organization.driver'
import { CreateOrganizationErrorsTypes } from '../../../src/core/usecases/driver/create_organization.driver'
import { UpdateOrganizationErrorsTypes } from '../../../src/core/usecases/driver/update_organization.driver'
import OrganizationUseCase from '../../../src/core/usecases/organization.usecase'

describe('organization usecase', function () {
  const orgId = casual.uuid
  const parentId = casual.uuid
  const orgName = casual.company_name
  const userId = casual.uuid
  const userName = casual.full_name
  const userEmail = casual.email.toLowerCase()
  const relationId = casual.uuid

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

    const mockUpdatingOrganization: UpdatingOrganization = mock(
      OrganizationRepository
    )
    const updatingOrganization: UpdatingOrganization = instance(
      mockUpdatingOrganization
    )

    const mockFindingOrganization: FindingOrganization = mock(
      OrganizationRepository
    )
    const findingOrganization: FindingOrganization = instance(
      mockFindingOrganization
    )

    const testClass = new OrganizationUseCase(
      creatingOrganization,
      findingUser,
      addingUserToOrganization,
      updatingOrganization,
      findingOrganization
    )
    const response = await testClass.create(orgName, null)

    verify(mockCreatingOrganization.create(orgName, null)).once()
    expect(response).toEqual(orgId)
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

    const mockUpdatingOrganization: UpdatingOrganization = mock(
      OrganizationRepository
    )
    const updatingOrganization: UpdatingOrganization = instance(
      mockUpdatingOrganization
    )

    const mockFindingOrganization: FindingOrganization = mock(
      OrganizationRepository
    )
    const findingOrganization: FindingOrganization = instance(
      mockFindingOrganization
    )
    const testClass = new OrganizationUseCase(
      creatingOrganization,
      findingUser,
      addingUserToOrganization,
      updatingOrganization,
      findingOrganization
    )
    const response = await testClass.create(orgName, parentId)

    verify(mockCreatingOrganization.create(orgName, parentId)).once()
    expect(response).toEqual(orgId)
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

    const mockUpdatingOrganization: UpdatingOrganization = mock(
      OrganizationRepository
    )
    const updatingOrganization: UpdatingOrganization = instance(
      mockUpdatingOrganization
    )

    const mockFindingOrganization: FindingOrganization = mock(
      OrganizationRepository
    )
    const findingOrganization: FindingOrganization = instance(
      mockFindingOrganization
    )

    const testClass = new OrganizationUseCase(
      creatingOrganization,
      findingUser,
      addingUserToOrganization,
      updatingOrganization,
      findingOrganization
    )
    await expect(testClass.create(orgName, parentId)).rejects.toThrow(
      CreateOrganizationErrorsTypes.PARENT_NOT_EXIST
    )
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

    const mockUpdatingOrganization: UpdatingOrganization = mock(
      OrganizationRepository
    )
    const updatingOrganization: UpdatingOrganization = instance(
      mockUpdatingOrganization
    )

    const mockFindingOrganization: FindingOrganization = mock(
      OrganizationRepository
    )
    const findingOrganization: FindingOrganization = instance(
      mockFindingOrganization
    )

    const testClass = new OrganizationUseCase(
      creatingOrganization,
      findingUser,
      addingUserToOrganization,
      updatingOrganization,
      findingOrganization
    )
    await expect(testClass.create(orgName, null)).rejects.toThrow(
      CreateOrganizationErrorsTypes.DEPENDENCY_ERROR
    )
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
    when(mockAddingUserToOrganization.addUser(orgId, userId)).thenResolve(
      relationId
    )
    const addingUserToOrganization: AddingUserToOrganization = instance(
      mockAddingUserToOrganization
    )

    const mockUpdatingOrganization: UpdatingOrganization = mock(
      OrganizationRepository
    )
    const updatingOrganization: UpdatingOrganization = instance(
      mockUpdatingOrganization
    )

    const mockFindingOrganization: FindingOrganization = mock(
      OrganizationRepository
    )
    const findingOrganization: FindingOrganization = instance(
      mockFindingOrganization
    )

    const testClass = new OrganizationUseCase(
      creatingOrganization,
      findingUser,
      addingUserToOrganization,
      updatingOrganization,
      findingOrganization
    )

    const response = await testClass.addUser(orgId, userId)

    verify(mockFindingUser.findById(userId)).once()
    verify(mockAddingUserToOrganization.addUser(orgId, userId)).once()
    expect(response).toEqual(relationId)
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
    when(mockAddingUserToOrganization.addUser(orgId, userId)).thenReject(
      new AddingUserToOrganizationErrors(
        AddingUserToOrganizationErrorsTypes.ORGANIZATION_NOT_FOUND
      )
    )
    const addingUserToOrganization: AddingUserToOrganization = instance(
      mockAddingUserToOrganization
    )

    const mockUpdatingOrganization: UpdatingOrganization = mock(
      OrganizationRepository
    )
    const updatingOrganization: UpdatingOrganization = instance(
      mockUpdatingOrganization
    )

    const mockFindingOrganization: FindingOrganization = mock(
      OrganizationRepository
    )
    const findingOrganization: FindingOrganization = instance(
      mockFindingOrganization
    )

    const testClass = new OrganizationUseCase(
      creatingOrganization,
      findingUser,
      addingUserToOrganization,
      updatingOrganization,
      findingOrganization
    )
    await expect(testClass.addUser(orgId, userId)).rejects.toThrow(
      AddUserToOrganizationErrorsTypes.NOT_FOUND
    )
    verify(mockFindingUser.findById(userId)).once()
    verify(mockAddingUserToOrganization.addUser(orgId, userId)).once()
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
      new FindingUserErrors(FindingUserErrorsTypes.USER_NOT_FOUND)
    )
    const findingUser: FindingUser = instance(mockFindingUser)

    const mockAddingUserToOrganization: AddingUserToOrganization = mock(
      OrganizationRepository
    )
    const addingUserToOrganization: AddingUserToOrganization = instance(
      mockAddingUserToOrganization
    )

    const mockUpdatingOrganization: UpdatingOrganization = mock(
      OrganizationRepository
    )
    const updatingOrganization: UpdatingOrganization = instance(
      mockUpdatingOrganization
    )

    const mockFindingOrganization: FindingOrganization = mock(
      OrganizationRepository
    )
    const findingOrganization: FindingOrganization = instance(
      mockFindingOrganization
    )

    const testClass = new OrganizationUseCase(
      creatingOrganization,
      findingUser,
      addingUserToOrganization,
      updatingOrganization,
      findingOrganization
    )
    await expect(testClass.addUser(orgId, userId)).rejects.toThrow(
      AddUserToOrganizationErrorsTypes.NOT_FOUND
    )
    verify(mockFindingUser.findById(userId)).once()
    verify(mockAddingUserToOrganization.addUser(orgId, userId)).never()
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

    const mockUpdatingOrganization: UpdatingOrganization = mock(
      OrganizationRepository
    )
    const updatingOrganization: UpdatingOrganization = instance(
      mockUpdatingOrganization
    )

    const mockFindingOrganization: FindingOrganization = mock(
      OrganizationRepository
    )
    const findingOrganization: FindingOrganization = instance(
      mockFindingOrganization
    )

    const testClass = new OrganizationUseCase(
      creatingOrganization,
      findingUser,
      addingUserToOrganization,
      updatingOrganization,
      findingOrganization
    )
    await expect(testClass.addUser(orgId, userId)).rejects.toThrow(
      AddUserToOrganizationErrorsTypes.DEPENDENCY_ERROR
    )
    verify(mockFindingUser.findById(userId)).once()
    verify(mockAddingUserToOrganization.addUser(orgId, userId)).never()
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
    when(mockAddingUserToOrganization.addUser(orgId, userId)).thenReject(
      new Error('UNKNOW_ERROR')
    )
    const addingUserToOrganization: AddingUserToOrganization = instance(
      mockAddingUserToOrganization
    )

    const mockUpdatingOrganization: UpdatingOrganization = mock(
      OrganizationRepository
    )
    const updatingOrganization: UpdatingOrganization = instance(
      mockUpdatingOrganization
    )

    const mockFindingOrganization: FindingOrganization = mock(
      OrganizationRepository
    )
    const findingOrganization: FindingOrganization = instance(
      mockFindingOrganization
    )

    const testClass = new OrganizationUseCase(
      creatingOrganization,
      findingUser,
      addingUserToOrganization,
      updatingOrganization,
      findingOrganization
    )
    await expect(testClass.addUser(orgId, userId)).rejects.toThrow(
      AddUserToOrganizationErrorsTypes.DEPENDENCY_ERROR
    )
    verify(mockFindingUser.findById(userId)).once()
    verify(mockAddingUserToOrganization.addUser(orgId, userId)).once()
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
    when(mockAddingUserToOrganization.addUser(orgId, userId)).thenReject(
      new AddingUserToOrganizationErrors(
        AddingUserToOrganizationErrorsTypes.DUPLICATED_RELATIONSHIP
      )
    )
    const addingUserToOrganization: AddingUserToOrganization = instance(
      mockAddingUserToOrganization
    )

    const mockUpdatingOrganization: UpdatingOrganization = mock(
      OrganizationRepository
    )
    const updatingOrganization: UpdatingOrganization = instance(
      mockUpdatingOrganization
    )

    const mockFindingOrganization: FindingOrganization = mock(
      OrganizationRepository
    )
    const findingOrganization: FindingOrganization = instance(
      mockFindingOrganization
    )

    const testClass = new OrganizationUseCase(
      creatingOrganization,
      findingUser,
      addingUserToOrganization,
      updatingOrganization,
      findingOrganization
    )
    await expect(testClass.addUser(orgId, userId)).rejects.toThrow(
      AddUserToOrganizationErrorsTypes.DUPLICATED_RELATIONSHIP
    )
    verify(mockFindingUser.findById(userId)).once()
    verify(mockAddingUserToOrganization.addUser(orgId, userId)).once()
  })

  it('should succeed when updating the name of organization without parent and childrens', async () => {
    const newName = casual.company_name
    const mockCreatingOrganization: CreatingOrganization = mock(
      OrganizationRepository
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

    const mockUpdatingOrganization: UpdatingOrganization = mock(
      OrganizationRepository
    )
    when(mockUpdatingOrganization.update(orgId, newName, null)).thenResolve()
    const updatingOrganization: UpdatingOrganization = instance(
      mockUpdatingOrganization
    )

    const mockFindingOrganization: FindingOrganization = mock(
      OrganizationRepository
    )
    when(mockFindingOrganization.findById(orgId)).thenResolve({
      id: orgId,
      name: orgName,
      parentOrganizationId: null,
    })
    const findingOrganization: FindingOrganization = instance(
      mockFindingOrganization
    )

    const testClass = new OrganizationUseCase(
      creatingOrganization,
      findingUser,
      addingUserToOrganization,
      updatingOrganization,
      findingOrganization
    )
    const result = await testClass.update(orgId, newName, null)

    expect(result).toEqual(true)
    verify(mockFindingOrganization.findById(orgId)).once()
    verify(mockUpdatingOrganization.update(orgId, newName, null)).once()
  })

  it('should fail when updating an inexistent organization', async () => {
    const newName = casual.company_name
    const mockCreatingOrganization: CreatingOrganization = mock(
      OrganizationRepository
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

    const mockUpdatingOrganization: UpdatingOrganization = mock(
      OrganizationRepository
    )
    const updatingOrganization: UpdatingOrganization = instance(
      mockUpdatingOrganization
    )

    const mockFindingOrganization: FindingOrganization = mock(
      OrganizationRepository
    )
    when(mockFindingOrganization.findById(orgId)).thenReject(
      new FindingOrganizationErrors(
        FindingOrganizationErrorsTypes.ORGANIZATION_NOT_FOUND
      )
    )
    const findingOrganization: FindingOrganization = instance(
      mockFindingOrganization
    )

    const testClass = new OrganizationUseCase(
      creatingOrganization,
      findingUser,
      addingUserToOrganization,
      updatingOrganization,
      findingOrganization
    )
    await expect(testClass.update(orgId, newName, null)).rejects.toThrow(
      UpdateOrganizationErrorsTypes.ORGANIZATION_NOT_FOUND
    )
    verify(mockFindingOrganization.findById(orgId)).once()
  })

  it('should fail when updating an organization by an unknown error', async () => {
    const newName = casual.company_name
    const mockCreatingOrganization: CreatingOrganization = mock(
      OrganizationRepository
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

    const mockUpdatingOrganization: UpdatingOrganization = mock(
      OrganizationRepository
    )
    const updatingOrganization: UpdatingOrganization = instance(
      mockUpdatingOrganization
    )

    const mockFindingOrganization: FindingOrganization = mock(
      OrganizationRepository
    )
    when(mockFindingOrganization.findById(orgId)).thenReject(
      new Error('UNKNOWN_ERROR')
    )
    const findingOrganization: FindingOrganization = instance(
      mockFindingOrganization
    )

    const testClass = new OrganizationUseCase(
      creatingOrganization,
      findingUser,
      addingUserToOrganization,
      updatingOrganization,
      findingOrganization
    )
    await expect(testClass.update(orgId, newName, null)).rejects.toThrow(
      UpdateOrganizationErrorsTypes.DEPENDENCY_ERROR
    )
    verify(mockFindingOrganization.findById(orgId)).once()
  })

  it('should succeed when changing parent (on same organization tree) from an organization with childrens', async () => {
    const rootOrganization: Organization = {
      id: casual.uuid,
      name: casual.company_name,
      parentOrganizationId: null,
    }
    const childOrg1: Organization = {
      id: casual.uuid,
      name: casual.company_name,
      parentOrganizationId: rootOrganization.id,
    }
    const childOrg2: Organization = {
      id: casual.uuid,
      name: casual.company_name,
      parentOrganizationId: rootOrganization.id,
    }
    const organization: Organization = {
      id: casual.uuid,
      name: casual.company_name,
      parentOrganizationId: childOrg1.id,
    }
    const mockCreatingOrganization: CreatingOrganization = mock(
      OrganizationRepository
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

    const mockUpdatingOrganization: UpdatingOrganization = mock(
      OrganizationRepository
    )
    when(
      mockUpdatingOrganization.update(organization.id, orgName, childOrg2.id)
    ).thenResolve()
    when(
      mockUpdatingOrganization.checkCyclicRelationship(organization, childOrg2)
    ).thenResolve()
    const updatingOrganization: UpdatingOrganization = instance(
      mockUpdatingOrganization
    )

    const mockFindingOrganization: FindingOrganization = mock(
      OrganizationRepository
    )
    when(mockFindingOrganization.findById(organization.id)).thenResolve(
      organization
    )
    when(mockFindingOrganization.findById(childOrg2.id)).thenResolve(childOrg2)
    const findingOrganization: FindingOrganization = instance(
      mockFindingOrganization
    )

    const testClass = new OrganizationUseCase(
      creatingOrganization,
      findingUser,
      addingUserToOrganization,
      updatingOrganization,
      findingOrganization
    )
    const result = await testClass.update(
      organization.id,
      orgName,
      childOrg2.id
    )

    expect(result).toEqual(true)
    verify(mockFindingOrganization.findById(organization.id)).once()
    verify(mockFindingOrganization.findById(childOrg2.id)).once()
    verify(
      mockUpdatingOrganization.update(organization.id, orgName, childOrg2.id)
    ).once()
    verify(
      mockUpdatingOrganization.checkCyclicRelationship(organization, childOrg2)
    ).once()
  })

  it('should succeed when changing parent (on another organization tree) from an organization with childrens', async () => {
    const currentParentOrg: Organization = {
      id: casual.uuid,
      name: casual.company_name,
      parentOrganizationId: null,
    }
    const targetParentOrg: Organization = {
      id: casual.uuid,
      name: casual.company_name,
      parentOrganizationId: null,
    }
    const organization: Organization = {
      id: casual.uuid,
      name: casual.company_name,
      parentOrganizationId: currentParentOrg.id,
    }

    const mockCreatingOrganization: CreatingOrganization = mock(
      OrganizationRepository
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

    const mockUpdatingOrganization: UpdatingOrganization = mock(
      OrganizationRepository
    )
    when(
      mockUpdatingOrganization.update(
        organization.id,
        orgName,
        targetParentOrg.id
      )
    ).thenResolve()
    when(
      mockUpdatingOrganization.checkCyclicRelationship(
        organization,
        targetParentOrg
      )
    ).thenResolve()
    const updatingOrganization: UpdatingOrganization = instance(
      mockUpdatingOrganization
    )

    const mockFindingOrganization: FindingOrganization = mock(
      OrganizationRepository
    )
    when(mockFindingOrganization.findById(organization.id)).thenResolve(
      organization
    )
    when(mockFindingOrganization.findById(targetParentOrg.id)).thenResolve(
      targetParentOrg
    )
    const findingOrganization: FindingOrganization = instance(
      mockFindingOrganization
    )

    const testClass = new OrganizationUseCase(
      creatingOrganization,
      findingUser,
      addingUserToOrganization,
      updatingOrganization,
      findingOrganization
    )
    const result = await testClass.update(
      organization.id,
      orgName,
      targetParentOrg.id
    )

    expect(result).toEqual(true)
    verify(mockFindingOrganization.findById(organization.id)).once()
    verify(mockFindingOrganization.findById(targetParentOrg.id)).once()
    verify(
      mockUpdatingOrganization.update(
        organization.id,
        orgName,
        targetParentOrg.id
      )
    ).once()
    verify(
      mockUpdatingOrganization.checkCyclicRelationship(
        organization,
        targetParentOrg
      )
    ).once()
  })

  it('should fail when changin parent of organization by cyclic relationship', async () => {
    const childOrg: Organization = {
      id: casual.uuid,
      name: casual.company_name,
      parentOrganizationId: orgId,
    }
    const parentOrg: Organization = {
      id: orgId,
      name: orgName,
      parentOrganizationId: casual.uuid,
    }

    const mockCreatingOrganization: CreatingOrganization = mock(
      OrganizationRepository
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

    const mockUpdatingOrganization: UpdatingOrganization = mock(
      OrganizationRepository
    )
    when(
      mockUpdatingOrganization.checkCyclicRelationship(childOrg, parentOrg)
    ).thenReject(new Error(UpdatingOrganizationErrorsTypes.CYCLIC_RELATIONSHIP))
    const updatingOrganization: UpdatingOrganization = instance(
      mockUpdatingOrganization
    )

    const mockFindingOrganization: FindingOrganization = mock(
      OrganizationRepository
    )
    when(mockFindingOrganization.findById(orgId)).thenResolve(parentOrg)
    when(mockFindingOrganization.findById(childOrg.id)).thenResolve(childOrg)
    const findingOrganization: FindingOrganization = instance(
      mockFindingOrganization
    )

    const testClass = new OrganizationUseCase(
      creatingOrganization,
      findingUser,
      addingUserToOrganization,
      updatingOrganization,
      findingOrganization
    )
    await expect(
      testClass.update(childOrg.id, orgName, parentOrg.id)
    ).rejects.toThrow(UpdateOrganizationErrorsTypes.CYCLIC_RELATIONSHIP)
    verify(mockFindingOrganization.findById(orgId)).once()
    verify(mockFindingOrganization.findById(childOrg.id)).once()
  })

  it('should fail when changing parent of organization to an inexistent organization', async () => {
    const newParentId = casual.uuid
    const rootId = casual.uuid
    const mockCreatingOrganization: CreatingOrganization = mock(
      OrganizationRepository
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

    const mockUpdatingOrganization: UpdatingOrganization = mock(
      OrganizationRepository
    )
    const updatingOrganization: UpdatingOrganization = instance(
      mockUpdatingOrganization
    )

    const mockFindingOrganization: FindingOrganization = mock(
      OrganizationRepository
    )
    when(mockFindingOrganization.findById(orgId)).thenResolve({
      id: orgId,
      name: orgName,
      parentOrganizationId: rootId,
    })
    when(mockFindingOrganization.findById(newParentId)).thenReject(
      new FindingOrganizationErrors(
        FindingOrganizationErrorsTypes.ORGANIZATION_NOT_FOUND
      )
    )
    const findingOrganization: FindingOrganization = instance(
      mockFindingOrganization
    )

    const testClass = new OrganizationUseCase(
      creatingOrganization,
      findingUser,
      addingUserToOrganization,
      updatingOrganization,
      findingOrganization
    )
    await expect(testClass.update(orgId, orgName, newParentId)).rejects.toThrow(
      UpdateOrganizationErrorsTypes.ORGANIZATION_NOT_FOUND
    )
    verify(mockFindingOrganization.findById(orgId)).once()
    verify(mockFindingOrganization.findById(newParentId)).once()
  })
})
