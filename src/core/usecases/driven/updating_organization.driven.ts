import { Organization } from 'src/core/entities/organization'

export interface UpdatingOrganization {
  update: (
    organizationId: string,
    name: string,
    parentId: string | null
  ) => Promise<void>
  checkCyclicRelationship: (
    organization: Organization,
    parent: Organization
  ) => Promise<void>
}

export enum UpdatingOrganizationErrorsTypes {
  CYCLIC_RELATIONSHIP = 'CYCLIC_RELATIONSHIP',
}

export class UpdatingOrganizationErrors extends Error {
  constructor(message: UpdatingOrganizationErrorsTypes) {
    super(message)
  }
}
