import database, { DatabaseType } from '../config/knex'
import cache, { CacheType } from '../config/redis'

export default class Datasource {
  protected database: DatabaseType
  protected cache: CacheType
  constructor() {
    this.database = database
    this.cache = cache
  }
}
