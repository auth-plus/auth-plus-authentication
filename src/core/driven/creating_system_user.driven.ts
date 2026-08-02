export interface CreatingSystemUser {
  create(userId: string): Promise<void>
}
