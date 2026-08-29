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
  async close() { await this.pool?.end(); this.redis?.disconnect(); }
}
