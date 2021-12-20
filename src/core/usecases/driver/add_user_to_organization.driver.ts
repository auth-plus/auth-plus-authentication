export interface AddUserToOrganization {
  addUser: (organizationId: string, userId: string) => Promise<string>
}

export enum AddUserToOrganizationErrorsTypes {
  DUPLICATED_RELATIONSHIP = 'DUPLICATED_RELATIONSHIP',
  DEPENDENCY_ERROR = 'DEPENDENCY_ERROR',
  NOT_FOUND = 'NOT_FOUND',
}

export class AddUserToOrganizationErrors extends Error {
  constructor(message: AddUserToOrganizationErrorsTypes) {
    super(message)
  }
}
