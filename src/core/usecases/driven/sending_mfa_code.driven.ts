export interface Notification {
  sendCodeForUser: (userId: string, code: string) => Promise<void>
}

export enum NotificationErrorsTypes {
  PROVIDER_ERROR = 'PROVIDER_ERROR',
}

export class NotificationErrors extends Error {
  constructor(message: NotificationErrorsTypes) {
    super(message)
  }
}
