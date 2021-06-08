export interface CreatingMFA {
  creatingStrategyForUser: (userId: string, strategy: string) => Promise<void>
}

export interface MFA {
  name: string
}

export enum CreatingMFAErrorsTypes {
  NOT_FOUND = 'NOT FOUND',
  DATABASE_DEPENDECY_ERROR = 'DATABASE_DEPENDECY_ERROR',
}

export class CreatingMFAErrors extends Error {
  constructor(message: CreatingMFAErrorsTypes) {
    super(message)
  }
}
