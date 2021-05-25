import knex from 'knex'

const database = knex({
  client: 'mysql',
  connection: {
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_DATABASE,
  },
  debug: true,
})

export default database
