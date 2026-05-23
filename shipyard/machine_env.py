import re
from pathlib import Path

from shipyard.paths import MACHINE_ENV

EXPORT_RE = re.compile(r"^export\s+([A-Za-z_][A-Za-z0-9_]*)=(.*)$")


def load_machine_env(path: Path | None = None) -> dict[str, str]:
    env_path = path or MACHINE_ENV
    if not env_path.is_file():
        return {}

    values: dict[str, str] = {}
    for line in env_path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        match = EXPORT_RE.match(line)
        if not match:
            continue
        key, raw = match.group(1), match.group(2)
        values[key] = raw.strip().strip('"').strip("'")
    return values


def machine_env_present(path: Path | None = None) -> bool:
    return (path or MACHINE_ENV).is_file()
