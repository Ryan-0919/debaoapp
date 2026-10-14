import type {IncomingMessage} from 'node:http';
import type {Store} from './types.js';
import {createHash, randomUUID} from 'node:crypto';
import {authorizePolyvWatch, polyvAuthorizationConfig, polyvWatchUrl, verifyPolyvCallbackSignature} from './polyv.js';

type Session = Store['liveSessions'][number];
type Context = {
  req: IncomingMessage; url: URL; store: Store;
  auth(): string; admin(): {adminId: string};
  body(): Promise<Record<string, unknown>>;
  fail(status: number, code: string, message: string): never;
  send(status: number, data: unknown): void;
  persist(sql: string, values: unknown[]): Promise<void>;
};
const publicSession = (session: Session) => ({
  id: session.id, courseId: session.courseId, lessonId: session.lessonId,
  title: session.title, teacher: session.teacher, startsAt: session.startsAt,
  endsAt: session.endsAt, status: session.status, provider: session.provider ?? 'tencent',
  replayAvailable: Boolean(session.recordingVideoId),
});

export async function handleLiveRoutes(ctx: Context): Promise<boolean> {
  const {req, url, store, fail, send} = ctx;
  const path = url.pathname;
  // A direct visit to the provider's viewing page must not grant access.
  // Authenticated students receive a signed URL from the course-scoped join API.
  if (path === '/v1/live/polyv/authorize' && req.method === 'GET') {
    fail(401, 'COURSE_LOGIN_REQUIRED', '请从得宝 App 的已购课程进入直播课堂');
    return true;
  }
  const list = path.match(/^\/v1\/courses\/([^/]+)\/live-sessions$/);
  const watch = path.match(/^\/v1\/live-sessions\/([^/]+)\/(join|authorize)$/);
  const adminList = path === '/v1/admin/courses/live-sessions';
  const edit = path.match(/^\/v1\/admin\/courses\/live-sessions\/([^/]+)(\/cancel)?$/);
  // Polyv sends these callbacks without an application session. They must be
  // authenticated with the AppSecret signature before touching local state.
  if ((path === '/v1/webhooks/polyv/live' || path === '/v1/webhooks/polyv/playback') && req.method === 'GET') {
    const secret = process.env.POLYV_APP_SECRET?.trim();
    const timestamp = url.searchParams.get('timestamp') ?? '';
    const sign = url.searchParams.get('sign') ?? '';
    if (!secret || !verifyPolyvCallbackSignature({timestamp, sign, secret})) {
      fail(401, 'POLYV_CALLBACK_UNAUTHORIZED', '保利威回调签名无效或已过期');
    }
    const channelId = (url.searchParams.get('channelId') ?? '').trim();
    if (!/^\d{1,20}$/.test(channelId)) { fail(422, 'POLYV_CALLBACK_INVALID', '保利威回调频道号不正确'); }
    const session = store.liveSessions.find(item => item.provider === 'polyv' && item.providerRoomId === channelId);
    if (!session) { send(202, {accepted: true, matched: false}); return true; }
    const now = new Date().toISOString();
    if (path.endsWith('/live')) {
      const event = (url.searchParams.get('status') ?? '').trim();
      if (session.status === 'cancelled' || url.searchParams.get('liveType') === 'test') {
        send(200, {accepted: true, matched: true, ignored: true}); return true;
      }
      const nextStatus = ['live', 'seminar_live'].includes(event) ? 'live'
        : ['end', 'seminar_end', 'playback'].includes(event) ? 'completed' : undefined;
      if (!nextStatus || nextStatus === session.status) {
        send(200, {accepted: true, matched: true, status: session.status}); return true;
      }
      await ctx.persist('update live_sessions set status = $1, updated_at = $2 where id = $3', [nextStatus, now, session.id]);
      session.status = nextStatus;
      session.updatedAt = now;
      send(200, {accepted: true, matched: true, status: session.status}); return true;
    }
    const callbackStatus = (url.searchParams.get('status') ?? '').trim();
    const vid = (url.searchParams.get('videoId') ?? '').trim();
    // Custom-auth viewing pages require the live library videoId, not VOD vid.
    if (callbackStatus === 'success' && /^[a-zA-Z0-9_-]{1,120}$/.test(vid) && vid !== session.recordingVideoId) {
      await ctx.persist('update live_sessions set recording_video_id = $1, updated_at = $2 where id = $3', [vid, now, session.id]);
      session.recordingVideoId = vid;
      session.updatedAt = now;
    }
    send(200, {accepted: true, matched: true, recordingVideoId: session.recordingVideoId ?? null}); return true;
  }
  if (list && req.method === 'GET') {
    const userId = ctx.auth();
    const courseId = decodeURIComponent(list[1]);
    if (!store.courses.some(c => c.id === courseId && (!c.status || c.status === 'published'))) fail(404, 'NOT_FOUND', '课程不存在');
    if (!store.entitlements.some(e => e.userId === userId && e.courseId === courseId && (!e.expiresAt || Date.parse(e.expiresAt) > Date.now()))) fail(404, 'COURSE_NOT_AVAILABLE', '课程不存在或暂无学习权限');
    const items = store.liveSessions.filter(s => s.courseId === courseId).sort((a,b) => a.startsAt.localeCompare(b.startsAt)).map(publicSession);
    send(200, {items}); return true;
  }
  if (watch && req.method === 'POST') {
    const userId = ctx.auth();
    const session = store.liveSessions.find(s => s.id === decodeURIComponent(watch[1]));
    if (!session) { fail(404, 'NOT_FOUND', '直播课程不存在'); return true; }
    if (!store.courses.some(c => c.id === session.courseId && (!c.status || c.status === 'published'))) { fail(404, 'NOT_FOUND', '直播课程不存在'); return true; }
    if (!store.entitlements.some(e => e.userId === userId && e.courseId === session.courseId && (!e.expiresAt || Date.parse(e.expiresAt) > Date.now()))) fail(403, 'COURSE_ACCESS_REQUIRED', '请先开通该课程的学习权限');
    if (session.status === 'cancelled') fail(409, 'LIVE_CANCELLED', '本场直播已取消');
    if (session.provider !== 'polyv' || !session.providerRoomId) { fail(503, 'LIVE_NOT_CONFIGURED', '本场直播尚未配置，请联系老师'); return true; }
    const input = await ctx.body();
    if (input.mode !== undefined && !['live', 'replay'].includes(String(input.mode))) fail(422, 'VALIDATION_ERROR', '观看模式不正确');
    const replay = input.mode === 'replay';
    if (replay && !session.recordingVideoId) fail(409, 'REPLAY_NOT_READY', '回放尚未发布');
    if (!replay && session.status === 'completed') fail(409, 'LIVE_COMPLETED', '本场已结束，请查看回放');
    const config = polyvAuthorizationConfig();
    if (!config) {
      // Local emulator smoke tests can use a public Polyv channel. Never allow
      // this fallback in production, where course access must be signed.
      if (process.env.NODE_ENV !== 'production' && watch[2] === 'join') {
        send(200, {provider: 'polyv', channelId: session.providerRoomId, mode: replay ? 'replay' : 'live', watchUrl: polyvWatchUrl(session.providerRoomId, replay ? session.recordingVideoId : undefined), authorization: 'development-public'});
        return true;
      }
      fail(503, 'POLYV_NOT_CONFIGURED', '直播授权尚未配置，请联系管理员'); return true;
    }
    if (watch[2] === 'join') {
      // Create the short-lived custom-auth URL server-side. The App never
      // receives POLYV_AUTH_SECRET; it only receives the one-time watch URL.
      const ts = String(Date.now());
      const initialSign = createHash('md5').update(config.secret + session.providerRoomId + config.secret + ts).digest('hex');
      const watchUrl = authorizePolyvWatch({channelId: session.providerRoomId, userId, nickname: store.profiles.get(userId)?.name ?? '得宝学员', secret: config.secret, timestamp: ts, sign: initialSign, returnUrl: polyvWatchUrl(session.providerRoomId), videoId: replay ? session.recordingVideoId : undefined});
      send(200, {provider: 'polyv', channelId: session.providerRoomId, mode: replay ? 'replay' : 'live', watchUrl, authorizeUrl: config.callback});
    } else {
      if (input.id !== session.providerRoomId) fail(403, 'POLYV_CHANNEL_MISMATCH', '直播频道与课程不匹配');
      try {
        const signedUrl = authorizePolyvWatch({channelId: session.providerRoomId, userId, nickname: store.profiles.get(userId)?.name ?? '得宝学员', secret: config.secret, timestamp: String(input.ts ?? ''), sign: String(input.sign ?? ''), returnUrl: String(input.url ?? ''), videoId: replay ? session.recordingVideoId : undefined});
        send(200, {watchUrl: signedUrl});
      } catch (error) { fail(403, 'POLYV_AUTH_INVALID', error instanceof Error ? error.message : '直播授权失败'); }
    }
    return true;
  }
  if (adminList && req.method === 'GET') {ctx.admin(); send(200, {items: store.liveSessions, total: store.liveSessions.length}); return true;}
  if ((adminList && req.method === 'POST') || (edit && (req.method === 'PATCH' || (req.method === 'POST' && edit[2])))) {
    const admin = ctx.admin();
    const existing = edit ? store.liveSessions.find(s => s.id === decodeURIComponent(edit[1])) : undefined;
    if (edit && !existing) fail(404, 'NOT_FOUND', '直播场次不存在');
    const input = await ctx.body();
    const raw = {...existing, ...input};
    const text = (key: string) => String(raw[key as keyof typeof raw] ?? '').trim();
    const courseId = text('courseId'), lessonId = text('lessonId');
    const lesson = store.courseLessons.find(l => l.id === lessonId && l.mediaKind === 'live');
    if (!store.courses.some(c => c.id === courseId)) fail(422, 'VALIDATION_ERROR', '请选择属于该课程的直播课件');
    if (!lesson) fail(422, 'VALIDATION_ERROR', '请选择属于该课程的直播课件');
    const liveLesson = lesson!;
    if (!store.courseSections.some(s => s.id === liveLesson.sectionId && s.courseId === courseId)) fail(422, 'VALIDATION_ERROR', '请选择属于该课程的直播课件');
    const title = text('title'), teacher = text('teacher');
    const starts = Date.parse(text('startsAt')), ends = Date.parse(text('endsAt'));
    if (title.length < 2 || title.length > 160 || teacher.length < 2 || teacher.length > 80 || !Number.isFinite(starts) || !Number.isFinite(ends) || ends <= starts) fail(422, 'VALIDATION_ERROR', '请填写场次、讲师和有效的起止时间');
    const provider = text('provider') || 'polyv';
    if (!['polyv', 'tencent'].includes(provider)) fail(422, 'VALIDATION_ERROR', '不支持的直播平台');
    const channel = text('providerRoomId');
    const recordingVideoId = text('recordingVideoId');
    if (provider === 'polyv' && !/^\d{1,20}$/.test(channel)) fail(422, 'VALIDATION_ERROR', '保利威频道 ID 应为数字');
    if (recordingVideoId && !/^[a-zA-Z0-9_-]{1,120}$/.test(recordingVideoId)) fail(422, 'VALIDATION_ERROR', '保利威回放视频 ID 不正确');
    if (provider === 'polyv' && store.liveSessions.some(s => s.id !== existing?.id && s.provider === 'polyv' && s.providerRoomId === channel)) fail(409, 'POLYV_CHANNEL_IN_USE', '该频道已关联另一场课程，请为本场创建独立频道');
    const status = edit?.[2] ? 'cancelled' : text('status') || 'scheduled';
    if (!['scheduled', 'live', 'completed', 'cancelled'].includes(status)) fail(422, 'VALIDATION_ERROR', '直播状态不正确');
    const durationSeconds = Math.floor((ends - starts) / 1000);
    const updatedAt = new Date().toISOString();
    const session: Session = {id: existing?.id ?? `live-${randomUUID()}`, courseId, lessonId, title, teacher, startsAt: new Date(starts).toISOString(), endsAt: new Date(ends).toISOString(), provider: provider as Session['provider'], providerRoomId: channel || undefined, recordingVideoId: recordingVideoId || undefined, status: status as Session['status'], notificationStatus: existing?.notificationStatus ?? 'unavailable', updatedAt};
    await ctx.persist('insert into live_sessions (id,course_id,lesson_id,title,teacher,starts_at,ends_at,provider,provider_room_id,recording_video_id,status,notification_status,created_by,updated_at) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) on conflict (id) do update set course_id=excluded.course_id,lesson_id=excluded.lesson_id,title=excluded.title,teacher=excluded.teacher,starts_at=excluded.starts_at,ends_at=excluded.ends_at,provider=excluded.provider,provider_room_id=excluded.provider_room_id,recording_video_id=excluded.recording_video_id,status=excluded.status,updated_at=excluded.updated_at', [session.id,courseId,lessonId,title,teacher,session.startsAt,session.endsAt,provider,channel || null,recordingVideoId || null,status,session.notificationStatus,admin.adminId,session.updatedAt]);
    await ctx.persist('update course_lessons set duration_seconds = $1, updated_at = $2 where id = $3', [durationSeconds, updatedAt, liveLesson.id]);
    liveLesson.durationSeconds = durationSeconds;
    liveLesson.updatedAt = updatedAt;
    if (existing) Object.assign(existing, session); else store.liveSessions.unshift(session);
    await ctx.persist('insert into admin_audit_logs (admin_user_id,action,resource_type,resource_id,request_id) values ($1,$2,$3,$4,$5)', [admin.adminId, existing ? 'course.live_session.update' : 'course.live_session.create', 'live_session', session.id, req.headers['x-request-id'] ?? randomUUID()]);
    send(existing ? 200 : 201, session); return true;
  }
  return false;
}
