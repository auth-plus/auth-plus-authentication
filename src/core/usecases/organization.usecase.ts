import {
  AddingUserToOrganization,
  AddingUserToOrganizationErrorsTypes,
} from './driven/adding_user_to_organization.driven'
import {
  CreatingOrganization,
  CreatingOrganizationErrorsTypes,
} from './driven/creating_organization.driven'
import {
  FindingUser,
  FindingUserErrorsTypes,
} from './driven/finding_user.driven'
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

export default class Organization
  implements CreateOrganization, AddUserToOrganization
{
  constructor(
    private creatingOrganization: CreatingOrganization,
    private findingUser: FindingUser,
    private addingUserToOrganization: AddingUserToOrganization
  ) {}

  async create(name: string, parent: string | null): Promise<string> {
    try {
      return await this.creatingOrganization.create(name, parent)
    } catch (error) {
      switch ((error as Error).message) {
        case CreatingOrganizationErrorsTypes.PARENT_NOT_EXIST:
          throw new CreateOrganizationErrors(
            CreateOrganizationErrorsTypes.PARENT_NOT_EXIST
          )
        case CreatingOrganizationErrorsTypes.DATABASE_DEPENDENCY_ERROR:
        default:
          throw new CreateOrganizationErrors(
            CreateOrganizationErrorsTypes.DEPENDENCY_ERROR
          )
      }
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
        case FindingUserErrorsTypes.NOT_FOUND:
          throw new AddUserToOrganizationErrors(
            AddUserToOrganizationErrorsTypes.NOT_FOUND
          )
        case AddingUserToOrganizationErrorsTypes.DUPLICATED_RELATIONSHIP:
          throw new AddUserToOrganizationErrors(
            AddUserToOrganizationErrorsTypes.DUPLICATED_RELATIONSHIP
          )
        case AddingUserToOrganizationErrorsTypes.DATABASE_DEPENDENCY_ERROR:
        default:
          throw new AddUserToOrganizationErrors(
            AddUserToOrganizationErrorsTypes.DEPENDENCY_ERROR
          )
      }
    }
  }
}
