export interface UpdatingUser {
  updateName: (userId: string, name: string) => Promise<boolean>
  updateEmail: (userId: string, email: string) => Promise<boolean>
  updatePhone: (userId: string, phone: string) => Promise<boolean>
  updateDevice: (userId: string, deviceId: string) => Promise<boolean>
  updateGA: (userId: string, token: string) => Promise<boolean>
}

export enum UpdatingUserErrorsTypes {
  PASSWORD_WITH_LOW_ENTROPY = 'PASSWORD_WITH_LOW_ENTROPY',
}

export class UpdatingUserErrors extends Error {
  constructor(message: UpdatingUserErrorsTypes) {
    super(message)
    this.name = 'UpdatingUser'
  }
}
