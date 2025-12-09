import { randomUUID } from 'crypto'

export class UuidService {
  private version = 4
  generateHash(): string {
    return randomUUID()
  }
}
