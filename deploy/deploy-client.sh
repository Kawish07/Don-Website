#!/usr/bin/env bash
# deploy/deploy-client.sh
# Build the client and optionally SCP the `dist` to a remote server.

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
CLIENT_DIR="$ROOT_DIR/client"
BUILD_DIR="$CLIENT_DIR/dist"

echo "Building client..."
cd "$CLIENT_DIR"
if [ -f "$ROOT_DIR/.env" ]; then
  echo "Using env file in repo root"
  set -o allexport
  source "$ROOT_DIR/.env"
  set +o allexport
fi

npm ci
npm run build

echo "Client build complete: $BUILD_DIR"

if [ "$#" -ge 2 ]; then
  REMOTE_USER=$1
  REMOTE_HOST=$2
  REMOTE_PATH=${3:-/var/www/my-agency}
  echo "Uploading build to ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}"
  scp -r "$BUILD_DIR"/* "${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}/"
  echo "Upload complete"
else
  echo "No remote target provided; build is available in $BUILD_DIR"
fi
