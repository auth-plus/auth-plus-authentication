export interface FindingResetPassword {
  findByHash: (hash: string) => Promise<string>
}
export enum FindingResetPasswordErrorsTypes {
  RESET_PASSWORD_HASH_NOT_FOUND = 'RESET_PASSWORD_HASH_NOT_FOUND',
}

export class FindingResetPasswordErrors extends Error {
  constructor(message: FindingResetPasswordErrorsTypes) {
    super(message)
    this.name = 'FindingResetPassword'
  }
}
