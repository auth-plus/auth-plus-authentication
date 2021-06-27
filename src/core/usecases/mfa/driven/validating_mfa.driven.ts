export interface ValidatingMFA {
  validate: (mfaId: string) => Promise<boolean>
}

export enum ValidatingMFAErrorsTypes {
  NOT_FOUND = 'NOT FOUND',
  DATABASE_DEPENDECY_ERROR = 'DATABASE_DEPENDECY_ERROR',
}

export class ValidatingMFAErrors extends Error {
  constructor(message: ValidatingMFAErrorsTypes) {
    super(message)
  }
}
