export interface ValidateMFA {
  validate: (mfaId: string) => Promise<boolean>
}

export enum ValidateMFAErrorsTypes {
  DEPENDECY_ERROR = 'DEPENDECY_ERROR',
}

export class ValidateMFAErrors extends Error {
  constructor(message: ValidateMFAErrorsTypes) {
    super(message)
    this.name = 'ValidateMFA'
  }
}
