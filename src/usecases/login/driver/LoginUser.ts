import { Credential } from '../common/Credentials'

export interface LoginUser {
  login: (email: string, password: string) => Promise<Credential>
}
