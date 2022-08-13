export interface AddingUserToOrganization {
  addUser: (organizationId: string, userId: string) => Promise<string>
}

export enum AddingUserToOrganizationErrorsTypes {
  DUPLICATED_RELATIONSHIP = 'DUPLICATED_RELATIONSHIP',
  ORGANIZATION_NOT_FOUND = 'ORGANIZATION_NOT_FOUND',
}

export class AddingUserToOrganizationErrors extends Error {
  constructor(message: AddingUserToOrganizationErrorsTypes) {
    super(message)
  }
}
