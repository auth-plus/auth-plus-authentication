export interface CreatingResetPassword {
  create: (email: string) => Promise<string>
}
