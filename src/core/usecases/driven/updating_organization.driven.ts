import { Organization } from '../../entities/organization'

export interface UpdatingOrganization {
  update: (
    organizationId: string,
    name: string | null,
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
    this.name = 'UpdatingOrganization'
  }
}
