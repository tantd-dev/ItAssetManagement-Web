#!/usr/bin/env bash
# Rebuilds and redeploys the web app on the VPS.
#
# Usage: ./deploy.sh              build, replace web, wait until healthy
#        TAG=abc1234 ./deploy.sh  tag the image (the CI passes the short commit hash)
# Run it inside tmux/screen: an interrupted deploy leaves containers half-replaced.
set -euo pipefail

cd "$(dirname "$0")"

HEALTH_TIMEOUT_SECONDS=${HEALTH_TIMEOUT_SECONDS:-90}

log() {
  printf '\n[%s] %s\n' "$(date +%H:%M:%S)" "$*"
}

if [[ ! -f .env ]]; then
  echo "Missing .env (copy .env.example and fill it in first)." >&2
  exit 1
fi

log 'Building image'
docker compose build web

log 'Replacing web'
docker compose up -d --remove-orphans

log "Waiting for web to become healthy (up to ${HEALTH_TIMEOUT_SECONDS}s)"
deadline=$((SECONDS + HEALTH_TIMEOUT_SECONDS))
until [[ "$(docker inspect --format '{{.State.Health.Status}}' "$(docker compose ps -q web)" 2>/dev/null)" == 'healthy' ]]; do
  if ((SECONDS >= deadline)); then
    echo 'web did not become healthy. Recent logs:' >&2
    docker compose logs --tail 50 web >&2
    exit 1
  fi
  sleep 2
done
echo 'web is healthy'

log 'Removing dangling images'
docker image prune -f >/dev/null

log 'Deploy finished'
docker compose ps
