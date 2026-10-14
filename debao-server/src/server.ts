import {createServer} from 'node:http';
import {config, handle, hydrateStore, infrastructure, processAdminWorkers} from './main.js';

if (config.nodeEnv === 'production') await infrastructure.assertReady();
await hydrateStore();
// Resume any export/push jobs that were left queued by a previous process.
// The call is best-effort in development; production startup still exposes
// durable job state for an external worker when a provider is unavailable.
await processAdminWorkers().catch(error => console.warn('admin worker bootstrap skipped:', error instanceof Error ? error.message : error));
createServer(handle).listen(config.port, config.host, () => {
  console.log(`debao-server listening on http://${config.host}:${config.port}`);
});
