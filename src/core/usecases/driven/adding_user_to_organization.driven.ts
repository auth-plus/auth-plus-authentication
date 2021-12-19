export interface AddingUserToOrganization {
  add: (organizationId: string, userId: string) => Promise<string>
}

export enum AddingUserToOrganizationErrorsTypes {
  DUPLICATED_RELATIONSHIP = 'DUPLICATED_RELATIONSHIP',
  DATABASE_DEPENDENCY_ERROR = 'DATABSE_DEPENDENCY_ERROR',
  ORGANIZATION_NOT_FOUND = 'ORGANIZATION_NOT_FOUND',
}

export class AddingUserToOrganizationErrors extends Error {
  constructor(message: AddingUserToOrganizationErrorsTypes) {
    super(message)
  }
}
