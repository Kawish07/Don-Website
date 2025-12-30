#!/bin/bash
# deploy/pm2-start.sh
# Usage: edit env values then run: sudo bash deploy/pm2-start.sh

APP_DIR="/path/to/my-agency/server"
PM2_NAME="my-agency-api"
NODE_ENV=production

# Load .env if present (recommended)
if [ -f "$APP_DIR/.env" ]; then
	echo "Loading env from $APP_DIR/.env"
	set -o allexport
	source "$APP_DIR/.env"
	set +o allexport
fi

# Ensure required vars exist
if [ -z "$MONGO_URI" ] || [ -z "$JWT_SECRET" ]; then
	echo "ERROR: MONGO_URI and JWT_SECRET must be set in $APP_DIR/.env or environment." >&2
	exit 1
fi

export PORT=${PORT:-5000}
export NODE_ENV

cd "$APP_DIR" || exit 1
npm ci --only=production
pm2 start index.js --name "$PM2_NAME" --update-env --env production
pm2 save
pm2 startup systemd -u $(whoami) --hp $(eval echo ~$USER) || true

echo "Started $PM2_NAME on port $PORT. Edit deploy/nginx.conf to point uploads alias to $APP_DIR/uploads and reload nginx." 