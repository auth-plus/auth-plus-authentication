import { User } from 'src/core/entities/user'

export interface CreatingToken {
  create: (user: User) => string
}
