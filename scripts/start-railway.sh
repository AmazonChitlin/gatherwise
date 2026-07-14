#!/bin/sh

set -eu

log() {
  printf '[gatherwise-startup] %s\n' "$1"
}

if [ -z "${DATABASE_URL:-}" ] && [ -n "${RAILWAY_VOLUME_MOUNT_PATH:-}" ]; then
  export DATABASE_URL="file:${RAILWAY_VOLUME_MOUNT_PATH}/gatherwise.db"
  log "Configured SQLite database path from Railway volume mount."
fi

if [ -z "${DATABASE_URL:-}" ]; then
  log "DATABASE_URL is required."
  exit 1
fi

lockdir=""

cleanup() {
  if [ -n "$lockdir" ] && [ -d "$lockdir" ]; then
    rmdir "$lockdir" 2>/dev/null || true
  fi
}

trap cleanup EXIT INT TERM

case "$DATABASE_URL" in
  file:*)
    db_path="${DATABASE_URL#file:}"
    db_dir=$(dirname "$db_path")

    mkdir -p "$db_dir"

    lockdir="${db_dir}/.gatherwise-init.lock"
    attempts=0

    while ! mkdir "$lockdir" 2>/dev/null; do
      attempts=$((attempts + 1))
      if [ "$attempts" -ge 60 ]; then
        log "Timed out waiting for the SQLite initialization lock."
        exit 1
      fi

      sleep 1
    done

    log "Running Prisma migrations."
    RUST_LOG="${RUST_LOG:-info}" npx prisma migrate deploy

    log "Seeding verified rules and official sources."
    npm run prisma:seed
    ;;
esac

trap - EXIT INT TERM
cleanup

port="${PORT:-3000}"

log "Starting Gatherwise on port ${port}."
exec npm start -- --port "$port"
