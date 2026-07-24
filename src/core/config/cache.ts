import {
  GlideClient,
  Batch,
  FlushMode,
  GlideString,
} from '@valkey/valkey-glide'
import { logger } from '../../config/logger'

type CacheClient = Awaited<ReturnType<typeof GlideClient.createClient>>
export class CacheService {
  private static instance: CacheService | null = null
  private client: CacheClient | null = null
  private isInitializing = false

  /**
   * Retrieves the singleton instance of the CacheService
   */
  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService()
    }
    return CacheService.instance
  }

  /**
   * Initializes the Valkey Glide client if it hasn't been initialized yet
   */
  async initialize(host: string): Promise<CacheClient> {
    if (this.client) {
      return this.client
    }

    if (this.isInitializing) {
      // Small safeguard to prevent concurrent initialization calls hammering the client creation
      while (!this.client) {
        await new Promise((resolve) => setTimeout(resolve, 50))
      }
      return this.client
    }

    this.isInitializing = true

    try {
      this.client = await GlideClient.createClient({
        addresses: [{ host, port: 6379 }],
      })

      const response = await this.client.ping()
      logger.info(`Connected to Valkey! Server responded: ${response}`)
    } catch (e) {
      logger.error(`Cache connection error: ${e}`)
      this.isInitializing = false
      throw e
    } finally {
      this.isInitializing = false
    }

    return this.client
  }

  /**
   * Ensures the client is ready before performing operations
   */
  private getClient(): CacheClient {
    if (!this.client) {
      throw new Error(
        'Cache client is not initialized. Please call initialize(host) first.'
      )
    }
    return this.client
  }

  /**
   * Set a key-value pair in the cache
   */
  public async set(key: string, value: unknown, TTL?: number): Promise<void> {
    const batch = new Batch(true)
    try {
      const client = this.getClient()
      batch.set(key, JSON.stringify(value))
      if (TTL) {
        batch.expire(key, TTL)
      }
      await client.exec(batch, true)
    } catch (error) {
      logger.error(`Error setting key "${key}" in cache: ${error}`)
    }
  }

  /**
   * Get a value by its key from the cache
   */
  public async get<T>(key: string): Promise<T | null> {
    try {
      const client = this.getClient()
      const content = await client.get(key)
      if (!content) {
        return null
      }
      if (typeof content == 'string') {
        return JSON.parse(content) as T
      }
      return content as T
    } catch (error) {
      logger.error(`Error getting key "${key}" from cache: ${error}`)
      return null
    }
  }

  public async keys(expression: string): Promise<string[]> {
    const client = this.getClient()
    let cursor: GlideString = '0'
    const resp: GlideString[][] = []
    do {
      // Scan returns [nextCursor, arrayOfKeys]
      const [nextCursor, keys] = await client.scan(cursor, {
        match: expression,
        count: 100, // Hint to fetch ~100 keys at a time
      })

      resp.push(keys)
      cursor = nextCursor
    } while (cursor !== '0')
    return resp.flat().map((e) => e.toString())
  }

  public destroy(): void {
    const client = this.getClient()
    client.close()
  }

  public async del(key: string): Promise<void> {
    const client = this.getClient()
    await client.del([key])
  }

  public async flush(): Promise<void> {
    const client = this.getClient()
    await client.flushdb(FlushMode.ASYNC)
  }
}
