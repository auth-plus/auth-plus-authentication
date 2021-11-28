import { Organization } from '../../entities/organization'

export interface FindingOrganization {
  findById: (organizationId: string) => Promise<Organization>
}

export enum FindingOrganizationErrorsTypes {
  ORGANIZATION_NOT_FOUND = 'ORGANIZATION_NOT_FOUND',
  DATABASE_DEPENDENCY_ERROR = 'DATABASE_DEPENDENCY_ERROR',
}

export class FindingOrganizationErrors extends Error {
  constructor(message: FindingOrganizationErrorsTypes) {
    super(message)
  }
}
