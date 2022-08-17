export interface UpdateOrganization {
  update: (
    organizationId: string,
    name: string,
    parentId: string | null
  ) => void
}

export enum UpdateOrganizationErrorsTypes {
  CYCLIC_RELATIONSHIP = 'CYCLIC_RELATIONSHIP',
  ORGANIZATION_NOT_FOUND = 'ORGANIZATION_NOT_FOUND',
  PARENT_NOT_FOUND = 'PARENT_NOT_FOUND',
  DEPENDENCY_ERROR = 'DEPENDENCY_ERROR',
}

export class UpdateOrganizationErrors extends Error {
  constructor(message: UpdateOrganizationErrorsTypes) {
    super(message)
    this.name = 'UpdateOrganization'
  }
}
