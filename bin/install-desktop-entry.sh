#!/usr/bin/env bash
set -euo pipefail

SHIPYARD_HOME="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DESKTOP_DIR="${HOME}/.local/share/applications"
DESKTOP_FILE="${DESKTOP_DIR}/shipyard.desktop"
TEMPLATE="${SHIPYARD_HOME}/share/shipyard.desktop"

mkdir -p "${DESKTOP_DIR}"
chmod +x "${SHIPYARD_HOME}/bin/shipyard-launch.sh"

sed "s|@SHIPYARD_HOME@|${SHIPYARD_HOME}|g" "${TEMPLATE}" > "${DESKTOP_FILE}"
chmod 644 "${DESKTOP_FILE}"

if command -v update-desktop-database >/dev/null 2>&1; then
  update-desktop-database "${DESKTOP_DIR}" 2>/dev/null || true
fi

echo "Installed menu entry: ${DESKTOP_FILE}"
