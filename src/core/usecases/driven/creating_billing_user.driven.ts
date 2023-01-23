export interface CreatingBillingUser {
  create(userId: string): Promise<void>
}
