import { Strategy } from '../../entities/strategy'

export interface ChooseMFA {
  choose: (hash: string, strategy: Strategy) => Promise<string>
}

export enum ChooseMFAErrorsTypes {
  NOT_FOUND = 'NOT_FOUND',
  STRATEGY_NOT_LISTED = 'STRATEGY_NOT_LISTED',
  DEPENDECY_ERROR = 'DEPENDECY_ERROR',
}

export class ChooseMFAErrors extends Error {
  constructor(message: ChooseMFAErrorsTypes) {
    super(message)
    this.name = 'LoginUser'
  }
}
