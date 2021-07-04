import { Credential } from '../../entities/credentials'

export interface FindMFACode {
  find: (hash: string, code: string) => Promise<Credential>
}
