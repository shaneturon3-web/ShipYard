from pathlib import Path

from shipyard.handoffs import infer_slug_from_folder, seed_handoff_tree
from shipyard.paths import PROJECTS_EXECUTION
from shipyard.project_index import append_slug_to_index


def register_project_folder(proj_dir: Path) -> tuple[str, Path, Path]:
    """Backfill index + handoff for an existing ~/Projects folder."""
    slug = infer_slug_from_folder(proj_dir.name)
    name = proj_dir.name.replace("-", " ").title()
    append_slug_to_index(slug, name)
    handoff = seed_handoff_tree(slug, name, execution_dir=proj_dir)
    return slug, handoff, proj_dir


def register_all_projects(base: Path | None = None) -> list[tuple[str, Path]]:
    root = base or PROJECTS_EXECUTION
    if not root.is_dir():
        return []
    results: list[tuple[str, Path]] = []
    for child in sorted(root.iterdir()):
        if not child.is_dir():
            continue
        slug, handoff, _ = register_project_folder(child)
        results.append((slug, handoff))
    return results
