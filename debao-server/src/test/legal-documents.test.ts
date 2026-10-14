import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {handle, store} from '../main.js';

async function withServer(run: (base: string) => Promise<void>) {
  const server = createServer(handle);
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('server address unavailable');
  try {
    await run(`http://127.0.0.1:${address.port}`);
  } finally {
    server.closeAllConnections();
    await new Promise<void>(resolve => server.close(() => resolve()));
  }
}

test('published application legal documents are readable without a client fixture', async () => withServer(async base => {
  const response = await fetch(`${base}/v1/legal-documents/privacy`);
  const json = await response.json() as any;
  assert.equal(response.status, 200);
  assert.equal(json.data.key, 'privacy');
  assert.equal(json.data.status, 'published');
  assert.ok(json.data.version >= 1);
  assert.ok(Array.isArray(json.data.sections));
  assert.ok(json.data.sections.length >= 5);
  const missing = await fetch(`${base}/v1/legal-documents/not-a-document`);
  assert.equal(missing.status, 404);
}));

test('user notification settings are authenticated and persisted in the store', async () => withServer(async base => {
  const previous = store.userSettings.get('u-demo');
  try {
  const unauthenticated = await fetch(`${base}/v1/me/settings`);
  assert.equal(unauthenticated.status, 401);
  const headers = {authorization: 'Bearer demo-token', 'content-type': 'application/json'};
  const initial = await fetch(`${base}/v1/me/settings`, {headers});
  const initialJson = await initial.json() as any;
  assert.equal(initial.status, 200);
  assert.equal(initialJson.data.learningReminders, true);
  const updated = await fetch(`${base}/v1/me/settings`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({learningReminders: false}),
  });
  const updatedJson = await updated.json() as any;
  assert.equal(updated.status, 200);
  assert.equal(updatedJson.data.learningReminders, false);
  assert.equal(store.userSettings.get('u-demo')?.learningReminders, false);
  const invalid = await fetch(`${base}/v1/me/settings`, {method: 'PATCH', headers, body: '{}'});
  assert.equal(invalid.status, 422);
  } finally {
    if (previous) store.userSettings.set('u-demo', previous);
    else store.userSettings.delete('u-demo');
  }
}));
