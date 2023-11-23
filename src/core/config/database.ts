import { knex } from 'knex'

import { getEnv } from '../../config/enviroment_config'

const database = knex({
  client: 'pg',
  version: '11.12',
  connection: {
    host: getEnv().database.host,
    user: getEnv().database.user,
    password: getEnv().database.password,
    database: getEnv().database.database,
  },
  debug: getEnv().app.enviroment == 'development',
})

export default database

// Export Type
export { Knex as DatabaseType } from 'knex'
