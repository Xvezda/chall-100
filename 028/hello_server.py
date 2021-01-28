import webbrowser
from http.server import HTTPServer, BaseHTTPRequestHandler

PORT = 3001
ADDR = ('', PORT)


class HelloHTTPRequestHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-Type', 'text/plain')
        self.end_headers()
        self.wfile.write(b'hello world from server')


with HTTPServer(ADDR, HelloHTTPRequestHandler) as httpd:
    print('server running @%d' % PORT)
    # webbrowser.open_new_tab('http://localhost:%d/' % PORT)
    httpd.serve_forever()

