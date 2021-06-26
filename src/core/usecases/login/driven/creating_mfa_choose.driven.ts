import { MFAChoose } from '../../../value_objects/mfa_choose'

export interface CreatingMFAChoose {
  create: (mFAChoose: MFAChoose) => Promise<void>
}

export enum CreatingMFAChooseErrorsTypes {
  CACHE_DEPENDECY_ERROR = 'DATABASE_DEPENDECY_ERROR',
}

export class CreatingMFAChooseErrors extends Error {
  constructor(message: CreatingMFAChooseErrorsTypes) {
    super(message)
  }
}
