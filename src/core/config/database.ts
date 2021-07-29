import { knex } from 'knex'

import config from './enviroment_config'

const database = knex({
  client: 'pg',
  version: '11.12',
  connection: {
    host: config.database.host,
    user: config.database.user,
    password: config.database.password,
    database: config.database.database,
  },
  debug: config.app.enviroment == 'development',
})

export default database

// Export Type
export { Knex as DatabaseType } from 'knex'
