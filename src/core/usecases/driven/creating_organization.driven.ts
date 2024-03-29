export interface CreatingOrganization {
  create: (name: string, parent: string | null) => Promise<string>
}

export enum CreatingOrganizationErrorsTypes {
  PARENT_NOT_EXIST = 'PARENT_NOT_EXIST',
}

export class CreatingOrganizationErrors extends Error {
  constructor(message: CreatingOrganizationErrorsTypes) {
    super(message)
    this.name = 'CreatingOrganization'
  }
}
