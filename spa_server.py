from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.request import Request, ProxyHandler, build_opener
from urllib.error import HTTPError
from pathlib import Path

ROOT = Path(r'E:\code\得宝APP开发\debao-admin\dist')
DIRECT_OPENER = build_opener(ProxyHandler({}))

class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def do_GET(self):
        if self.path.startswith('/v1/'):
            return self.proxy()
        path = ROOT / self.path.lstrip('/').split('?', 1)[0]
        if not path.is_file():
            self.path = '/index.html'
        super().do_GET()

    def do_POST(self):
        if self.path.startswith('/v1/'):
            return self.proxy()
        self.send_error(501)

    def do_PATCH(self):
        if self.path.startswith('/v1/'):
            return self.proxy()
        self.send_error(501)

    def do_PUT(self):
        if self.path.startswith('/v1/'):
            return self.proxy()
        self.send_error(501)

    def do_DELETE(self):
        if self.path.startswith('/v1/'):
            return self.proxy()
        self.send_error(501)

    def proxy(self):
        length = int(self.headers.get('Content-Length', '0'))
        def body_chunks():
            remaining = length
            while remaining > 0:
                chunk = self.rfile.read(min(64 * 1024, remaining))
                if not chunk:
                    break
                remaining -= len(chunk)
                yield chunk

        body = body_chunks() if length else None
        headers = {k: v for k, v in self.headers.items() if k.lower() != 'host'}
        request = Request(f'http://127.0.0.1:4000{self.path}', data=body, headers=headers, method=self.command)
        try:
            with DIRECT_OPENER.open(request) as response:
                data = response.read()
                self.send_response(response.status)
                for key, value in response.headers.items():
                    if key.lower() not in {'transfer-encoding', 'connection'}:
                        self.send_header(key, value)
                self.end_headers()
                self.wfile.write(data)
        except HTTPError as error:
            data = error.read()
            self.send_response(error.code)
            for key, value in error.headers.items():
                if key.lower() not in {'transfer-encoding', 'connection'}:
                    self.send_header(key, value)
            self.end_headers()
            self.wfile.write(data)

ThreadingHTTPServer(('127.0.0.1', 8000), Handler).serve_forever()
