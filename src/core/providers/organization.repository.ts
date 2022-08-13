import database from '../config/database'
import { Organization } from '../entities/organization'
import {
  AddingUserToOrganization,
  AddingUserToOrganizationErrors,
  AddingUserToOrganizationErrorsTypes,
} from '../usecases/driven/adding_user_to_organization.driven'
import {
  CreatingOrganization,
  CreatingOrganizationErrors,
  CreatingOrganizationErrorsTypes,
} from '../usecases/driven/creating_organization.driven'
import {
  FindingOrganization,
  FindingOrganizationErrors,
  FindingOrganizationErrorsTypes,
} from '../usecases/driven/finding_organization.driven'
import {
  UpdatingOrganization,
  UpdatingOrganizationErrors,
  UpdatingOrganizationErrorsTypes,
} from '../usecases/driven/updating_organization.driven'

interface OrganizationRow {
  id: string
  name: string
  parent_organization_id: string
}

interface OrganizationUserRow {
  id: string
  user_id: string
  organization_id: string
}

export class OrganizationRepository
  implements
    CreatingOrganization,
    AddingUserToOrganization,
    UpdatingOrganization,
    FindingOrganization
{
  async addUser(organizationId: string, userId: string): Promise<string> {
    const org = await database<OrganizationRow>('organization')
      .where('id', organizationId)
      .limit(1)
    if (org.length === 0) {
      throw new AddingUserToOrganizationErrors(
        AddingUserToOrganizationErrorsTypes.ORGANIZATION_NOT_FOUND
      )
    }
    const orgUser = await database<OrganizationUserRow>('organization_user')
      .where('organization_id', organizationId)
      .where('user_id', userId)
      .limit(1)
    if (orgUser.length !== 0) {
      throw new AddingUserToOrganizationErrors(
        AddingUserToOrganizationErrorsTypes.DUPLICATED_RELATIONSHIP
      )
    }
    const insertData = {
      user_id: userId,
      organization_id: organizationId,
    }
    const response: Array<{ id: string }> = await database<OrganizationUserRow>(
      'organization_user'
    )
      .insert(insertData)
      .returning('id')
    return response[0].id
  }

  async create(name: string, parentId: string | null): Promise<string> {
    if (parentId !== null) {
      const parentRow = await database<OrganizationRow>('organization')
        .where('id', parentId)
        .limit(1)
      if (parentRow.length === 0) {
        throw new CreatingOrganizationErrors(
          CreatingOrganizationErrorsTypes.PARENT_NOT_EXIST
        )
      }
    }
    const insertData = {
      name,
      parent_organization_id: parentId ?? undefined,
    }
    const response: Array<{ id: string }> = await database<OrganizationRow>(
      'organization'
    )
      .insert(insertData)
      .returning('id')
    return response[0].id
  }

  async update(
    organizationId: string,
    name: string,
    parentId: string | null
  ): Promise<void> {
    await database<OrganizationRow>('organization')
      .update({
        name,
        parent_organization_id: parentId ?? undefined,
      })
      .where('parent_organization_id', organizationId)
  }

  async findById(organizationId: string): Promise<Organization> {
    const org = await database<OrganizationRow>('organization')
      .where('id', organizationId)
      .limit(1)
    if (org.length === 0) {
      throw new FindingOrganizationErrors(
        FindingOrganizationErrorsTypes.ORGANIZATION_NOT_FOUND
      )
    }
    return {
      id: org[0].id,
      name: org[0].name,
      parentOrganizationId: org[0].parent_organization_id,
    } as Organization
  }

  async checkCyclicRelationship(
    organization: Organization,
    parent: Organization
  ): Promise<void> {
    if (
      organization.id === parent.id ||
      organization.id === parent.parentOrganizationId
    ) {
      throw new UpdatingOrganizationErrors(
        UpdatingOrganizationErrorsTypes.CYCLIC_RELATIONSHIP
      )
    }
    if (parent.parentOrganizationId === null) {
      return
    }
    const grandParentRow = await database<OrganizationRow>(
      'organization'
    ).where('id', parent.parentOrganizationId)
    const grandParent: Organization = {
      id: grandParentRow[0].id,
      name: grandParentRow[0].name,
      parentOrganizationId: grandParentRow[0].parent_organization_id,
    }
    return this.checkCyclicRelationship(organization, grandParent)
  }
}
