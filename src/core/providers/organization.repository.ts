import { AddingUserToOrganization } from '../usecases/driven/adding_user_to_organization.driven'
import { CreatingOrganization } from '../usecases/driven/creating_organization.driven'

export class OrganizationRepository
  implements CreatingOrganization, AddingUserToOrganization
{
  constructor() {}

  async add(organizationId: string, userId: string): Promise<string> {
    return ''
  }

  async create(name: string, parent: string | null): Promise<string> {
    return ''
  }
}
