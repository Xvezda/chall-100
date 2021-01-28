import webbrowser
from http.server import HTTPServer, BaseHTTPRequestHandler

PORT = 3002
ADDR = ('', PORT)


class EchoHTTPRequestHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        reqlen = int(self.headers.get('Content-Length', 0))
        reqbody = self.rfile.read(reqlen)
        print('request:', reqbody)

        self.send_response(200)
        self.send_header('Content-Type', 'text/plain')
        self.end_headers()
        # Echo
        self.wfile.write(reqbody)


with HTTPServer(ADDR, EchoHTTPRequestHandler) as httpd:
    print('server running @%d' % PORT)
    httpd.serve_forever()


