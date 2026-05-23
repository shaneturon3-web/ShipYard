from datetime import date, datetime
from pathlib import Path

from shipyard.handoffs import seed_handoff_tree
from shipyard.paths import ARCHITECT_TEMPLATE, PROJECTS_EXECUTION, normalize_slug
from shipyard.project_index import append_slug_to_index


def _architect_prompt_text() -> str:
    if ARCHITECT_TEMPLATE.is_file():
        return ARCHITECT_TEMPLATE.read_text(encoding="utf-8")
    return "# Architect Chat Starter Prompt\n\nYou are the Architect.\n"


def create(base_dir: str, project_name: str) -> tuple[Path, Path]:
    """Create execution tree and CONTROL TOWER handoff packet. Returns (exec_dir, handoff_root)."""
    base_path = Path(base_dir).expanduser() if base_dir else PROJECTS_EXECUTION
    slug_kebab = project_name.lower().replace(" ", "-").replace("_", "-")
    slug = normalize_slug(slug_kebab)
    ts = datetime.now().strftime("%Y%m%d")
    proj_dir = base_path / f"{ts}-{slug_kebab}"

    dirs = [
        "references/client-docs",
        "references/source-app",
        "references/platform",
        "references/samples",
        "planning/sprints/001-discovery-architecture",
    ]
    for d in dirs:
        (proj_dir / d).mkdir(parents=True, exist_ok=True)

    architect_text = _architect_prompt_text()

    (proj_dir / "planning/INTAKE.md").write_text(
        f"""# INTAKE - {project_name}

Date: {date.today()}
Status: Draft
Slug: `{slug}`

## Business Context
- Goal / Problem:
- Stakeholders / Users:

## Key Workflows
## Business Rules & Edge Cases
## Acceptance Criteria
""",
        encoding="utf-8",
    )

    (proj_dir / "planning/project-start.md").write_text(
        """# Project Start Checklist
**Handoff Status:** READY

01. Complete planning/INTAKE.md
02. Open CLOUD_AI_ENTRY.md in CONTROL TOWER handoff (Architect chat)
03. Generate Architect Pack 001 into handoff planning/
04. shipyard refurbish <SLUG> then shipyard sync <SLUG>
05. Builder opens EXECUTION_POINTER.md path
""",
        encoding="utf-8",
    )

    for name in ("STATE.md", "DOMAIN.md", "FILE_INVENTORY.md"):
        (proj_dir / "planning" / name).write_text(
            f"# {name.replace('.md', '')} - {project_name}\n\n",
            encoding="utf-8",
        )

    (proj_dir / "planning/architect-chat-starter-prompt.md").write_text(
        architect_text,
        encoding="utf-8",
    )

    (proj_dir / "planning/sprints/001-discovery-architecture/blueprint.md").write_text(
        f"# Blueprint - {project_name}\n\n## Overview\n## Architecture\n## Modules\n## Data Model\n",
        encoding="utf-8",
    )

    (proj_dir / "planning/sprints/001-discovery-architecture/acceptance.md").write_text(
        f"# Acceptance - {project_name}\n\n## Functional\n## Edge Cases\n## Definition of Done\n",
        encoding="utf-8",
    )

    (proj_dir / "README.md").write_text(
        f"""# {project_name}

CONTROL TOWER project • Managed by ShipYard

**Handoff (Cloud AI):** `~/CONTROL TOWER/05_HANDOFFS/projects/{slug}/`
**Next Step:** Open `planning/INTAKE.md`
""",
        encoding="utf-8",
    )

    append_slug_to_index(slug, project_name)
    handoff_root = seed_handoff_tree(slug, project_name, execution_dir=proj_dir)

    print(f"✅ Execution workspace: {proj_dir.resolve()}")
    print(f"✅ Handoff packet: {handoff_root.resolve()}")
    return proj_dir, handoff_root
