export interface UpdateOrganization {
  update: (
    organizationId: string,
    name: string,
    parentId: string | null
  ) => void
}

export enum UpdateOrganizationErrorsTypes {
  CYCLIC_RELATIONSHIP = 'CYCLIC_RELATIONSHIP',
  DEPENDENCY_ERROR = 'DEPENDENCY_ERROR',
  ORGANIZATION_NOT_FOUND = 'ORGANIZATION_NOT_FOUND',
  PARENT_NOT_FOUND = 'PARENT_NOT_FOUND',
}

export class UpdateOrganizationErrors extends Error {
  constructor(message: UpdateOrganizationErrorsTypes) {
    super(message)
  }
}
