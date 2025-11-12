#!/usr/bin/env python3
"""
Simple HTTP server with CORS headers for FFmpeg.wasm
Works on Windows, Linux, and macOS
"""

import http.server
import socketserver
import os
import sys

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

# Get the directory where this script is located (works on Windows/Linux/Mac)
script_dir = os.path.dirname(os.path.abspath(__file__))
os.chdir(script_dir)

print("="*50)
print(" WouldYouRather.ai Video Generator")
print("="*50)
print()
print(f"🚀 Server running at http://localhost:{PORT}")
print(f"✨ FFmpeg.wasm CORS headers enabled")
print(f"📂 Working directory: {os.getcwd()}")
print()
print("📂 File structure:")
print(f"   ✓ src/index.html exists: {os.path.exists('src/index.html')}")
print(f"   ✓ assets/ exists: {os.path.exists('assets')}")
print(f"   ✓ src/config.js exists: {os.path.exists('src/config.js')}")
print()
print("📂 URL Mappings:")
print("   http://localhost:8080/ → src/index.html")
print("   http://localhost:8080/assets/* → assets/*")
print("   http://localhost:8080/src/* → src/*")
print()
print("Press Ctrl+C to stop")
print("="*50)
print()

Handler = CORSRequestHandler

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n\n👋 Server stopped")
