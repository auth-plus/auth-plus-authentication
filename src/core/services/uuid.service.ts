import { randomUUID } from 'crypto'

export class UuidService {
  generateHash(): string {
    return randomUUID()
  }
}
