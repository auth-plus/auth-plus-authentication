export interface ValidatingCode {
  validate: (inputCode: string, code: string) => void
  validateGA: (inputCode: string, secret: string) => void
}

export enum ValidatingCodeErrorsTypes {
  WRONG_CODE = 'WRONG_CODE',
  DIFF_CODE = 'DIFF_CODE',
}

export class ValidatingCodeErrors extends Error {
  constructor(message: ValidatingCodeErrorsTypes) {
    super(message)
    this.name = 'ValidatingCode'
  }
}
