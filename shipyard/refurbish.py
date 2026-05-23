from dataclasses import dataclass
from pathlib import Path

from shipyard.machine_env import machine_env_present
from shipyard.paths import handoff_root_for_slug, normalize_slug, planning_dir_for_slug
from shipyard.project_index import slug_in_index

REQUIRED_PLANNING = ("INTAKE.md", "STATE.md", "DOMAIN.md", "FILE_INVENTORY.md")
META_SLUGS = frozenset({"CONTROL_TOWER", "SUGARCUBE_DOCTRINE"})


@dataclass(frozen=True)
class ContinuityGap:
    area: str
    detail: str


def _unchecked_checklist_items(project_start: Path) -> list[str]:
    if not project_start.is_file():
        return ["project-start.md missing"]
    gaps: list[str] = []
    for line in project_start.read_text(encoding="utf-8").splitlines():
        stripped = line.strip()
        if stripped.startswith("- [ ]"):
            gaps.append(stripped[5:].strip())
    return gaps


def scan_continuity(slug: str) -> list[ContinuityGap]:
    normalized = normalize_slug(slug)
    gaps: list[ContinuityGap] = []

    if not slug_in_index(normalized):
        gaps.append(ContinuityGap("index", f"Slug `{normalized}` not found in PROJECT_INDEX.md"))

    planning = planning_dir_for_slug(normalized)
    handoff_root = handoff_root_for_slug(normalized)

    if not planning.is_dir():
        gaps.append(ContinuityGap("handoffs", f"Planning directory missing: {planning}"))
        return gaps

    for filename in REQUIRED_PLANNING:
        path = planning / filename
        if not path.is_file():
            gaps.append(ContinuityGap("planning", f"Missing {filename}"))

    if normalized not in META_SLUGS:
        project_start = handoff_root / "project-start.md"
        for item in _unchecked_checklist_items(project_start):
            gaps.append(ContinuityGap("checklist", f"Unchecked: {item}"))

    if normalized not in META_SLUGS:
        pointer = handoff_root / "EXECUTION_POINTER.md"
        if not pointer.is_file():
            gaps.append(ContinuityGap("execution", "EXECUTION_POINTER.md missing"))
        cloud_entry = handoff_root / "CLOUD_AI_ENTRY.md"
        if not cloud_entry.is_file():
            gaps.append(ContinuityGap("cloud-ai", "CLOUD_AI_ENTRY.md missing"))

    if not machine_env_present():
        gaps.append(ContinuityGap("environment", "~/.machine_env not present on this node"))

    return gaps
