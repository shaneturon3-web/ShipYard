from datetime import date, datetime
from pathlib import Path

from shipyard.paths import (
    ARCHITECT_TEMPLATE,
    NOTEBOOKLM_TEMPLATE,
    handoff_root_for_slug,
    normalize_slug,
    planning_dir_for_slug,
)


def _architect_prompt_text() -> str:
    if ARCHITECT_TEMPLATE.is_file():
        return ARCHITECT_TEMPLATE.read_text(encoding="utf-8")
    return "# Architect Chat Starter Prompt\n\nYou are the Architect for this CONTROL TOWER project.\n"


def _notebooklm_entry_text(slug: str) -> str:
    normalized = normalize_slug(slug)
    if NOTEBOOKLM_TEMPLATE.is_file():
        text = NOTEBOOKLM_TEMPLATE.read_text(encoding="utf-8")
        return text.replace("<SLUG>", normalized)
    return f"""# NotebookLM Entry — {normalized}

See `04_GLOBAL_RULES/NOTEBOOKLM-ARCHITECTURE-SPECIFICATION.md`.
Notebook: `CT-{normalized}-Architect`
"""


def seed_handoff_tree(
    slug: str,
    project_name: str,
    execution_dir: Path | None = None,
) -> Path:
    """Create or refresh 05_HANDOFFS/projects/<SLUG>/ packet."""
    normalized = normalize_slug(slug)
    root = handoff_root_for_slug(normalized)
    planning = planning_dir_for_slug(normalized)

    ref_dirs = [
        "references/client-docs",
        "references/source-app",
        "references/platform",
        "references/samples",
    ]
    plan_dirs = ["planning/sprints/001-discovery-architecture"]
    for rel in ref_dirs + plan_dirs:
        (root / rel).mkdir(parents=True, exist_ok=True)

    if not (planning / "INTAKE.md").is_file():
        (planning / "INTAKE.md").write_text(
            f"""# INTAKE - {project_name}

Date: {date.today()}
Status: Draft
Slug: `{normalized}`

## Business Context
- Goal / Problem:
- Stakeholders / Users:

## Key Workflows
## Business Rules & Edge Cases
## Acceptance Criteria
""",
            encoding="utf-8",
        )

    for name in ("STATE.md", "DOMAIN.md", "FILE_INVENTORY.md"):
        path = planning / name
        if not path.is_file():
            path.write_text(f"# {name.replace('.md', '')} - {project_name}\n\n", encoding="utf-8")

    if not (planning / "sprints/001-discovery-architecture/blueprint.md").is_file():
        (planning / "sprints/001-discovery-architecture/blueprint.md").write_text(
            f"# Blueprint - {project_name}\n\n## Overview\n## Architecture\n",
            encoding="utf-8",
        )
    if not (planning / "sprints/001-discovery-architecture/acceptance.md").is_file():
        (planning / "sprints/001-discovery-architecture/acceptance.md").write_text(
            f"# Acceptance - {project_name}\n\n## Definition of Done\n",
            encoding="utf-8",
        )

    project_start = root / "project-start.md"
    if not project_start.is_file():
        project_start.write_text(
            f"""# Project Start — {normalized}

Declare operational phase before work:

```
OPERATIONAL_PHASE=Research|Architectural|Engineering
```

## Handoff checklist

- [ ] `planning/INTAKE.md` populated (Research)
- [ ] `planning/STATE.md` and `planning/DOMAIN.md` locked (Architectural)
- [ ] `~/.machine_env` present on this node (Engineering)
- [ ] `references/client-docs/` contains source materials

See `04_GLOBAL_RULES/CONTROL_TOWER-OPERATIONAL-PROTOCOL.md`.
""",
            encoding="utf-8",
        )

    cloud_entry = root / "CLOUD_AI_ENTRY.md"
    if not cloud_entry.is_file():
        cloud_entry.write_text(_architect_prompt_text(), encoding="utf-8")

    nlm_entry = root / "NOTEBOOKLM_ENTRY.md"
    if not nlm_entry.is_file():
        nlm_entry.write_text(_notebooklm_entry_text(normalized), encoding="utf-8")

    exec_path = execution_dir.resolve() if execution_dir else None
    pointer = root / "EXECUTION_POINTER.md"
    if exec_path:
        pointer.write_text(
            f"""# Execution workspace

**Slug:** `{normalized}`
**Path:** `{exec_path}`
**Updated:** {datetime.now().isoformat(timespec="seconds")}

Builder (Cursor) works in the execution path above after `OPERATIONAL_PHASE=Engineering`.
Architect packet lives in this handoff folder (synced via CONTROL TOWER).
""",
            encoding="utf-8",
        )

    return root


def infer_slug_from_folder(folder_name: str) -> str:
    """20260520-my-app -> MY_APP"""
    parts = folder_name.split("-", 1)
    tail = parts[1] if len(parts) > 1 and parts[0].isdigit() else folder_name
    return tail.upper().replace("-", "_")
