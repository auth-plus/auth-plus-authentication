import { getEnv } from '../config/enviroment_config'
import { getRedis } from './config/cache'
import { getPostgres } from './config/database'
import { getKafka } from './config/kafka'
import { MFARepository } from './providers/mfa.repository'
import { MFAChooseRepository } from './providers/mfa_choose.repository'
import { MFACodeRepository } from './providers/mfa_code.repository'
import { NotificationProvider } from './providers/notification.provider'
import { OrganizationRepository } from './providers/organization.repository'
import { ResetPasswordRepository } from './providers/reset_password.repository'
import { TokenRepository } from './providers/token.repository'
import { UserRepository } from './providers/user.repository'
import { CodeService } from './services/code.service'
import { PasswordService } from './services/password.service'
import { UuidService } from './services/uuid.service'
import { AddingUserToOrganization } from './usecases/driven/adding_user_to_organization.driven'
import { CreatingMFA } from './usecases/driven/creating_mfa.driven'
import { CreatingMFAChoose } from './usecases/driven/creating_mfa_choose.driven'
import { CreatingMFACode } from './usecases/driven/creating_mfa_code.driven'
import { CreatingOrganization } from './usecases/driven/creating_organization.driven'
import { CreatingResetPassword } from './usecases/driven/creating_reset_password.driven'
import { CreatingSystemUser } from './usecases/driven/creating_system_user.driven'
import { CreatingToken } from './usecases/driven/creating_token.driven'
import { CreatingUser } from './usecases/driven/creating_user.driven'
import { DecodingToken } from './usecases/driven/decoding_token.driven'
import { FindingMFA } from './usecases/driven/finding_mfa.driven'
import { FindingMFAChoose } from './usecases/driven/finding_mfa_choose.driven'
import { FindingMFACode } from './usecases/driven/finding_mfa_code.driven'
import { FindingOrganization } from './usecases/driven/finding_organization.driven'
import { FindingResetPassword } from './usecases/driven/finding_reset_password.driven'
import { FindingUser } from './usecases/driven/finding_user.driven'
import { InvalidatingToken } from './usecases/driven/invalidating_token.driven'
import { SendingMfaCode } from './usecases/driven/sending_mfa_code.driven'
import { SendingMfaHash } from './usecases/driven/sending_mfa_hash.driven'
import { SendingResetEmail } from './usecases/driven/sending_reset_email.driven'
import { UpdatingOrganization } from './usecases/driven/updating_organization.driven'
import { UpdatingUser } from './usecases/driven/updating_user.driven'
import { ValidatingCode } from './usecases/driven/validating_code.driven'
import { ValidatingMFA } from './usecases/driven/validating_mfa.driven'
import Login from './usecases/login.usecase'
import Logout from './usecases/logout.usecase'
import Mfa from './usecases/mfa.usecase'
import MFAChoose from './usecases/mfa_choose.usecase'
import MFACode from './usecases/mfa_code.usecase'
import OrganizationUseCase from './usecases/organization.usecase'
import ResetPasswordUseCase from './usecases/reset_password.usecase'
import TokenUsecase from './usecases/token.usecase'
import UserUsecase from './usecases/user.usecase'

export async function getCore() {
  const env = getEnv(),
    database = getPostgres(env),
    cache = await getRedis(env.cache.url),
    kafka = getKafka(env),
    // SERVICES
    passwordService = new PasswordService(),
    uuidService = new UuidService(),
    codeService = new CodeService(),
    //PROVIDERS
    creatingOrganization: CreatingOrganization = new OrganizationRepository(
      database
    ),
    addingUserToOrganization: AddingUserToOrganization =
      new OrganizationRepository(database),
    updatingOrganization: UpdatingOrganization = new OrganizationRepository(
      database
    ),
    findingOrganization: FindingOrganization = new OrganizationRepository(
      database
    ),
    findingUser: FindingUser = new UserRepository(database, passwordService),
    creatingUser: CreatingUser = new UserRepository(database, passwordService),
    updatingUser: UpdatingUser = new UserRepository(database, passwordService),
    creatingMFAChoose: CreatingMFAChoose = new MFAChooseRepository(
      cache,
      uuidService
    ),
    findingMFAChoose: FindingMFAChoose = new MFAChooseRepository(
      cache,
      uuidService
    ),
    creatingMFACode: CreatingMFACode = new MFACodeRepository(
      cache,
      uuidService,
      codeService
    ),
    findingMFACode: FindingMFACode = new MFACodeRepository(
      cache,
      uuidService,
      codeService
    ),
    validatingCode: ValidatingCode = new MFACodeRepository(
      cache,
      uuidService,
      codeService
    ),
    creatingMFA: CreatingMFA = new MFARepository(database, updatingUser),
    findingMFA: FindingMFA = new MFARepository(database, updatingUser),
    validatingMFA: ValidatingMFA = new MFARepository(database, updatingUser),
    invalidatingToken: InvalidatingToken = new TokenRepository(cache),
    creatingToken: CreatingToken = new TokenRepository(cache),
    decodingToken: DecodingToken = new TokenRepository(cache),
    sendingMfaCode: SendingMfaCode = new NotificationProvider(database, kafka),
    sendingMfaHash: SendingMfaHash = new NotificationProvider(database, kafka),
    sendingResetEmail: SendingResetEmail = new NotificationProvider(
      database,
      kafka
    ),
    creatingSystemUser: CreatingSystemUser = new NotificationProvider(
      database,
      kafka
    ),
    creatingResetPassword: CreatingResetPassword = new ResetPasswordRepository(
      cache,
      uuidService
    ),
    findingResetPassword: FindingResetPassword = new ResetPasswordRepository(
      cache,
      uuidService
    ),
    // USECASES
    login = new Login(
      findingUser,
      findingMFA,
      creatingMFAChoose,
      creatingToken
    ),
    logout = new Logout(invalidatingToken),
    mfaChoose = new MFAChoose(
      findingMFAChoose,
      creatingMFACode,
      sendingMfaCode
    ),
    mFACode = new MFACode(
      findingMFACode,
      findingUser,
      creatingToken,
      validatingCode,
      findingMFA
    ),
    mfa = new Mfa(
      findingUser,
      findingMFA,
      creatingMFA,
      validatingMFA,
      sendingMfaHash
    ),
    user = new UserUsecase(
      findingUser,
      creatingUser,
      updatingUser,
      creatingSystemUser
    ),
    organization = new OrganizationUseCase(
      creatingOrganization,
      findingUser,
      addingUserToOrganization,
      updatingOrganization,
      findingOrganization
    ),
    reset = new ResetPasswordUseCase(
      creatingResetPassword,
      sendingResetEmail,
      findingResetPassword,
      findingUser,
      updatingUser
    ),
    token = new TokenUsecase(
      decodingToken,
      findingUser,
      creatingToken,
      invalidatingToken
    )

  return {
    login,
    logout,
    mfa,
    user,
    mFACode,
    mfaChoose,
    organization,
    reset,
    token,
  }
}
