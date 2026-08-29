import {createServer} from 'node:http';
import {handle} from './main.js';

const port = Number(process.env.PORT ?? 4000);
const host = process.env.HOST ?? '0.0.0.0';

createServer(handle).listen(port, host, () => {
  console.log(`debao-server listening on http://${host}:${port}`);
});
