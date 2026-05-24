import subprocess
from pathlib import Path

import typer
from rich.console import Console
from rich.table import Table

from shipyard.paths import PROJECT_INDEX_DIR, SYNC_SCRIPT
from shipyard.project_index import (
    append_slug_to_index,
    hidden_project_entries,
    parse_project_index,
    slug_in_index,
)
from shipyard.refurbish import scan_continuity
from shipyard.register import register_all_projects, register_project_folder
from shipyard.tools.new_project_scaffold import create
from shipyard.validators import validate_gdrive_mount, validate_machine_env

app = typer.Typer(help="CONTROL TOWER Project Orchestrator (ShipYard)")
console = Console()


def _normalize_slug(slug: str) -> str:
    return slug.upper().replace("-", "_")


@app.command("list")
def list_cmd(
    show_all: bool = typer.Option(
        False,
        "--all",
        help="Include slugs listed in HIDDEN_SLUGS.md (marked hidden).",
    ),
):
    """Overview of all projects parsed from 06_PROJECT_INDEX"""
    if not PROJECT_INDEX_DIR.is_dir():
        console.print(f"[red]Project index not found at {PROJECT_INDEX_DIR}[/red]")
        raise typer.Exit(code=1)

    entries = parse_project_index()
    if show_all:
        visible_slugs = {e.slug for e in entries}
        entries = entries + [
            e for e in hidden_project_entries() if e.slug not in visible_slugs
        ]
    table = Table(
        title="ShipYard Controlled Projects"
        + (" (including hidden)" if show_all else "")
    )
    table.add_column("Slug", style="cyan")
    table.add_column("Project Name", style="magenta")
    table.add_column("Status", style="green")

    if not entries:
        console.print(
            f"[yellow]No projects parsed from {PROJECT_INDEX_DIR / 'PROJECT_INDEX.md'}[/yellow]"
        )
    else:
        for entry in entries:
            style = "dim" if entry.status == "hidden" else None
            table.add_row(entry.slug, entry.name, entry.status, style=style)

    console.print(table)


@app.command()
def sync(slug: str):
    """Validate environment and mount; run sync dry-run; print apply command."""
    normalized = _normalize_slug(slug)
    if not slug_in_index(normalized):
        console.print(f"[red]Unknown slug: {normalized}[/red]")
        raise typer.Exit(code=1)

    env_ok, env_msg = validate_machine_env()
    if not env_ok:
        console.print(f"[red]Error: {env_msg}[/red]")
        raise typer.Exit(code=1)

    mount_ok, mount_msg = validate_gdrive_mount()
    if not mount_ok:
        console.print(f"[red]Error: {mount_msg}[/red]")
        raise typer.Exit(code=1)

    console.print(f"[green]Mount validated at {mount_msg}[/green]")
    console.print(f"[green]Syncing semantic packet for {normalized}...[/green]")

    if SYNC_SCRIPT.is_file():
        console.print("[dim]Running sync_control_tower.sh --dry-run ...[/dim]")
        result = subprocess.run(
            ["bash", str(SYNC_SCRIPT), "--dry-run"],
            capture_output=True,
            text=True,
        )
        if result.stdout:
            console.print(result.stdout.rstrip())
        if result.stderr:
            console.print(f"[dim]{result.stderr.rstrip()}[/dim]")
        if result.returncode != 0:
            console.print("[yellow]Dry-run reported issues; review log before apply[/yellow]")
    else:
        console.print("[yellow]sync_control_tower.sh not found; mount check passed only[/yellow]")

    home = Path.home()
    sync_script = home / "CONTROL TOWER" / "09_SYNCHRONIZATION" / "sync_control_tower.sh"
    console.print(
        f"[bold green]Validation passed. Run: '{sync_script} --apply' to complete transfer.[/bold green]"
    )
    ct_sync = home / "bin" / "control-tower-sync.sh"
    if ct_sync.is_file():
        console.print(f"[dim]Or mount-first: '{ct_sync} --apply'[/dim]")


@app.command()
def refurbish(slug: str):
    """Scan handoffs and planning directories to surface missing continuity gaps"""
    normalized = _normalize_slug(slug)
    console.print(f"Refurbishing {normalized} tracking files...")

    gaps = scan_continuity(normalized)
    if not gaps:
        console.print(f"[green]{normalized}: continuity checks passed[/green]")
        return

    table = Table(title=f"Continuity gaps — {normalized}")
    table.add_column("Area", style="cyan")
    table.add_column("Detail", style="yellow")
    for gap in gaps:
        table.add_row(gap.area, gap.detail)
    console.print(table)
    raise typer.Exit(code=1)


@app.command()
def new(name: str, base: str = typer.Option("~/Projects", help="Execution base directory")):
    """Create new CONTROL TOWER project scaffold (execution + handoff packet)"""
    create(base, name)


@app.command()
def register(
    slug: str = typer.Argument(None, help="Slug or folder name under ~/Projects"),
    all_projects: bool = typer.Option(
        False,
        "--all",
        help="Register every directory under ~/Projects",
    ),
):
    """Backfill PROJECT_INDEX and 05_HANDOFFS/projects for existing workspaces"""
    if all_projects:
        results = register_all_projects()
        if not results:
            console.print("[yellow]No project folders found under ~/Projects[/yellow]")
            return
        for s, handoff in results:
            console.print(f"[green]Registered {s} → {handoff}[/green]")
        return

    if not slug:
        console.print("[red]Provide SLUG or use --all[/red]")
        raise typer.Exit(code=1)

    normalized = _normalize_slug(slug)
    from shipyard.paths import PROJECTS_EXECUTION

    candidates = list(PROJECTS_EXECUTION.glob(f"*-{slug.lower().replace('_', '-')}"))
    candidates += list(PROJECTS_EXECUTION.glob(f"*{slug}*"))
    proj_dir = None
    for c in candidates:
        if c.is_dir():
            proj_dir = c
            break

    if proj_dir:
        s, handoff, _ = register_project_folder(proj_dir)
        console.print(f"[green]Registered {s} from {proj_dir}[/green]")
        console.print(f"  Handoff: {handoff}")
    else:
        append_slug_to_index(normalized, slug.replace("_", " ").title())
        from shipyard.handoffs import seed_handoff_tree

        handoff = seed_handoff_tree(normalized, slug.replace("_", " ").title())
        console.print(f"[green]Indexed {normalized} (no ~/Projects folder matched)[/green]")
        console.print(f"  Handoff: {handoff}")


if __name__ == "__main__":
    app()
