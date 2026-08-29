import {createServer} from 'node:http';
import {config, handle, hydrateStore} from './main.js';

await hydrateStore();
createServer(handle).listen(config.port, config.host, () => {
  console.log(`debao-server listening on http://${config.host}:${config.port}`);
});
