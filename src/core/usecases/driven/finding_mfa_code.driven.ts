export interface FindingMFACode {
  findByHash: (hash: string) => Promise<{ userId: string; code: string }>
}

export enum FindingMFACodeErrorsTypes {
  NOT_FOUND = 'NOT_FOUND',
  CACHE_DEPENDECY_ERROR = 'CACHE_DEPENDECY_ERROR',
}

export class FindingMFACodeErrors extends Error {
  constructor(message: FindingMFACodeErrorsTypes) {
    super(message)
  }
}
