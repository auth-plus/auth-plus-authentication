export interface InvalidatingToken {
  invalidate: (token: string, userId?: string) => Promise<void>
}

export enum InvalidatingTokenErrorsTypes {
  NOT_FOUND = 'NOT_FOUND',
  PROVIDER_ERROR = 'PROVIDER_ERROR',
}

export class InvalidatingTokenErrors extends Error {
  constructor(message: InvalidatingTokenErrorsTypes) {
    super(message)
  }
}
