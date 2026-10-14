import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import type {IncomingMessage} from 'node:http';
import {handleLiveRoutes} from '../live-routes.js';
import {createStore} from '../store.js';

test('Polyv callbacks validate signatures, ignore test broadcasts, persist state and attach replay', async () => {
  const previous = process.env.POLYV_APP_SECRET;
  const secret = 'callback-test-only';
  process.env.POLYV_APP_SECRET = secret;
  const store = createStore();
  store.liveSessions.push({id: 'callback-live', courseId: 'c1', title: 'test', teacher: 'test', startsAt: new Date().toISOString(), endsAt: new Date(Date.now()+3600000).toISOString(), provider: 'polyv', providerRoomId: '123456', status: 'scheduled', notificationStatus: 'unavailable', updatedAt: new Date().toISOString()});
  const session = store.liveSessions[0];
  let writes = 0;
  let persistenceFails = false;
  const call = async (path: string, extra: Record<string,string>) => {
    const timestamp = String(Date.now());
    const query = new URLSearchParams({channelId: '123456', timestamp, sign: createHash('md5').update(secret+timestamp).digest('hex'), ...extra});
    return handleLiveRoutes({req: {method: 'GET'} as IncomingMessage, url: new URL(`http://localhost/v1/webhooks/polyv/${path}?${query}`), store,
      auth: () => {throw new Error('unexpected app auth');}, admin: () => {throw new Error('unexpected admin auth');}, body: async () => ({}),
      fail: (_status, code) => {throw new Error(code);}, send: () => {},
      persist: async () => {if (persistenceFails) throw new Error('database unavailable'); writes++;},
    });
  };
  try {
    await assert.rejects(call('live', {status:'live', sign:'bad'}), /UNAUTHORIZED/);
    await call('live', {status:'live', liveType:'test'});
    assert.equal(session.status, 'scheduled'); assert.equal(writes, 0);
    persistenceFails = true;
    await assert.rejects(call('live', {status:'live'}), /database unavailable/);
    assert.equal(session.status, 'scheduled');
    persistenceFails = false;
    await call('live', {status:'live'});
    await call('live', {status:'live'});
    assert.equal(session.status, 'live'); assert.equal(writes, 1);
    await call('live', {status:'end'});
    assert.equal(session.status, 'completed');
    await call('playback', {status:'error', vid:'failed_vid'});
    assert.equal(session.recordingVideoId, undefined);
    await call('playback', {status:'success', vid:'vod_vid'});
    assert.equal(session.recordingVideoId, undefined);
    await call('playback', {status:'success', vid:'vod_vid', videoId:'live_video_id'});
    assert.equal(session.recordingVideoId, 'live_video_id');
    session.status = 'cancelled';
    await call('live', {status:'live'});
    assert.equal(session.status, 'cancelled');
  } finally {
    if (previous === undefined) delete process.env.POLYV_APP_SECRET;
    else process.env.POLYV_APP_SECRET = previous;
  }
});
