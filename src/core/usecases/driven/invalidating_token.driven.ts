export interface InvalidatingToken {
  invalidate: (token: string) => Promise<void>
}

export enum InvalidatingTokenErrorsTypes {
  PROVIDER_ERROR = 'PROVIDER_ERROR',
}

export class InvalidatingTokenErrors extends Error {
  constructor(message: InvalidatingTokenErrorsTypes) {
    super(message)
  }
}
