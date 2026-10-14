import {Pool} from 'pg';
import {Redis as RedisClient} from 'ioredis';
import type {ServerConfig} from './config.js';

export interface InfrastructureStatus {
  postgresConfigured: boolean;
  postgresReachable: boolean;
  redisConfigured: boolean;
  redisReachable: boolean;
}

export interface SqlStatement {
  text: string;
  values?: unknown[];
}

export class Infrastructure {
  private readonly pool?: Pool;
  private readonly redis?: RedisClient;
  constructor(private readonly config: ServerConfig) {
    if (config.databaseUrl) { this.pool = new Pool({connectionString: config.databaseUrl, max: 5, connectionTimeoutMillis: 1000}); this.pool.on('error', () => undefined); }
    if (config.redisUrl) { this.redis = new RedisClient(config.redisUrl, {lazyConnect: true, connectTimeout: 1000, maxRetriesPerRequest: 1, enableOfflineQueue: false, retryStrategy: () => null}); this.redis.on('error', () => undefined); }
  }
  async status(): Promise<InfrastructureStatus> {
    let postgresReachable = false; let redisReachable = false;
    if (this.pool) { try { await this.pool.query('select 1'); postgresReachable = true; } catch { postgresReachable = false; } }
    if (this.redis) { try { if (this.redis.status === 'wait') await this.redis.connect(); await this.redis.ping(); redisReachable = true; } catch { redisReachable = false; this.redis.disconnect(); } }
    return {postgresConfigured: Boolean(this.config.databaseUrl), postgresReachable, redisConfigured: Boolean(this.config.redisUrl), redisReachable};
  }
  async query<T extends Record<string, unknown> = Record<string, unknown>>(text: string, values: unknown[] = []): Promise<{rows: T[]; rowCount: number} | null> {
    if (!this.pool) {
      if (this.config.nodeEnv === 'production') throw new Error('PostgreSQL is not configured');
      return null;
    }
    try {
      const result = await this.pool.query<T>(text, values);
      return {rows: result.rows, rowCount: result.rowCount ?? result.rows.length};
    } catch (error) {
      if (this.config.nodeEnv === 'production') throw error;
      console.warn('database query skipped:', error instanceof Error ? error.message : error);
      return null;
    }
  }

  async transaction(statements: SqlStatement[]): Promise<void> {
    if (!this.pool) {
      if (this.config.nodeEnv === 'production') throw new Error('PostgreSQL is not configured');
      return;
    }
    const client = await this.pool.connect();
    try {
      await client.query('begin');
      for (const statement of statements) {
        await client.query(statement.text, statement.values ?? []);
      }
      await client.query('commit');
    } catch (error) {
      try { await client.query('rollback'); } catch { /* Preserve the original transaction error. */ }
      throw error;
    } finally {
      client.release();
    }
  }

  async assertReady(): Promise<void> {
    const current = await this.status();
    if (!current.postgresConfigured || !current.postgresReachable) throw new Error('PostgreSQL is required and must be reachable');
    if (!current.redisConfigured || !current.redisReachable) throw new Error('Redis is required and must be reachable');
  }
  private async redisReady() {
    if (!this.redis) return false;
    if (this.redis.status === 'wait') await this.redis.connect();
    return this.redis.status === 'ready' || this.redis.status === 'connect';
  }
  async cacheGet<T = unknown>(key: string): Promise<T | null> {
    try { if (!await this.redisReady()) return null; const value = await this.redis!.get(key); return value ? JSON.parse(value) as T : null; } catch { this.redis?.disconnect(); return null; }
  }
  async cacheSet(key: string, value: unknown, ttlSeconds: number): Promise<boolean> {
    try { if (!await this.redisReady()) return false; await this.redis!.set(key, JSON.stringify(value), 'EX', ttlSeconds); return true; } catch { this.redis?.disconnect(); return false; }
  }
  async cacheDelete(key: string): Promise<boolean> {
    try { if (!await this.redisReady()) return false; await this.redis!.del(key); return true; } catch { this.redis?.disconnect(); return false; }
  }
  async close() { await this.pool?.end(); this.redis?.disconnect(); }
}
