export interface UpdatingUser {
  updateName: (userId: string, name: string) => Promise<boolean>
  updateEmail: (userId: string, email: string) => Promise<boolean>
  updatePhone: (userId: string, phone: string) => Promise<boolean>
  updateDevice: (userId: string, deviceId: string) => Promise<boolean>
  updateGA: (userId: string, token: string) => Promise<boolean>
}

export enum UpdatingUserErrorsTypes {
  LOW_ENTROPY = 'LOW_ENTROPY',
  DATABASE_DEPENDECY_ERROR = 'DATABASE_DEPENDECY_ERROR',
}

export class UpdatingUserErrors extends Error {
  constructor(message: UpdatingUserErrorsTypes) {
    super(message)
  }
}
