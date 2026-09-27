"""
AI-Based Sign Language Recognition and Learning System
Local Development & Presentation Server
"""

import http.server
import socketserver
import webbrowser
import os
import sys

PORT = 5500
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

def run():
    os.chdir(DIRECTORY)
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        url = f"http://localhost:{PORT}/index.html"
        print("=" * 65)
        print("  AI-BASED SIGN LANGUAGE RECOGNITION & LEARNING SYSTEM")
        print("  Final Year Diploma Major Project Web Application")
        print("=" * 65)
        print(f"  Server started at: {url}")
        print("  Opening browser automatically...")
        print("  Press Ctrl+C to terminate the server.")
        print("=" * 65)
        
        try:
            webbrowser.open(url)
        except Exception as e:
            print(f"Could not auto-open browser: {e}")
            
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server...")
            httpd.server_close()
            sys.exit(0)

if __name__ == "__main__":
    run()
