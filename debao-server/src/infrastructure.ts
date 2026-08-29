import {Pool} from 'pg';
import {Redis as RedisClient} from 'ioredis';
import type {ServerConfig} from './config.js';

export interface InfrastructureStatus {
  postgresConfigured: boolean;
  postgresReachable: boolean;
  redisConfigured: boolean;
  redisReachable: boolean;
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
    if (!this.pool) return null;
    try {
      const result = await this.pool.query<T>(text, values);
      return {rows: result.rows, rowCount: result.rowCount ?? result.rows.length};
    } catch (error) {
      console.warn('database query skipped:', error instanceof Error ? error.message : error);
      return null;
    }
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
