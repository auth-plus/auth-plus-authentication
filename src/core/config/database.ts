import { Knex, knex } from 'knex'

import { Enviroment } from '../../config/enviroment_config'

let client: Knex
export function getPostgres(env: Enviroment) {
  if (client != undefined) {
    return client
  }
  client = knex({
    client: 'pg',
    version: '11.12',
    connection: {
      host: env.database.host,
      user: env.database.user,
      password: env.database.password,
      database: env.database.database,
      port: env.database.port,
    },
    debug: env.app.enviroment == 'development',
  })
  return client
}

// Export Type
export { Knex as DatabaseType } from 'knex'
