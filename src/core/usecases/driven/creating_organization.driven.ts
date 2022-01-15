export interface CreatingOrganization {
  create: (name: string, parent: string | null) => Promise<string>
}

export enum CreatingOrganizationErrorsTypes {
  DATABASE_DEPENDENCY_ERROR = 'DATABASE_DEPENDENCY_ERROR',
  CYCLIC_RELATIONSHIP = 'CYCLIC_RELATIONSHIP',
  PARENT_NOT_EXIST = 'PARENT_NOT_EXIST',
}

export class CreatingOrganizationErrors extends Error {
  constructor(message: CreatingOrganizationErrorsTypes) {
    super(message)
  }
}
