import { Credential } from '../common/credentials'

export interface LoginUser {
  login: (email: string, password: string) => Promise<Credential>
}
