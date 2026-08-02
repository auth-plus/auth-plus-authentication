export interface ValidatingMFA {
  validate: (mfaId: string) => Promise<boolean>
}
