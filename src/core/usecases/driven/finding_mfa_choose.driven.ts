import { Strategy } from '../../entities/strategy'

export interface FindingMFAChoose {
  findByHash: (
    hash: string
  ) => Promise<{ userId: string; strategyList: Strategy[] }>
}

export enum FindingMFAChooseErrorsTypes {
  NOT_FOUND = 'NOT_FOUND',
}

export class FindingMFAChooseErrors extends Error {
  constructor(message: FindingMFAChooseErrorsTypes) {
    super(message)
  }
}
