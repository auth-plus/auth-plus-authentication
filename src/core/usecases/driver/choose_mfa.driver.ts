import { Strategy } from '../../entities/strategy'

export interface ChooseMFA {
  choose: (hash: string, strategy: Strategy) => Promise<boolean>
}

export enum ChooseMFAErrorsTypes {
  NOT_FOUND = 'NOT_FOUND',
  DEPENDECY_ERROR = 'DEPENDECY_ERROR',
}

export class ChooseMFAErrors extends Error {
  constructor(message: ChooseMFAErrorsTypes) {
    super(message)
    this.name = 'LoginUser'
  }
}
