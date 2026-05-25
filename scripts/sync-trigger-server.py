#!/usr/bin/env python3
"""
Tiny HTTP listener that triggers com.inburo.brain-sync on demand.

Designed to sit behind `cloudflared`, which terminates HTTPS on a public
hostname and forwards plaintext to 127.0.0.1:BRAIN_SYNC_PORT. The remote
caller authenticates with a shared secret in the X-Brain-Sync-Secret header.

Environment:
  BRAIN_SYNC_SECRET   required; ≥32 random bytes (openssl rand -hex 32)
  BRAIN_SYNC_PORT     optional; defaults to 8765

Endpoints:
  POST /sync   200 if launchctl start succeeded
               401 if missing/bad secret
               404 for any other path
               500 if launchctl failed

Binds 127.0.0.1 only — never expose this port directly to the internet.
The whole security model assumes cloudflared is the only thing in front of it.
"""

from __future__ import annotations

import hmac
import http.server
import os
import subprocess
import sys

PORT = int(os.environ.get("BRAIN_SYNC_PORT", "8765"))
SECRET = os.environ.get("BRAIN_SYNC_SECRET", "")
LAUNCHD_LABEL = "com.inburo.brain-sync"

if not SECRET or len(SECRET) < 32:
    print(
        "ERROR: BRAIN_SYNC_SECRET unset or shorter than 32 chars. "
        "Generate with: openssl rand -hex 32",
        file=sys.stderr,
    )
    sys.exit(1)


class Handler(http.server.BaseHTTPRequestHandler):
    def do_POST(self) -> None:
        if self.path != "/sync":
            self._reply(404, "not found\n")
            return

        provided = self.headers.get("X-Brain-Sync-Secret", "")
        if not hmac.compare_digest(provided, SECRET):
            self._reply(401, "unauthorized\n")
            return

        try:
            subprocess.run(
                ["launchctl", "start", LAUNCHD_LABEL],
                check=True,
                timeout=5,
                capture_output=True,
            )
        except subprocess.CalledProcessError as e:
            stderr = e.stderr.decode("utf-8", "replace") if e.stderr else ""
            self._reply(500, f"launchctl exit {e.returncode}: {stderr}\n")
            return
        except subprocess.TimeoutExpired:
            self._reply(500, "launchctl timeout\n")
            return

        self._reply(200, "sync triggered\n")

    def do_GET(self) -> None:
        if self.path == "/health":
            self._reply(200, "ok\n")
        else:
            self._reply(404, "POST /sync only\n")

    def _reply(self, code: int, body: str) -> None:
        payload = body.encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "text/plain; charset=utf-8")
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

    def log_message(self, fmt: str, *args: object) -> None:
        sys.stderr.write(
            "[%s] %s\n" % (self.log_date_time_string(), fmt % args)
        )


def main() -> None:
    httpd = http.server.HTTPServer(("127.0.0.1", PORT), Handler)
    print(f"brain-sync trigger listening on 127.0.0.1:{PORT}", flush=True)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        httpd.server_close()


if __name__ == "__main__":
    main()
