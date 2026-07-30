import {logger} from '../../config/logger'
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

  async create(name: string, parentId: string | null): Promise<string> {
    logger.info({ event: 'org.create.started', name, parentId }, 'Organization creation initiated')
    try {
      const orgId = await this.creatingOrganization.create(name, parentId)
      logger.info({ event: 'org.create.success', organizationId: orgId, name, parentId }, 'Organization created successfully')
      return orgId
    } catch (error) {
      const err = error as Error
      if (err.message === CreatingOrganizationErrorsTypes.PARENT_NOT_EXIST) {
        logger.warn({ event: 'org.create.failed', name, parentId, reason: 'parent_not_exist' }, 'Organization creation failed: parent organization does not exist')
        throw new CreateOrganizationErrors(
          CreateOrganizationErrorsTypes.PARENT_NOT_EXIST
        )
      }
      logger.error({ event: 'org.create.error', name, parentId, error: err.message }, 'Organization creation failed: internal or dependency error')
      throw new CreateOrganizationErrors(
        CreateOrganizationErrorsTypes.DEPENDENCY_ERROR
      )
    }
  }

  async addUser(organizationId: string, userId: string): Promise<string> {
    logger.info({ event: 'org.user.add.started', organizationId, userId }, 'Adding user to organization initiated')
    try {
      const user = await this.findingUser.findById(userId)
      const relId = await this.addingUserToOrganization.addUser(
        organizationId,
        user.id
      )
      logger.info({ event: 'org.user.add.success', organizationId, userId, relationId: relId }, 'User added to organization successfully')
      return relId
    } catch (error) {
      const err = error as Error
      switch (err.message) {
        case AddingUserToOrganizationErrorsTypes.ORGANIZATION_NOT_FOUND:
        case FindingUserErrorsTypes.USER_NOT_FOUND:
          logger.warn({ event: 'org.user.add.failed', organizationId, userId, reason: 'not_found', error: err.message }, 'Adding user to organization failed: entity not found')
          throw new AddUserToOrganizationErrors(
            AddUserToOrganizationErrorsTypes.NOT_FOUND
          )
        case AddingUserToOrganizationErrorsTypes.DUPLICATED_RELATIONSHIP:
          logger.warn({ event: 'org.user.add.failed', organizationId, userId, reason: 'duplicated_relationship' }, 'Adding user to organization failed: relationship already exists')
          throw new AddUserToOrganizationErrors(
            AddUserToOrganizationErrorsTypes.DUPLICATED_RELATIONSHIP
          )
        default:
          logger.error({ event: 'org.user.add.error', organizationId, userId, error: err.message }, 'Adding user to organization failed: internal or dependency error')
          throw new AddUserToOrganizationErrors(
            AddUserToOrganizationErrorsTypes.DEPENDENCY_ERROR
          )
      }
    }
  }

  async update(
    organizationId: string,
    name: string | null,
    parentId: string | null
  ): Promise<boolean> {
    logger.info({ event: 'org.update.started', organizationId, name, parentId }, 'Organization update initiated')
    try {
      const org = await this.findingOrganization.findById(organizationId)
      if (parentId !== null) {
        const parentOrg = await this.findingOrganization.findById(parentId)
        await this.updatingOrganization.checkCyclicRelationship(org, parentOrg)
      }
      await this.updatingOrganization.update(org.id, name, parentId)
      logger.info({ event: 'org.update.success', organizationId, name, parentId }, 'Organization updated successfully')
      return true
    } catch (error) {
      const err = error as Error
      switch (err.message) {
        case FindingOrganizationErrorsTypes.ORGANIZATION_NOT_FOUND:
          logger.warn({ event: 'org.update.failed', organizationId, reason: 'not_found' }, 'Organization update failed: organization not found')
          throw new UpdateOrganizationErrors(
            UpdateOrganizationErrorsTypes.ORGANIZATION_NOT_FOUND
          )
        case UpdatingOrganizationErrorsTypes.CYCLIC_RELATIONSHIP:
          logger.warn({ event: 'org.update.failed', organizationId, reason: 'cyclic_relationship' }, 'Organization update failed: cyclic relationship detected')
          throw new UpdateOrganizationErrors(
            UpdateOrganizationErrorsTypes.CYCLIC_RELATIONSHIP
          )
        default:
          logger.error({ event: 'org.update.error', organizationId, error: err.message }, 'Organization update failed: internal or dependency error')
          throw new UpdateOrganizationErrors(
            UpdateOrganizationErrorsTypes.DEPENDENCY_ERROR
          )
      }
    }
  }
}
