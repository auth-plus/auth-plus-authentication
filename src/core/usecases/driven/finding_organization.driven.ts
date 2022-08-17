import { Organization } from '../../entities/organization'

export interface FindingOrganization {
  findById: (organizationId: string) => Promise<Organization>
}

export enum FindingOrganizationErrorsTypes {
  ORGANIZATION_NOT_FOUND = 'ORGANIZATION_NOT_FOUND',
}

export class FindingOrganizationErrors extends Error {
  constructor(message: FindingOrganizationErrorsTypes) {
    super(message)
    this.name = 'FindingOrganization'
  }
}
