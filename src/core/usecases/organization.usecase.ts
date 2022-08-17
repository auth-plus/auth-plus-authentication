import {
  AddingUserToOrganization,
  AddingUserToOrganizationErrorsTypes,
} from './driven/adding_user_to_organization.driven'
import {
  CreatingOrganization,
  CreatingOrganizationErrorsTypes,
} from './driven/creating_organization.driven'
import {
  FindingOrganization,
  FindingOrganizationErrorsTypes,
} from './driven/finding_organization.driven'
import {
  FindingUser,
  FindingUserErrorsTypes,
} from './driven/finding_user.driven'
import {
  UpdatingOrganization,
  UpdatingOrganizationErrorsTypes,
} from './driven/updating_organization.driven'
import {
  AddUserToOrganization,
  AddUserToOrganizationErrors,
  AddUserToOrganizationErrorsTypes,
} from './driver/add_user_to_organization.driver'
import {
  CreateOrganization,
  CreateOrganizationErrors,
  CreateOrganizationErrorsTypes,
} from './driver/create_organization.driver'
import {
  UpdateOrganization,
  UpdateOrganizationErrors,
  UpdateOrganizationErrorsTypes,
} from './driver/update_organization.driver'

export default class OrganizationUseCase
  implements CreateOrganization, AddUserToOrganization, UpdateOrganization
{
  constructor(
    private creatingOrganization: CreatingOrganization,
    private findingUser: FindingUser,
    private addingUserToOrganization: AddingUserToOrganization,
    private updatingOrganization: UpdatingOrganization,
    private findingOrganization: FindingOrganization
  ) {}

  async create(name: string, parent: string | null): Promise<string> {
    try {
      return await this.creatingOrganization.create(name, parent)
    } catch (error) {
      if (
        (error as Error).message ===
        CreatingOrganizationErrorsTypes.PARENT_NOT_EXIST
      ) {
        throw new CreateOrganizationErrors(
          CreateOrganizationErrorsTypes.PARENT_NOT_EXIST
        )
      }
      throw new CreateOrganizationErrors(
        CreateOrganizationErrorsTypes.DEPENDENCY_ERROR
      )
    }
  }

  async addUser(organizationId: string, userId: string): Promise<string> {
    try {
      const user = await this.findingUser.findById(userId)
      return await this.addingUserToOrganization.addUser(
        organizationId,
        user.id
      )
    } catch (error) {
      switch ((error as Error).message) {
        case AddingUserToOrganizationErrorsTypes.ORGANIZATION_NOT_FOUND:
        case FindingUserErrorsTypes.USER_NOT_FOUND:
          throw new AddUserToOrganizationErrors(
            AddUserToOrganizationErrorsTypes.NOT_FOUND
          )
        case AddingUserToOrganizationErrorsTypes.DUPLICATED_RELATIONSHIP:
          throw new AddUserToOrganizationErrors(
            AddUserToOrganizationErrorsTypes.DUPLICATED_RELATIONSHIP
          )
        default:
          throw new AddUserToOrganizationErrors(
            AddUserToOrganizationErrorsTypes.DEPENDENCY_ERROR
          )
      }
    }
  }

  async update(
    organizationId: string,
    name: string,
    parentId: string | null
  ): Promise<void> {
    try {
      const org = await this.findingOrganization.findById(organizationId)
      if (parentId !== null) {
        const parentOrg = await this.findingOrganization.findById(parentId)
        await this.updatingOrganization.checkCyclicRelationship(org, parentOrg)
      }
      await this.updatingOrganization.update(org.id, name, parentId)
    } catch (error) {
      switch ((error as Error).message) {
        case FindingOrganizationErrorsTypes.ORGANIZATION_NOT_FOUND:
          throw new UpdateOrganizationErrors(
            UpdateOrganizationErrorsTypes.ORGANIZATION_NOT_FOUND
          )
        case UpdatingOrganizationErrorsTypes.CYCLIC_RELATIONSHIP:
          throw new UpdateOrganizationErrors(
            UpdateOrganizationErrorsTypes.CYCLIC_RELATIONSHIP
          )
        default:
          throw new UpdateOrganizationErrors(
            UpdateOrganizationErrorsTypes.DEPENDENCY_ERROR
          )
      }
    }
  }
}
