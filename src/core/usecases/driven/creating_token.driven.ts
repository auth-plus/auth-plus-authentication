import { User } from '../../entities/user'

export interface CreatingToken {
  create: (user: User) => string
}
