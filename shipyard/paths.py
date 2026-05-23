from pathlib import Path

HOME = Path.home()
CONTROL_TOWER = HOME / "CONTROL TOWER"
PROJECT_INDEX_DIR = CONTROL_TOWER / "06_PROJECT_INDEX"
HANDOFF_ROOT = CONTROL_TOWER / "05_HANDOFFS"
HANDOFF_PLANNING = HANDOFF_ROOT / "planning"
HANDOFF_PROJECTS = HANDOFF_ROOT / "projects"
PROJECTS_EXECUTION = HOME / "Projects"
GDRIVE_MOUNT = HOME / "mnt" / "gdrive" / "CONTROL TOWER"
MACHINE_ENV = HOME / ".machine_env"
SYNC_SCRIPT = CONTROL_TOWER / "09_SYNCHRONIZATION" / "sync_control_tower.sh"
ARCHITECT_TEMPLATE = (
    Path(__file__).resolve().parent / "tools" / "architect_chat_starter_prompt.md"
)
NOTEBOOKLM_TEMPLATE = HANDOFF_PROJECTS / "_TEMPLATE" / "NOTEBOOKLM_ENTRY.md"


def normalize_slug(slug: str) -> str:
    return slug.upper().replace("-", "_")


def handoff_root_for_slug(slug: str) -> Path:
    normalized = normalize_slug(slug)
    if normalized == "CONTROL_TOWER":
        return HANDOFF_ROOT
    return HANDOFF_PROJECTS / normalized


def planning_dir_for_slug(slug: str) -> Path:
    root = handoff_root_for_slug(slug)
    if normalize_slug(slug) == "CONTROL_TOWER":
        return root / "planning"
    return root / "planning"
