import logger from '../../config/logger'
import { Credential } from '../entities/credentials'

import { CreatingToken } from './driven/creating_token.driven'
import { DecodingToken } from './driven/decoding_token.driven'
import { FindingUser } from './driven/finding_user.driven'
import { InvalidatingToken } from './driven/invalidating_token.driven'
import {
  RefreshToken,
  RefreshTokenErrors,
  RefreshTokenErrorsTypes,
} from './driver/refresh_token.driver'

export default class TokenUsecase implements RefreshToken {
  constructor(
    private validatingToken: DecodingToken,
    private findingUser: FindingUser,
    private creatingToken: CreatingToken,
    private invalidatingToken: InvalidatingToken
  ) {}

  async refresh(jwtToken: string): Promise<Credential> {
    try {
      const { isValid, userId } = await this.validatingToken.decode(jwtToken)
      if (!isValid) {
        throw new Error('Token banned')
      }
      const user = await this.findingUser.findById(userId)
      const token = this.creatingToken.create(user)
      await this.invalidatingToken.invalidate(jwtToken)
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        info: user.info,
        token,
      } as Credential
    } catch (error) {
      console.error(error)
      logger.error(error)
      throw new RefreshTokenErrors(RefreshTokenErrorsTypes.DEPENDECY_ERROR)
    }
  }
}
