export interface AddUserToOrganization {
  add: (organizationId: string, userId: string) => Promise<string>
}

export enum AddUserToOrganizationErrorsTypes {
  REDUNDANT_RELATIONSHIP = 'REDUNDANT_RELATIONSHIP',
  DEPENDENCY_ERROR = 'DEPENDENCY_ERROR',
  NOT_FOUND = 'NOT_FOUND',
}

export class AddUserToOrganizationErrors extends Error {
  constructor(message: AddUserToOrganizationErrorsTypes) {
    super(message)
  }
}
