#!/usr/bin/env bash
# Starts both the DevTinder backend and frontend dev servers together.
# Usage: ./dev.sh
# Press Ctrl+C to stop both.

set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_PORT=1234
FRONTEND_PORT=5173

cleanup() {
  echo ""
  echo "Stopping servers..."
  lsof -ti:$BACKEND_PORT -sTCP:LISTEN | xargs -r kill 2>/dev/null
  lsof -ti:$FRONTEND_PORT -sTCP:LISTEN | xargs -r kill 2>/dev/null
}
trap cleanup EXIT INT TERM

# Free the ports first in case a previous run is still hanging around
lsof -ti:$BACKEND_PORT -sTCP:LISTEN | xargs -r kill 2>/dev/null
lsof -ti:$FRONTEND_PORT -sTCP:LISTEN | xargs -r kill 2>/dev/null
sleep 1

echo "Starting backend on port $BACKEND_PORT..."
(cd "$ROOT_DIR/backend" && npm run dev) &

echo "Starting frontend on port $FRONTEND_PORT..."
(cd "$ROOT_DIR/Frontend" && npm run dev) &

echo ""
echo "Backend:  http://localhost:$BACKEND_PORT"
echo "Frontend: http://localhost:$FRONTEND_PORT"
echo "Press Ctrl+C to stop both."
echo ""

wait
