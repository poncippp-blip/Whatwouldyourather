#!/usr/bin/env python3
"""
Simple HTTP server with CORS headers for FFmpeg.wasm
Enables SharedArrayBuffer and Workers for video export
Serves from project root to access both src/ and assets/ directories
"""

import http.server
import socketserver
import os

class CORSRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Required headers for SharedArrayBuffer (FFmpeg.wasm)
        self.send_header('Cross-Origin-Opener-Policy', 'same-origin')
        self.send_header('Cross-Origin-Embedder-Policy', 'require-corp')
        # CORS headers
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        super().end_headers()

    def translate_path(self, path):
        # Serve index.html from /src/ as the root
        if path == '/':
            path = '/src/index.html'
        elif not path.startswith('/assets/') and not path.startswith('/src/'):
            # Redirect all other paths to /src/
            path = '/src' + path
        return super().translate_path(path)

PORT = 8080

# Change to project root directory
os.chdir('/home/user/Whatwouldyourather')

Handler = CORSRequestHandler

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"🚀 Server running at http://localhost:{PORT}")
    print(f"✨ FFmpeg.wasm CORS headers enabled")
    print(f"📂 Serving from: {os.getcwd()}")
    print(f"📂 index.html: /src/index.html")
    print(f"📂 assets: /assets/")
    print("\nPress Ctrl+C to stop")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n\n👋 Server stopped")
