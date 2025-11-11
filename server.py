#!/usr/bin/env python3
"""
Simple HTTP server with CORS headers for FFmpeg.wasm
Fixed version with proper path resolution
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

PORT = 8080

# Change to project root directory BEFORE creating server
os.chdir('/home/user/Whatwouldyourather')

print("="*40)
print(" WouldYouRather.ai Video Generator")
print("="*40)
print()
print(f"🚀 Server running at http://localhost:{PORT}")
print(f"✨ FFmpeg.wasm CORS headers enabled")
print(f"📂 Working directory: {os.getcwd()}")
print()
print("📂 URL Mappings:")
print("   / → src/index.html")
print("   /css/* → src/css/*")
print("   /js/* → src/js/*")
print("   /config.js → src/config.js")
print("   /assets/* → assets/*")
print()
print("Press Ctrl+C to stop")
print("="*40)
print()

Handler = CORSRequestHandler

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n\n👋 Server stopped")
