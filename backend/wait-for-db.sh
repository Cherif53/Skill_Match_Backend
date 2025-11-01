#!/bin/sh
set -e

HOST="${POSTGRES_HOST:-skillmatch_db}"
PORT="${POSTGRES_PORT:-5432}"

echo "⌛ Waiting for PostgreSQL at $HOST:$PORT..."
until nc -z "$HOST" "$PORT"; do
  sleep 1
done

echo "✅ PostgreSQL is up!"

exec "$@"
