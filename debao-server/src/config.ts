export interface ServerConfig {
  nodeEnv: 'development' | 'test' | 'production';
  host: string;
  port: number;
  databaseUrl?: string;
  redisUrl?: string;
  authSecret: string;
  paymentAdapter: string;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): ServerConfig {
  const port = Number(env.PORT ?? 4000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be an integer between 1 and 65535');
  const nodeEnv = (env.NODE_ENV ?? 'development') as ServerConfig['nodeEnv'];
  if (!['development', 'test', 'production'].includes(nodeEnv)) throw new Error('NODE_ENV must be development, test or production');
  const authSecret = env.DEBAO_AUTH_SECRET ?? (nodeEnv === 'production' ? '' : 'local-development-only-change-me');
  if (nodeEnv === 'production' && authSecret.length < 32) throw new Error('DEBAO_AUTH_SECRET must be at least 32 characters in production');
  return {nodeEnv, host: env.HOST ?? '0.0.0.0', port, databaseUrl: env.DATABASE_URL, redisUrl: env.REDIS_URL, authSecret, paymentAdapter: env.PAYMENT_ADAPTER ?? 'local'};
}
