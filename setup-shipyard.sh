#!/bin/bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${ROOT}"

if ! command -v python3 >/dev/null 2>&1; then
  echo "python3 required"
  exit 1
fi

if [ ! -d .venv ]; then
  python3 -m venv .venv
fi
# shellcheck disable=SC1091
source .venv/bin/activate

pip install --upgrade pip
pip install -e .

echo "=== ShipYard ready ==="
echo "Activate: source ${ROOT}/.venv/bin/activate"
echo "Test: shipyard list"
echo "Menu: ${ROOT}/bin/install-desktop-entry.sh"
