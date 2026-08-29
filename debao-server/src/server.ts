import {createServer} from 'node:http';
import {handle} from './main.js';
import {config} from './main.js';

createServer(handle).listen(config.port, config.host, () => {
  console.log(`debao-server listening on http://${config.host}:${config.port}`);
});
