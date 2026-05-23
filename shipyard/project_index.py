import re
from dataclasses import dataclass
from pathlib import Path

from shipyard.paths import PROJECT_INDEX_DIR, planning_dir_for_slug

ENTRY_RE = re.compile(r"^-\s+`([^`]+)`\s*=\s*(.+?)\s*$")
PHASE_RE = re.compile(r"OPERATIONAL_PHASE=(\w+)")


@dataclass(frozen=True)
class ProjectEntry:
    slug: str
    name: str
    status: str


def _read_phase_for_slug(slug: str) -> str | None:
    state_path = planning_dir_for_slug(slug) / "STATE.md"
    if not state_path.is_file():
        return None
    match = PHASE_RE.search(state_path.read_text(encoding="utf-8"))
    return match.group(1) if match else None


def _entry_status(slug: str) -> str:
    phase = _read_phase_for_slug(slug)
    if phase:
        return phase
    planning = planning_dir_for_slug(slug)
    required = ("INTAKE.md", "STATE.md", "DOMAIN.md")
    if all((planning / name).is_file() for name in required):
        return "handoff-ready"
    return "indexed"


def parse_project_index(index_dir: Path | None = None) -> list[ProjectEntry]:
    root = index_dir or PROJECT_INDEX_DIR
    index_path = root / "PROJECT_INDEX.md"
    if not index_path.is_file():
        return []

    entries: list[ProjectEntry] = []
    for line in index_path.read_text(encoding="utf-8").splitlines():
        match = ENTRY_RE.match(line.strip())
        if not match:
            continue
        slug, description = match.group(1), match.group(2)
        entries.append(
            ProjectEntry(
                slug=slug,
                name=description,
                status=_entry_status(slug),
            )
        )
    return entries


def slug_in_index(slug: str, index_dir: Path | None = None) -> bool:
    normalized = slug.upper().replace("-", "_")
    return any(entry.slug == normalized for entry in parse_project_index(index_dir))


def append_slug_to_index(slug: str, description: str) -> bool:
    """Append slug line if missing. Returns True if index was modified."""
    normalized = slug.upper().replace("-", "_")
    index_path = PROJECT_INDEX_DIR / "PROJECT_INDEX.md"
    if not index_path.parent.is_dir():
        index_path.parent.mkdir(parents=True, exist_ok=True)
    if not index_path.is_file():
        index_path.write_text("# PROJECT_INDEX\n\n", encoding="utf-8")

    text = index_path.read_text(encoding="utf-8")
    if f"`{normalized}`" in text:
        return False

    line = f"- `{normalized}` = {description}\n"
    if not text.endswith("\n"):
        text += "\n"
    index_path.write_text(text + line, encoding="utf-8")
    return True
