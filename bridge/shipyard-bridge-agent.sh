#!/usr/bin/env bash
# ShipYard local execution bridge — polls Worker deploy queue, runs refurbish gate, updates D1 via API.
set -euo pipefail

SHIPYARD_WEB_URL="${SHIPYARD_WEB_URL:-https://shipyard-web.shaneturon3.workers.dev}"
SHIPYARD_BRIDGE_SECRET="${SHIPYARD_BRIDGE_SECRET:-}"
DEFAULT_SLUG="${SHIPYARD_BRIDGE_SLUG:-SHIPYARD}"
POLL_INTERVAL="${SHIPYARD_BRIDGE_POLL_SEC:-30}"
LOG_DIR="${HOME}/CONTROL TOWER/07_LOGS"
ONCE="${SHIPYARD_BRIDGE_ONCE:-0}"
SHIPYARD_REPO="${SHIPYARD_REPO:-${HOME}/ShipYard}"

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

truncate_log() {
  local text="$1"
  local max="${2:-2000}"
  if [[ ${#text} -gt ${max} ]]; then
    printf '%s…' "${text:0:max}"
  else
    printf '%s' "${text}"
  fi
}

run_scaffold() {
  local project_name="$1"
  local slug="$2"
  local log_file
  log_file="$(mktemp "${LOG_DIR}/scaffold-${slug}-XXXX.log")"
  local exit_code=0

  if command -v shipyard >/dev/null 2>&1; then
    shipyard new "${project_name}" >"${log_file}" 2>&1 || exit_code=$?
  elif [[ -d "${SHIPYARD_REPO}" ]]; then
    (
      cd "${SHIPYARD_REPO}"
      python3 -c "from shipyard.tools.new_project_scaffold import create; create('~/Projects', '${project_name}')"
    ) >"${log_file}" 2>&1 || exit_code=$?
  else
    printf 'shipyard CLI and %s not found' "${SHIPYARD_REPO}" >"${log_file}"
    exit_code=1
  fi

  cat "${log_file}"
  return "${exit_code}"
}

execute_instruction() {
  local slug="$1"
  local instruction_json="$2"
  local action project_name log_tail exit_code=0

  action="$(printf '%s' "${instruction_json}" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('action',''))")"
  project_name="$(printf '%s' "${instruction_json}" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('project_name', d.get('note','')))")"

  if [[ "${action}" == "scaffold" && -n "${project_name}" ]]; then
    log_deploy "${slug}" "scaffold start name=${project_name}"
    log_tail="$(run_scaffold "${project_name}" "${slug}" 2>&1)" || exit_code=$?
    log_deploy "${slug}" "scaffold exit=${exit_code}"
    printf '%s' "$(truncate_log "${log_tail}")"
    return "${exit_code}"
  fi

  log_deploy "${slug}" "acknowledge-only instruction action=${action:-none}"
  printf 'bridge completed (no docker instruction executed)'
  return 0
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

  if ! command -v shipyard >/dev/null 2>&1 && [[ ! -d "${SHIPYARD_REPO}" ]]; then
    log_deploy "${slug}" "shipyard CLI and repo missing"
    return 1
  fi

  if ! shipyard refurbish "${slug}" 2>/dev/null; then
    log_deploy "${slug}" "refurbish failed — deploy blocked"
    local id
    id="$(printf '%s' "${queue}" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['pending'][0]['id'])")"
    api_patch "/api/deploy/${slug}/events/${id}" \
      '{"status":"failed","log_tail":"refurbish continuity gaps"}' || true
    return 1
  fi

  local id instruction instruction_raw log_tail exit_code=0
  id="$(printf '%s' "${queue}" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['pending'][0]['id'])")"
  instruction_raw="$(printf '%s' "${queue}" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['pending'][0].get('instruction_json','{}'))")"
  instruction="$(printf '%s' "${instruction_raw}" | python3 -c "import sys,json; print(json.dumps(json.loads(sys.stdin.read())))")"

  api_patch "/api/deploy/${slug}/events/${id}" \
    '{"status":"building","log_tail":"bridge accepted; executing instruction"}'
  log_deploy "${slug}" "event ${id} building instruction=${instruction}"

  log_tail="$(execute_instruction "${slug}" "${instruction}")" || exit_code=$?
  log_tail_escaped="$(printf '%s' "${log_tail}" | python3 -c "import sys,json; print(json.dumps(sys.stdin.read()))")"

  if [[ "${exit_code}" -eq 0 ]]; then
    api_patch "/api/deploy/${slug}/events/${id}" \
      "$(printf '{"status":"live","log_tail":%s}' "${log_tail_escaped}")"
    log_deploy "${slug}" "event ${id} live"
  else
    api_patch "/api/deploy/${slug}/events/${id}" \
      "$(printf '{"status":"failed","log_tail":%s}' "${log_tail_escaped}")"
    log_deploy "${slug}" "event ${id} failed"
    return 1
  fi
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
