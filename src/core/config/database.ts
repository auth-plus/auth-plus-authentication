import { knex } from 'knex'

import env from '../../config/enviroment_config'

const database = knex({
  client: 'pg',
  version: '11.12',
  connection: {
    host: env.database.host,
    user: env.database.user,
    password: env.database.password,
    database: env.database.database,
  },
  debug: env.app.enviroment == 'development',
})

export default database

// Export Type
export { Knex as DatabaseType } from 'knex'
