import {createReadStream, stat} from 'node:fs';
import {createServer} from 'node:http';
import {fileURLToPath} from 'node:url';
import {extname, join, relative, resolve, sep} from 'node:path';

const webRoot = resolve(
  process.env.DEBAO_WEB_ROOT ?? fileURLToPath(new URL('../build/web/', import.meta.url)),
);
const port = Number(process.env.DEBAO_WEB_PORT ?? 8097);
const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.wasm': 'application/wasm',
};

function isInsideRoot(candidate) {
  const rel = relative(webRoot, candidate);
  return rel === '' || (rel !== '..' && !rel.startsWith(`..${sep}`));
}

function sendFile(response, filePath) {
  stat(filePath, (error, info) => {
    if (!error && info.isFile()) {
      response.writeHead(200, {
        'Content-Type': contentTypes[extname(filePath).toLowerCase()] ?? 'application/octet-stream',
        'Cache-Control': 'no-cache',
      });
      createReadStream(filePath).pipe(response);
      return;
    }

    // Only extensionless requests are application routes. A missing asset
    // should stay a 404 instead of being served the HTML shell.
    if (extname(filePath)) {
      response.writeHead(404, {'Content-Type': 'text/plain; charset=utf-8'});
      response.end('Not found');
      return;
    }

    const fallback = join(webRoot, 'index.html');
    stat(fallback, (fallbackError, fallbackInfo) => {
      if (fallbackError || !fallbackInfo.isFile()) {
        response.writeHead(404, {'Content-Type': 'text/plain; charset=utf-8'});
        response.end('Flutter web build not found');
        return;
      }
      response.writeHead(200, {'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache'});
      createReadStream(fallback).pipe(response);
    });
  });
}

createServer((request, response) => {
  const requestUrl = new URL(request.url ?? '/', `http://${request.headers.host ?? 'localhost'}`);
  const requestedPath = decodeURIComponent(requestUrl.pathname);
  const candidate = resolve(webRoot, `.${requestedPath}`);
  if (!isInsideRoot(candidate)) {
    response.writeHead(400, {'Content-Type': 'text/plain; charset=utf-8'});
    response.end('Invalid path');
    return;
  }
  sendFile(response, candidate);
}).listen(port, '127.0.0.1', () => {
  console.log(`Debao Flutter SPA preview: http://127.0.0.1:${port}/`);
});
