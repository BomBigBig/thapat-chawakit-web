import http.server
import socketserver

PORT = 8080

class NoCacheHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    extensions_map = {
        '': 'application/octet-stream',
        '.manifest': 'text/cache-manifest',
        '.html': 'text/html',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.svg': 'image/svg+xml',
        '.css': 'text/css',
        '.js': 'application/javascript',
        '.json': 'application/json',
        '.xml': 'application/xml',
    }
    
    def end_headers(self):
        self.send_my_headers()
        http.server.SimpleHTTPRequestHandler.end_headers(self)

    def send_my_headers(self):
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")

Handler = NoCacheHTTPRequestHandler

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"Serving at port {PORT} with no caching...")
    httpd.serve_forever()
