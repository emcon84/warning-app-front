#!/usr/bin/env bash
#
# Deploy script for warning-app-front (Next.js)
# Runs on the VPS. Invoked by GitHub Actions (see .github/workflows/deploy.yml)
# or manually:  bash deploy.sh
#
# Features:
#   - Lock file (no concurrent deploys)
#   - Atomic build: backs up .next, builds fresh, restores on failure
#   - Automatic rollback to previous commit if build or health check fails
#   - Timestamped logging to /var/www/logs/
#
set -euo pipefail

# bun is installed under /root/.bun/bin (not on PATH for non-interactive SSH)
export PATH="/root/.bun/bin:$PATH"

APP_DIR="/var/www/warning-app-front"
PM2_NAME="warning-app-front"
PORT=3000
LOG_DIR="/var/www/logs"
LOG_FILE="${LOG_DIR}/warning-app-front-deploy.log"
LOCK_FILE="/tmp/warning-app-front-deploy.lock"
BACKUP_DIR="${APP_DIR}/.next-old"

mkdir -p "${LOG_DIR}"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "${LOG_FILE}"; }

# ── Concurrency lock ──────────────────────────────────────────────────────────
exec 9>"${LOCK_FILE}"
if ! flock -n 9; then
  log "Otro deploy en curso. Saliendo."
  exit 0
fi

# ── Prerequisites ────────────────────────────────────────────────────────────
if [ ! -d "${APP_DIR}/.git" ]; then
  log "ERROR: ${APP_DIR} no es un repo git."
  exit 1
fi
cd "${APP_DIR}"

PREV_COMMIT="$(git rev-parse HEAD)"
log "Deploy iniciado. Commit previo: ${PREV_COMMIT}"

# ── Fetch + reset to origin/main ─────────────────────────────────────────────
log "Fetching origin/main..."
git fetch origin main --prune
git reset --hard origin/main
NEW_COMMIT="$(git rev-parse HEAD)"
log "Reseteado a origin/main: ${NEW_COMMIT}"

if [ "${NEW_COMMIT}" = "${PREV_COMMIT}" ]; then
  log "Ya estamos en el último commit (${NEW_COMMIT}). Deploy no necesita cambios de código; continuo con install/build."
fi

# ── Install dependencies ─────────────────────────────────────────────────────
log "Instalando dependencias (bun install)..."
if ! bun install --frozen-lockfile; then
  log "ERROR: bun install falló."
  git reset --hard "${PREV_COMMIT}"
  log "Rollback de código a ${PREV_COMMIT}."
  exit 1
fi

# ── Stop front (nginx shows maintenance page) ────────────────────────────────
log "Deteniendo ${PM2_NAME} (maintenance page activa)..."
pm2 stop "${PM2_NAME}" 2>/dev/null || true

# ── Backup current build ─────────────────────────────────────────────────────
if [ -d "${BACKUP_DIR}" ]; then
  rm -rf "${BACKUP_DIR}"
fi
if [ -d "${APP_DIR}/.next" ]; then
  log "Backup del build actual a .next-old..."
  mv "${APP_DIR}/.next" "${BACKUP_DIR}"
fi

# ── Build ────────────────────────────────────────────────────────────────────
log "Buildando (next build --webpack)..."
if ! bun run build; then
  log "ERROR: build falló. Restaurando build previo y código..."
  rm -rf "${APP_DIR}/.next"
  [ -d "${BACKUP_DIR}" ] && mv "${BACKUP_DIR}" "${APP_DIR}/.next"
  git reset --hard "${PREV_COMMIT}"
  pm2 restart "${PM2_NAME}" 2>/dev/null || true
  log "Rollback completado. Deploy ABORTADO."
  exit 1
fi
log "Build OK."

# ── Start front ──────────────────────────────────────────────────────────────
log "Iniciando ${PM2_NAME}..."
pm2 restart "${PM2_NAME}"

# ── Health check ─────────────────────────────────────────────────────────────
sleep 5
if curl -fsS -o /dev/null "http://localhost:${PORT}/"; then
  log "Health check OK (HTTP 200 en /)."
else
  log "ERROR: health check falló. Ejecutando rollback..."
  rm -rf "${BACKUP_DIR}" 2>/dev/null || true
  git reset --hard "${PREV_COMMIT}"
  # Restore previous build if it exists (e.g. build left a bad .next)
  if [ -d "${BACKUP_DIR}" ]; then
    rm -rf "${APP_DIR}/.next"
    mv "${BACKUP_DIR}" "${APP_DIR}/.next"
  fi
  pm2 restart "${PM2_NAME}" 2>/dev/null || true
  sleep 4
  if curl -fsS -o /dev/null "http://localhost:${PORT}/"; then
    log "Rollback OK, servicio restaurado."
  else
    log "ERROR CRÍTICO: rollback falló, intervención manual requerida."
  fi
  exit 1
fi

# ── Cleanup ──────────────────────────────────────────────────────────────────
[ -d "${BACKUP_DIR}" ] && rm -rf "${BACKUP_DIR}"
log "Deploy completado OK en ${NEW_COMMIT}."
