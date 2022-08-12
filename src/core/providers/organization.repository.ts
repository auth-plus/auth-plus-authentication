import database from '../config/database'
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

interface OrganizationRow {
  id: string
  name: string
  parent_organization_id: string
  relation_tree_level: number
  is_enable: boolean
}

interface OrganizationUserRow {
  id: string
  user_id: string
  organization_id: string
}

export class OrganizationRepository
  implements CreatingOrganization, AddingUserToOrganization
{
  async addUser(organizationId: string, userId: string): Promise<string> {
    try {
      const org = await database<OrganizationRow>('organization')
        .where('id', organizationId)
        .where('is_enable', true)
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
      const response: Array<{ id: string }> =
        await database<OrganizationUserRow>('organization_user')
          .insert(insertData)
          .returning('id')
      return response[0].id
    } catch (error) {
      if ((error as Error).message in AddingUserToOrganizationErrorsTypes) {
        throw error as AddingUserToOrganizationErrors
      }
      throw new AddingUserToOrganizationErrors(
        AddingUserToOrganizationErrorsTypes.DATABASE_DEPENDENCY_ERROR
      )
    }
  }

  async create(name: string, parent: string | null): Promise<string> {
    let relation_tree_level = 0
    try {
      if (parent !== null) {
        const parentRow = await database<OrganizationRow>('organization')
          .where('id', parent)
          .where('is_enable', true)
          .limit(1)
        if (parentRow.length === 0) {
          throw new CreatingOrganizationErrors(
            CreatingOrganizationErrorsTypes.PARENT_NOT_EXIST
          )
        }
        relation_tree_level = parentRow[0].relation_tree_level + 1
      }
      const insertData = {
        name,
        parent_organization_id: parent ?? undefined,
        relation_tree_level,
      }
      const response: Array<{ id: string }> = await database<OrganizationRow>(
        'organization'
      )
        .insert(insertData)
        .returning('id')
      return response[0].id
    } catch (error) {
      if ((error as Error).message in CreatingOrganizationErrorsTypes) {
        throw error as CreatingOrganizationErrors
      }
      throw new CreatingOrganizationErrors(
        CreatingOrganizationErrorsTypes.DATABASE_DEPENDENCY_ERROR
      )
    }
  }
}
