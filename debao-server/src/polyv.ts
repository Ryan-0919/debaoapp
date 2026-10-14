import {createHash, timingSafeEqual} from 'node:crypto';

// Polyv custom authorization, not the account-level appSecret.
// https://help.polyv.net/live/api/web/watch_condition/customauth_2/
export function polyvViewerId(userId: string): string {
  return `debao_${createHash('sha256').update(userId).digest('hex').slice(0, 48)}`;
}

export function polyvWatchUrl(channelId: string, videoId?: string): string {
  if (!/^\d{1,20}$/.test(channelId)) throw new Error('Invalid Polyv channel');
  const url = new URL(`https://live.polyv.cn/watch/${channelId}`);
  if (videoId) url.searchParams.set('vid', videoId);
  return url.toString();
}

/**
 * Verify the signature used by Polyv's account-level callbacks.
 * Polyv signs callbacks as md5(AppSecret + timestamp). The timestamp is a
 * 13-digit millisecond value and is deliberately bounded to prevent replay.
 */
export function verifyPolyvCallbackSignature(input: {
  timestamp: string;
  sign: string;
  secret: string;
  now?: number;
  maxAgeMs?: number;
}): boolean {
  const now = input.now ?? Date.now();
  const maxAgeMs = input.maxAgeMs ?? 10 * 60_000;
  if (!/^\d{13}$/.test(input.timestamp) || !Number.isFinite(Number(input.timestamp))) return false;
  if (Math.abs(now - Number(input.timestamp)) > maxAgeMs) return false;
  if (!/^[a-f\d]{32}$/i.test(input.sign)) return false;
  const expected = createHash('md5').update(input.secret + input.timestamp).digest('hex');
  const actual = input.sign.toLowerCase();
  return timingSafeEqual(Buffer.from(expected, 'utf8'), Buffer.from(actual, 'utf8'));
}

export function polyvAuthorizationConfig(env: NodeJS.ProcessEnv = process.env) {
  const secret = env.POLYV_AUTH_SECRET?.trim();
  const callback = env.POLYV_AUTH_CALLBACK_URL?.trim();
  if (!secret || !callback) return undefined;
  try {
    const url = new URL(callback);
    if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash || url.pathname !== '/v1/live/polyv/authorize') return undefined;
    return {secret, callback: url.toString()};
  } catch { return undefined; }
}

export function authorizePolyvWatch(input: {
  channelId: string; userId: string; nickname: string; secret: string;
  timestamp: string; sign: string; returnUrl: string; videoId?: string;
}, now = Date.now()): string {
  if (!/^\d{13}$/.test(input.timestamp) || Math.abs(now - Number(input.timestamp)) > 5 * 60_000) throw new Error('授权请求已过期，请重新进入课堂');
  const expected = createHash('md5').update(input.secret + input.channelId + input.secret + input.timestamp).digest('hex');
  if (!/^[a-f\d]{32}$/i.test(input.sign) || !timingSafeEqual(Buffer.from(expected), Buffer.from(input.sign.toLowerCase()))) throw new Error('直播授权签名不正确');
  const url = new URL(input.returnUrl);
  // Never redirect credentials to a caller-supplied host or another channel.
  if (url.origin !== 'https://live.polyv.cn' || url.pathname !== `/watch/${input.channelId}` || url.username || url.password || url.hash) throw new Error('直播回跳地址不正确');
  // Discard supplied query parameters, including unapproved playback videos.
  url.search = '';
  const viewerId = polyvViewerId(input.userId);
  const sign = createHash('md5').update(input.secret + input.channelId + input.secret + now + input.secret + viewerId).digest('hex');
  const nickname = input.nickname.replace(/[&<>"']/g, '').slice(0, 40) || '得宝学员';
  url.searchParams.set('userid', viewerId);
  url.searchParams.set('nickname', Buffer.from(nickname, 'utf8').toString('base64'));
  url.searchParams.set('ts', String(now));
  url.searchParams.set('sign', sign);
  if (input.videoId) url.searchParams.set('vid', input.videoId);
  return url.toString();
}
