#!/usr/bin/env bash
set -euo pipefail

SHIPYARD_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VENV_ACTIVATE="${SHIPYARD_ROOT}/.venv/bin/activate"

PROJECT_SLUGS=()
PROJECT_NAMES=()
PROJECT_STATUS=()

if [[ -f "${HOME}/.machine_env" ]]; then
  # shellcheck disable=SC1091
  source "${HOME}/.machine_env"
fi

if [[ ! -f "${VENV_ACTIVATE}" ]]; then
  echo "ShipYard venv missing. Run: ${SHIPYARD_ROOT}/setup-shipyard.sh"
  read -r -p "Press Enter to close..."
  exit 1
fi

# shellcheck disable=SC1091
source "${VENV_ACTIVATE}"

run_shipyard() {
  shipyard "$@"
}

load_projects() {
  PROJECT_SLUGS=()
  PROJECT_NAMES=()
  PROJECT_STATUS=()
  while IFS=$'\t' read -r slug name status; do
    [[ -n "${slug}" ]] || continue
    PROJECT_SLUGS+=("${slug}")
    PROJECT_NAMES+=("${name}")
    PROJECT_STATUS+=("${status}")
  done < <(python -c "
from shipyard.project_index import parse_project_index
for e in parse_project_index():
    print(f'{e.slug}\t{e.name}\t{e.status}')
")
}

show_projects_numbered() {
  load_projects
  if [[ ${#PROJECT_SLUGS[@]} -eq 0 ]]; then
    echo "  (no projects found in 06_PROJECT_INDEX)"
    return 1
  fi
  echo
  printf "  %-4s %-22s %-28s %s\n" "#" "SLUG" "PROJECT" "STATUS"
  printf "  %-4s %-22s %-28s %s\n" "----" "----------------------" "----------------------------" "----------"
  local i
  for i in "${!PROJECT_SLUGS[@]}"; do
    printf "  %-4d %-22s %-28s %s\n" "$((i + 1))" "${PROJECT_SLUGS[$i]}" "${PROJECT_NAMES[$i]}" "${PROJECT_STATUS[$i]}"
  done
  echo
  return 0
}

pick_project() {
  local prompt="${1:-Select project #}"
  load_projects
  if [[ ${#PROJECT_SLUGS[@]} -eq 0 ]]; then
    echo "No projects in index."
    return 1
  fi

  show_projects_numbered
  echo "   0) Cancel"
  echo "   m) Enter slug manually"
  echo
  read -r -p "${prompt}: " choice
  choice="${choice// /}"

  if [[ -z "${choice}" || "${choice}" == "0" ]]; then
    return 1
  fi

  if [[ "${choice}" == "m" || "${choice}" == "M" ]]; then
    read -r -p "Slug (e.g. PSYNOVA): " choice
    choice="${choice// /}"
    [[ -n "${choice}" ]] || return 1
    echo "${choice}"
    return 0
  fi

  if [[ "${choice}" =~ ^[0-9]+$ ]]; then
    if (( choice >= 1 && choice <= ${#PROJECT_SLUGS[@]} )); then
      echo "${PROJECT_SLUGS[$((choice - 1))]}"
      return 0
    fi
    echo "Invalid number (1–${#PROJECT_SLUGS[@]})."
    return 1
  fi

  echo "${choice}"
  return 0
}

pause() {
  read -r -p $'\nPress Enter to continue...'
}

action_list() {
  clear
  echo "── Controlled projects ──"
  show_projects_numbered || true
  echo "Full table:"
  run_shipyard list
  pause
}

action_sync() {
  clear
  echo "── Sync project ──"
  if slug="$(pick_project "Sync project #")"; then
    run_shipyard sync "${slug}" || true
  else
    echo "Cancelled."
  fi
  pause
}

action_refurbish() {
  clear
  echo "── Refurbish project ──"
  if slug="$(pick_project "Refurbish project #")"; then
    run_shipyard refurbish "${slug}" || true
  else
    echo "Cancelled."
  fi
  pause
}

action_new() {
  clear
  echo "── New project ──"
  read -r -p "Project name: " name
  if [[ -n "${name}" ]]; then
    run_shipyard new "${name}" || true
  else
    echo "Cancelled."
  fi
  pause
}

action_status() {
  clear
  echo "── System status ──"
  echo
  if [[ -f "${HOME}/.machine_env" ]]; then
    echo "  [1] ~/.machine_env     OK"
  else
    echo "  [1] ~/.machine_env     MISSING"
  fi
  mount="${HOME}/mnt/gdrive/CONTROL TOWER"
  if [[ -d "${mount}" ]]; then
    echo "  [2] GDrive mount       OK  (${mount})"
  else
    echo "  [2] GDrive mount       NOT MOUNTED"
  fi
  index="${HOME}/CONTROL TOWER/06_PROJECT_INDEX/PROJECT_INDEX.md"
  if [[ -f "${index}" ]]; then
    load_projects
    echo "  [3] Project index      OK  (${#PROJECT_SLUGS[@]} projects)"
  else
    echo "  [3] Project index      MISSING"
  fi
  echo
  pause
}

action_help() {
  clear
  run_shipyard --help
  pause
}

main_menu() {
  load_projects
  clear
  echo "╔══════════════════════════════════════════╗"
  echo "║  ShipYard — CONTROL TOWER Orchestrator   ║"
  echo "╚══════════════════════════════════════════╝"
  echo
  if [[ ${#PROJECT_SLUGS[@]} -gt 0 ]]; then
    echo "  Projects loaded: ${#PROJECT_SLUGS[@]}"
    local i
    for i in "${!PROJECT_SLUGS[@]}"; do
      [[ $i -ge 3 ]] && break
      printf "    %d) %s\n" "$((i + 1))" "${PROJECT_SLUGS[$i]}"
    done
    if [[ ${#PROJECT_SLUGS[@]} -gt 3 ]]; then
      echo "    … +$(( ${#PROJECT_SLUGS[@]} - 3 )) more (use 1 to list all)"
    fi
    echo
  fi
  echo "  ── Projects ──"
  echo "    1) List all projects (numbered)"
  echo "    2) Sync project"
  echo "    3) Refurbish project"
  echo "    4) New project"
  echo
  echo "  ── System ──"
  echo "    5) Status (env, mount, index)"
  echo "    6) CLI help"
  echo
  echo "    0) Quit"
  echo
}

while true; do
  main_menu
  read -r -p "Choice [0-6]: " choice
  choice="${choice// /}"

  case "${choice}" in
    1) action_list ;;
    2) action_sync ;;
    3) action_refurbish ;;
    4) action_new ;;
    5) action_status ;;
    6) action_help ;;
    0|q|Q) exit 0 ;;
    "")
      ;;
    *)
      if [[ "${choice}" =~ ^[0-9]+$ ]] && load_projects && (( choice >= 1 && choice <= ${#PROJECT_SLUGS[@]} )); then
        slug="${PROJECT_SLUGS[$((choice - 1))]}"
        clear
        echo "── Quick actions: ${slug} ──"
        echo "    1) Sync"
        echo "    2) Refurbish"
        echo "    0) Back"
        read -r -p "Choice: " sub
        case "${sub}" in
          1) run_shipyard sync "${slug}" || true; pause ;;
          2) run_shipyard refurbish "${slug}" || true; pause ;;
          *) ;;
        esac
      else
        echo "Invalid choice. Enter 0–6, or a project # for quick actions."
        sleep 1
      fi
      ;;
  esac
done
