import {
  User,
  FindingUser,
  FindingUserErrors,
  FindingUserErrorsTypes,
} from '../usecases/login/driven/finding_user.driven'
import database from '../config/knex'

export class UserRepository implements FindingUser {
  async findUserByEmailAndPassword(
    email: string,
    password: string
  ): Promise<User> {
    const list = await database<User>('user')
      .where('email', email)
      .andWhere('password', password)
      .limit(1)
      .then()
    if (!list.length)
      throw new FindingUserErrors(FindingUserErrorsTypes.NOT_FOUND)
    return list[0]
  }
}
