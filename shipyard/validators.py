import subprocess
from pathlib import Path

from shipyard.paths import GDRIVE_MOUNT, MACHINE_ENV

MOUNT_CHECK_SCRIPT = """
set -euo pipefail
HOME="${HOME:?}"
MOUNT="${HOME}/mnt/gdrive/CONTROL TOWER"
if [[ ! -d "${MOUNT}" ]]; then
  echo "mount_missing"
  exit 1
fi
if [[ ! -f "${MOUNT}/06_PROJECT_INDEX/PROJECT_INDEX.md" ]]; then
  echo "index_missing"
  exit 2
fi
if [[ -f "${HOME}/.machine_env" ]]; then
  # shellcheck disable=SC1091
  source "${HOME}/.machine_env"
fi
echo "ok"
"""


def validate_gdrive_mount(mount: Path | None = None) -> tuple[bool, str]:
    target = mount or GDRIVE_MOUNT
    if not target.is_dir():
        return False, f"Rclone mount point not found at {target}"

    result = subprocess.run(
        ["bash", "-c", MOUNT_CHECK_SCRIPT],
        capture_output=True,
        text=True,
        check=False,
    )
    detail = (result.stdout or result.stderr).strip().splitlines()
    message = detail[-1] if detail else "unknown"
    if result.returncode == 0 and message == "ok":
        return True, str(target)
    if message == "index_missing":
        return False, f"Mount exists but PROJECT_INDEX is missing under {target}"
    return False, f"Mount validation failed ({message})"


def validate_machine_env() -> tuple[bool, str]:
    if not MACHINE_ENV.is_file():
        return False, f"Missing {MACHINE_ENV} (required before sync)"
    return True, str(MACHINE_ENV)
