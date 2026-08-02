export interface AddUserToOrganization {
  addUser: (organizationId: string, userId: string) => Promise<string>
}

export enum AddUserToOrganizationErrorsTypes {
  DUPLICATED_RELATIONSHIP = 'DUPLICATED_RELATIONSHIP',
  NOT_FOUND = 'NOT_FOUND',
  DEPENDENCY_ERROR = 'DEPENDENCY_ERROR',
}

export class AddUserToOrganizationErrors extends Error {
  constructor(message: AddUserToOrganizationErrorsTypes) {
    super(message)
    this.name = 'AddUserToOrganization'
  }
}
