#!/usr/bin/env bash
# ShipYard local execution bridge — polls Worker deploy queue, runs refurbish gate, updates D1 via API.
set -euo pipefail

SHIPYARD_WEB_URL="${SHIPYARD_WEB_URL:-https://shipyard-web.shaneturon3.workers.dev}"
SHIPYARD_BRIDGE_SECRET="${SHIPYARD_BRIDGE_SECRET:-}"
DEFAULT_SLUG="${SHIPYARD_BRIDGE_SLUG:-SHIPYARD}"
POLL_INTERVAL="${SHIPYARD_BRIDGE_POLL_SEC:-30}"
LOG_DIR="${HOME}/CONTROL TOWER/07_LOGS"
ONCE="${SHIPYARD_BRIDGE_ONCE:-0}"

if [[ -z "${SHIPYARD_BRIDGE_SECRET}" ]]; then
  echo "ERROR: Set SHIPYARD_BRIDGE_SECRET (wrangler secret put SHIPYARD_BRIDGE_SECRET)" >&2
  exit 1
fi

if [[ -f "${HOME}/.machine_env" ]]; then
  # shellcheck source=/dev/null
  source "${HOME}/.machine_env"
fi

auth_header() {
  printf 'Authorization: Bearer %s' "${SHIPYARD_BRIDGE_SECRET}"
}

api_get() {
  local path="$1"
  curl -fsS -H "$(auth_header)" "${SHIPYARD_WEB_URL}${path}"
}

api_patch() {
  local path="$1"
  local body="$2"
  curl -fsS -X PATCH -H "$(auth_header)" -H "content-type: application/json" \
    -d "${body}" "${SHIPYARD_WEB_URL}${path}"
}

log_deploy() {
  local slug="$1"
  local msg="$2"
  mkdir -p "${LOG_DIR}"
  printf '%s %s %s\n' "$(date -Iseconds)" "${slug}" "${msg}" >> "${LOG_DIR}/shipyard-bridge.log"
}

process_slug() {
  local slug="$1"
  local queue
  queue="$(api_get "/api/deploy/${slug}/queue")"
  local count
  count="$(printf '%s' "${queue}" | python3 -c "import sys,json; print(len(json.load(sys.stdin).get('pending',[])))")"
  if [[ "${count}" -eq 0 ]]; then
    return 0
  fi

  log_deploy "${slug}" "pending=${count}"

  if ! command -v shipyard >/dev/null 2>&1; then
    log_deploy "${slug}" "shipyard CLI missing"
    return 1
  fi

  if ! shipyard refurbish "${slug}"; then
    log_deploy "${slug}" "refurbish failed — deploy blocked"
    local id
    id="$(printf '%s' "${queue}" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['pending'][0]['id'])")"
    api_patch "/api/deploy/${slug}/events/${id}" \
      '{"status":"failed","log_tail":"refurbish continuity gaps"}' || true
    return 1
  fi

  local id instruction
  id="$(printf '%s' "${queue}" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['pending'][0]['id'])")"
  instruction="$(printf '%s' "${queue}" | python3 -c "import sys,json; print(json.load(sys.stdin)['pending'][0].get('instruction_json','{}'))")"

  api_patch "/api/deploy/${slug}/events/${id}" \
    '{"status":"building","log_tail":"bridge accepted; semantic router only — no docker auto-run"}'
  log_deploy "${slug}" "event ${id} building instruction=${instruction}"

  # Operator-approved docker steps belong here; default is acknowledge-only (Workers never exec shell).
  api_patch "/api/deploy/${slug}/events/${id}" \
    '{"status":"live","log_tail":"bridge completed (no docker instruction executed)"}'
  log_deploy "${slug}" "event ${id} live"
}

main_loop() {
  while true; do
    process_slug "${DEFAULT_SLUG}" || true
    if [[ "${ONCE}" == "1" ]]; then
      break
    fi
    sleep "${POLL_INTERVAL}"
  done
}

main_loop
