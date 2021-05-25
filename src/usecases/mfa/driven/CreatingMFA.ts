export interface CreatingMFA {
  creatingStrategyForUser: (userId: string, strategy: string) => Promise<void>
}

export interface MFA {
  name: string
}

export enum CreatingMFAErrorsTypes {
  NOT_FOUND = 'NOT FOUND',
}

export class CreatingMFAErrors extends Error {
  constructor(message: CreatingMFAErrorsTypes) {
    super(message)
  }
}
