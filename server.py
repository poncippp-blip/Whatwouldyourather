#!/usr/bin/env python3
"""
Simple HTTP server with CORS headers for FFmpeg.wasm
Enables SharedArrayBuffer and Workers for video export
Serves from project root to access both src/ and assets/ directories
"""

import http.server
import socketserver
import os
from urllib.parse import unquote

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

    def do_GET(self):
        # Decode the URL path
        path = unquote(self.path.split('?')[0])

        # Map root to index.html
        if path == '/':
            self.path = '/src/index.html'
        # Keep /assets/ paths as-is
        elif path.startswith('/assets/'):
            self.path = path
        # Keep /src/ paths as-is
        elif path.startswith('/src/'):
            self.path = path
        # All other paths go to /src/
        else:
            self.path = '/src' + path

        # Call parent GET handler
        return super().do_GET()

PORT = 8080

# Change to project root directory
os.chdir('/home/user/Whatwouldyourather')

Handler = CORSRequestHandler

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print("="*40)
    print(" WouldYouRather.ai Video Generator")
    print(" Starting server with CORS headers...")
    print("="*40)
    print()
    print(f"🚀 Server running at http://localhost:{PORT}")
    print(f"✨ FFmpeg.wasm CORS headers enabled")
    print(f"📂 Serving from: {os.getcwd()}")
    print(f"📂 Root: {os.getcwd()}/src/index.html")
    print(f"📂 Assets: {os.getcwd()}/assets/")
    print()
    print("Press Ctrl+C to stop the server")
    print("="*40)
    print()
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n\n👋 Server stopped")
