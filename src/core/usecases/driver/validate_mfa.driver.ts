export interface ValidateMFA {
  validate: (mfaId: string) => Promise<boolean>
}

export enum ValidateMFAErrorsTypes {
  WRONG_CREDENTIAL = 'WRONG_CREDENTIAL',
  DEPENDECY_ERROR = 'DEPENDECY_ERROR',
}

export class ValidateMFAErrors extends Error {
  constructor(message: ValidateMFAErrorsTypes) {
    super(message)
    this.name = 'ValidateMFA'
  }
}
