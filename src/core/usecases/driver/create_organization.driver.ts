export interface CreateOrganization {
  create: (name: string, parent: string | null) => Promise<string>
}

export enum CreateOrganizationErrorsTypes {
  CYCLIC_RELATIONSHIP = 'CYCLIC_RELATIONSHIP',
  DEPENDENCY_ERROR = 'DEPENDENCY_ERROR',
  PARENT_NOT_EXIST = 'PARENT_NOT_EXIST',
}

export class CreateOrganizationErrors extends Error {
  constructor(message: CreateOrganizationErrorsTypes) {
    super(message)
  }
}
