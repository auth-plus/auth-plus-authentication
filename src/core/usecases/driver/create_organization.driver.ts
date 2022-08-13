export interface CreateOrganization {
  create: (name: string, parent: string | null) => Promise<string>
}

export enum CreateOrganizationErrorsTypes {
  CYCLIC_RELATIONSHIP = 'CYCLIC_RELATIONSHIP',
  PARENT_NOT_EXIST = 'PARENT_NOT_EXIST',
  DEPENDENCY_ERROR = 'DEPENDENCY_ERROR',
}

export class CreateOrganizationErrors extends Error {
  constructor(message: CreateOrganizationErrorsTypes) {
    super(message)
    this.name = 'CreateOrganization'
  }
}
